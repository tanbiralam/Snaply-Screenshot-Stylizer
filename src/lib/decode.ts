// Lazy image-decoder registry.
//
// The canvas encode pipeline only knows how to *read* what the browser decodes
// natively (PNG/JPEG/WebP/GIF/BMP/ICO/AVIF). This adds extra formats by decoding
// them to pixels ourselves and handing back a drawable source.
//
// The pure `*ToRGBA` / `icnsExtractPng` functions take an ArrayBuffer and do no
// DOM work, so they run (and are tested) in plain Node. The DOM wrappers below
// turn their output into a canvas.
//
// ── Adding a lib-backed format (HEIC/TIFF/PSD) later ──────────────────────────
// Those are NOT browser-native and need a decoder library. To enable, e.g. HEIC:
//   npm i heic-to
//   case "heic": case "heif": {
//     const { heicTo } = await import("heic-to");          // lazy — only this path
//     return createImageBitmap(await heicTo({ blob: file, type: "image/png" }));
//   }
// (TIFF → `utif`, PSD → `ag-psd` follow the same shape.) Dynamic import keeps the
// weight out of the main bundle, per the lazy-load architecture invariant.

export type DecodedSource = ImageBitmap | HTMLCanvasElement;

// Formats the browser decodes on its own.
const NATIVE_EXT = ["png", "jpg", "jpeg", "jfif", "webp", "gif", "bmp", "ico", "avif"];
// Formats we decode by hand below.
const PURE_EXT = ["ppm", "pgm", "pbm", "tga", "icns"];
const NATIVE = new Set(NATIVE_EXT);
const PURE = new Set(PURE_EXT);

export const SUPPORTED_INPUT = [...NATIVE_EXT, ...PURE_EXT].sort();

export function extOf(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

/** Whether we can decode this file at all (used to filter dropped files). */
export function canDecode(file: File): boolean {
  const ext = extOf(file.name);
  return NATIVE.has(ext) || PURE.has(ext) || file.type.startsWith("image/");
}

/** Whether an <img> can show the original directly (else: wait for the encode). */
export function isPreviewable(file: File): boolean {
  return NATIVE.has(extOf(file.name)) || file.type.startsWith("image/");
}

export async function decodeImage(file: File): Promise<DecodedSource> {
  const ext = extOf(file.name);
  switch (ext) {
    case "ppm":
    case "pgm":
    case "pbm":
      return rgbaToCanvas(pnmToRGBA(await file.arrayBuffer()));
    case "tga":
      return rgbaToCanvas(tgaToRGBA(await file.arrayBuffer()));
    case "icns": {
      const png = icnsExtractPng(await file.arrayBuffer());
      if (!png) throw new Error("No PNG icon inside ICNS");
      return createImageBitmap(new Blob([png], { type: "image/png" }));
    }
    default:
      // Native formats (and anything with a real image/* MIME) go straight to
      // the browser decoder.
      return createImageBitmap(file);
  }
}

// ─── DOM glue ─────────────────────────────────────────────────────────────────

interface RGBA {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

function rgbaToCanvas({ width, height, data }: RGBA): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  return canvas;
}

// ─── Pure decoders (no DOM — unit-testable in Node) ─────────────────────────────

/** Netpbm: P2/P3 (ASCII) and P5/P6 (binary), 8- or 16-bit samples. */
export function pnmToRGBA(buf: ArrayBuffer): RGBA {
  const b = new Uint8Array(buf);
  let i = 0;
  const isWS = (c: number) => c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d;
  const skipWS = () => {
    while (i < b.length) {
      if (b[i] === 0x23) {
        while (i < b.length && b[i] !== 0x0a) i++; // comment to EOL
      } else if (isWS(b[i])) i++;
      else break;
    }
  };
  const token = () => {
    skipWS();
    let s = "";
    while (i < b.length && !isWS(b[i]) && b[i] !== 0x23) s += String.fromCharCode(b[i++]);
    return s;
  };

  const magic = token();
  const width = parseInt(token(), 10);
  const height = parseInt(token(), 10);
  const maxval = parseInt(token(), 10);
  if (!width || !height) throw new Error("bad PNM header");

  const out = new Uint8ClampedArray(width * height * 4);
  const scale = (v: number) => (maxval === 255 ? v : Math.round((v / maxval) * 255));
  const gray = magic === "P2" || magic === "P5";

  if (magic === "P2" || magic === "P3") {
    for (let p = 0; p < width * height; p++) {
      const di = p * 4;
      if (gray) {
        const g = scale(parseInt(token(), 10));
        out[di] = out[di + 1] = out[di + 2] = g;
      } else {
        out[di] = scale(parseInt(token(), 10));
        out[di + 1] = scale(parseInt(token(), 10));
        out[di + 2] = scale(parseInt(token(), 10));
      }
      out[di + 3] = 255;
    }
  } else if (magic === "P5" || magic === "P6") {
    i++; // single whitespace separating header from binary data
    const wide = maxval > 255;
    const sample = () => {
      const v = wide ? (b[i] << 8) | b[i + 1] : b[i];
      i += wide ? 2 : 1;
      return scale(v);
    };
    for (let p = 0; p < width * height; p++) {
      const di = p * 4;
      if (gray) {
        const g = sample();
        out[di] = out[di + 1] = out[di + 2] = g;
      } else {
        out[di] = sample();
        out[di + 1] = sample();
        out[di + 2] = sample();
      }
      out[di + 3] = 255;
    }
  } else {
    throw new Error(`Unsupported PNM type ${magic}`);
  }
  return { width, height, data: out };
}

/**
 * TGA: truecolor 24/32-bit and grayscale 8-bit, uncompressed (type 2/3) and
 * RLE (type 10/11). ponytail: covers the formats real exporters emit; skips
 * color-mapped and 16-bit (rare) — add a branch if a sample ever needs them.
 */
export function tgaToRGBA(buf: ArrayBuffer): RGBA {
  const b = new Uint8Array(buf);
  const dv = new DataView(buf);
  const idLen = b[0];
  const cmType = b[1];
  const imgType = b[2];
  const width = dv.getUint16(12, true);
  const height = dv.getUint16(14, true);
  const bpp = b[16];
  const topOrigin = (b[17] & 0x20) !== 0;
  const bytesPerPx = bpp / 8;

  let off = 18 + idLen;
  if (cmType === 1) {
    const cmLen = dv.getUint16(5, true);
    const cmEntry = b[7];
    off += Math.ceil((cmLen * cmEntry) / 8);
  }

  const pixels = width * height;
  let raw: Uint8Array;
  if (imgType === 10 || imgType === 11) {
    raw = new Uint8Array(pixels * bytesPerPx);
    let sp = off;
    let dp = 0;
    while (dp < raw.length) {
      const packet = b[sp++];
      const count = (packet & 0x7f) + 1;
      if (packet & 0x80) {
        for (let k = 0; k < count; k++) {
          for (let c = 0; c < bytesPerPx; c++) raw[dp + c] = b[sp + c];
          dp += bytesPerPx;
        }
        sp += bytesPerPx;
      } else {
        for (let k = 0; k < count * bytesPerPx; k++) raw[dp++] = b[sp++];
      }
    }
  } else {
    raw = b.subarray(off, off + pixels * bytesPerPx);
  }

  const out = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const outRow = topOrigin ? y : height - 1 - y;
    for (let x = 0; x < width; x++) {
      const sp = (y * width + x) * bytesPerPx;
      const di = (outRow * width + x) * 4;
      if (bpp === 32) {
        out[di] = raw[sp + 2];
        out[di + 1] = raw[sp + 1];
        out[di + 2] = raw[sp];
        out[di + 3] = raw[sp + 3];
      } else if (bpp === 24) {
        out[di] = raw[sp + 2];
        out[di + 1] = raw[sp + 1];
        out[di + 2] = raw[sp];
        out[di + 3] = 255;
      } else {
        // 8-bit grayscale
        out[di] = out[di + 1] = out[di + 2] = raw[sp];
        out[di + 3] = 255;
      }
    }
  }
  return { width, height, data: out };
}

/**
 * ICNS holds several icon sizes; modern ones embed a PNG per size. Return the
 * bytes of the largest embedded PNG (by IHDR width). null if there's none.
 */
export function icnsExtractPng(buf: ArrayBuffer): Uint8Array | null {
  const b = new Uint8Array(buf);
  const dv = new DataView(buf);
  // 'icns' magic
  if (b[0] !== 0x69 || b[1] !== 0x63 || b[2] !== 0x6e || b[3] !== 0x73) return null;

  let off = 8; // skip magic + total file size
  let best: { png: Uint8Array; w: number } | null = null;
  while (off + 8 <= b.length) {
    const len = dv.getUint32(off + 4, false); // includes the 8-byte header
    if (len < 8 || off + len > b.length) break;
    const ds = off + 8;
    if (b[ds] === 0x89 && b[ds + 1] === 0x50 && b[ds + 2] === 0x4e && b[ds + 3] === 0x47) {
      const png = b.subarray(ds, off + len);
      const w = dv.getUint32(ds + 16, false); // IHDR width
      if (!best || w > best.w) best = { png, w };
    }
    off += len;
  }
  return best ? best.png : null;
}
