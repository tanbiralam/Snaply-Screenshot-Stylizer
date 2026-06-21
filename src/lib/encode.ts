// Encoders for formats canvas.toBlob() can't produce natively.
//
// `encodeBmp` is pure (ImageData → bytes) and unit-tested in Node. `encodeIco`
// needs a real canvas (it embeds a PNG), so it lives here with the DOM glue.

/**
 * 24-bit BGR Windows BMP. Bottom-up rows, 4-byte row padding. BMP has no alpha,
 * so transparency is flattened onto white (same choice as JPEG output).
 */
export function encodeBmp(width: number, height: number, rgba: Uint8ClampedArray): Uint8Array {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buf = new Uint8Array(fileSize);
  const dv = new DataView(buf.buffer);

  // BITMAPFILEHEADER (14 bytes)
  buf[0] = 0x42; // 'B'
  buf[1] = 0x4d; // 'M'
  dv.setUint32(2, fileSize, true);
  dv.setUint32(10, 54, true); // offset to pixel data

  // BITMAPINFOHEADER (40 bytes)
  dv.setUint32(14, 40, true);
  dv.setInt32(18, width, true);
  dv.setInt32(22, height, true); // positive height ⇒ bottom-up
  dv.setUint16(26, 1, true); // planes
  dv.setUint16(28, 24, true); // bits per pixel
  dv.setUint32(34, pixelArraySize, true);
  dv.setInt32(38, 2835, true); // ~72 DPI (pixels/metre)
  dv.setInt32(42, 2835, true);

  let p = 54;
  for (let fileRow = 0; fileRow < height; fileRow++) {
    const y = height - 1 - fileRow; // first file row = bottom image row
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const a = rgba[si + 3] / 255;
      buf[p++] = Math.round(rgba[si + 2] * a + 255 * (1 - a)); // B
      buf[p++] = Math.round(rgba[si + 1] * a + 255 * (1 - a)); // G
      buf[p++] = Math.round(rgba[si] * a + 255 * (1 - a)); // R
    }
    for (let pad = width * 3; pad < rowSize; pad++) buf[p++] = 0;
  }
  return buf;
}

/**
 * ICO containing a single PNG image. ICO entries cap at 256px per side, so the
 * canvas is downscaled to fit if larger.
 */
export async function encodeIco(canvas: HTMLCanvasElement): Promise<Blob> {
  const MAX = 256;
  let src = canvas;
  if (canvas.width > MAX || canvas.height > MAX) {
    const s = Math.min(MAX / canvas.width, MAX / canvas.height);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(canvas.width * s));
    c.height = Math.max(1, Math.round(canvas.height * s));
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, c.width, c.height);
    src = c;
  }

  const pngBlob = await new Promise<Blob | null>((res) => src.toBlob(res, "image/png"));
  if (!pngBlob) throw new Error("PNG encode failed");
  const png = new Uint8Array(await pngBlob.arrayBuffer());

  const head = new Uint8Array(6 + 16);
  const dv = new DataView(head.buffer);
  dv.setUint16(0, 0, true); // reserved
  dv.setUint16(2, 1, true); // type: 1 = icon
  dv.setUint16(4, 1, true); // image count
  head[6] = src.width >= 256 ? 0 : src.width; // 0 means 256
  head[7] = src.height >= 256 ? 0 : src.height;
  head[8] = 0; // palette count
  head[9] = 0; // reserved
  dv.setUint16(10, 1, true); // colour planes
  dv.setUint16(12, 32, true); // bits per pixel
  dv.setUint32(14, png.length, true); // image data size
  dv.setUint32(18, head.length, true); // offset to image data

  return new Blob([head, png], { type: "image/x-icon" });
}
