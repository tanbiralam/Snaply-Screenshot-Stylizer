"use client";

import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { StyleSettings } from "@/types";
import { ImageIcon, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useTheme } from "next-themes";
import {
  drawDeviceFrame,
  getDeviceColors,
  getDeviceLayout,
} from "@/lib/deviceMockups";
import { cn } from "@/lib/utils";

interface CanvasRendererProps {
  image: string | null;
  settings: StyleSettings;
}

export interface CanvasRendererRef {
  exportImage: (
    format?: "png" | "jpeg" | "webp",
    quality?: number
  ) => string | null;
  /** Width ÷ height of the currently loaded image, or null. */
  getImageAspectRatio: () => number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the top-left position to center a box on the canvas,
 * compensating for shadow offset so the visual center stays true.
 * Snaps to full pixels to avoid sub-pixel blur.
 */
const getCenteredPosition = (
  canvasWidth: number,
  canvasHeight: number,
  boxWidth: number,
  boxHeight: number,
  shadowOffsetX: number,
  shadowOffsetY: number
) => {
  const x = Math.round((canvasWidth - boxWidth) / 2 - shadowOffsetX / 2);
  const y = Math.round((canvasHeight - boxHeight) / 2 - shadowOffsetY / 2);
  return { x, y };
};

/**
 * Given an aspect ratio setting and the content bounding box size + padding,
 * returns the canvas dimensions that satisfy the ratio constraint while never
 * cropping the content.
 */
const getAspectRatioDimensions = (
  aspectRatio: StyleSettings["aspectRatio"],
  boxWidth: number,
  boxHeight: number,
  padding: number
) => {
  const contentWidth = boxWidth + padding * 2;
  const contentHeight = boxHeight + padding * 2;

  switch (aspectRatio) {
    case "1:1": {
      const size = Math.max(contentWidth, contentHeight);
      return { width: size, height: size };
    }
    case "16:9": {
      const width = Math.max(contentWidth, (contentHeight * 16) / 9);
      const height = Math.max(contentHeight, (contentWidth * 9) / 16);
      return { width, height };
    }
    case "4:5": {
      const width = Math.max(contentWidth, (contentHeight * 4) / 5);
      const height = Math.max(contentHeight, (contentWidth * 5) / 4);
      return { width, height };
    }
    case "9:16": {
      const width = Math.max(contentWidth, (contentHeight * 9) / 16);
      const height = Math.max(contentHeight, (contentWidth * 16) / 9);
      return { width, height };
    }
    default:
      return { width: contentWidth, height: contentHeight };
  }
};

/**
 * Draws a premium film-grain noise overlay on the background only.
 *
 * The grain is composited over the full background with "overlay" blending
 * which interacts with the existing colours for an analogue, filmic look.
 * The screenshot content rectangle is excluded using a clipping region built
 * with the even-odd fill rule, so the actual screenshot pixel data is never
 * touched.
 */
function drawGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  contentR: number
) {
  if (intensity <= 0) return;

  const scale = 2;
  const nw = Math.ceil(w / scale);
  const nh = Math.ceil(h / scale);

  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = nw;
  noiseCanvas.height = nh;
  const nc = noiseCanvas.getContext("2d");
  if (!nc) return;

  const imageData = nc.createImageData(nw, nh);
  const data = imageData.data;
  const maxAlpha = (intensity / 100) * 0.55;

  for (let i = 0; i < data.length; i += 4) {
    const luma = Math.random() * 255;
    data[i]     = Math.max(0, Math.min(255, luma + (Math.random() - 0.5) * 14));
    data[i + 1] = luma;
    data[i + 2] = Math.max(0, Math.min(255, luma + (Math.random() - 0.5) * 14));
    data[i + 3] = Math.random() * maxAlpha * 255;
  }
  nc.putImageData(imageData, 0, 0);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  const r = Math.min(contentR, contentW / 2, contentH / 2);
  ctx.moveTo(contentX + r, contentY);
  ctx.lineTo(contentX + contentW - r, contentY);
  ctx.quadraticCurveTo(contentX + contentW, contentY, contentX + contentW, contentY + r);
  ctx.lineTo(contentX + contentW, contentY + contentH - r);
  ctx.quadraticCurveTo(contentX + contentW, contentY + contentH, contentX + contentW - r, contentY + contentH);
  ctx.lineTo(contentX + r, contentY + contentH);
  ctx.quadraticCurveTo(contentX, contentY + contentH, contentX, contentY + contentH - r);
  ctx.lineTo(contentX, contentY + r);
  ctx.quadraticCurveTo(contentX, contentY, contentX + r, contentY);
  ctx.closePath();
  ctx.clip("evenodd");

  ctx.globalCompositeOperation = "overlay";
  ctx.drawImage(noiseCanvas, 0, 0, w, h);

  ctx.restore();
}

/**
 * Draws a rounded rectangle path on the given context.
 * Radius is clamped to half the shortest side so it never exceeds the box.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws the image inside the content area using letterboxing (object-fit:
 * contain semantics). If the image ratio matches the content area, it fills
 * edge-to-edge; if not, neutral padding bars are added inside the frame
 * so the image is never stretched or cropped.
 */
function drawImageLetterboxed(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  contentRadius: number
) {
  const imgRatio = img.width / img.height;
  const areaRatio = contentW / contentH;

  let drawW: number;
  let drawH: number;
  let drawX: number;
  let drawY: number;

  if (imgRatio > areaRatio) {
    // Image is wider than the content area — pillarbox (top/bottom bars)
    drawW = contentW;
    drawH = contentW / imgRatio;
    drawX = contentX;
    drawY = contentY + (contentH - drawH) / 2;
  } else if (imgRatio < areaRatio) {
    // Image is taller — letterbox (left/right bars)
    drawH = contentH;
    drawW = contentH * imgRatio;
    drawX = contentX + (contentW - drawW) / 2;
    drawY = contentY;
  } else {
    // Exact match — fill the full content area
    drawW = contentW;
    drawH = contentH;
    drawX = contentX;
    drawY = contentY;
  }

  // Clip to the content rounded rectangle, then draw the image.
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, contentX, contentY, contentW, contentH, contentRadius);
  ctx.clip();

  // Fill letterbox background with a neutral very-dark-or-light tone.
  // Using a semi-transparent black so it blends with the device frame colour.
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(contentX, contentY, contentW, contentH);

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}

// ─── Zoom controller bar ─────────────────────────────────────────────────────

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;

interface ZoomBarProps {
  zoom: number | null;   // null = auto-fit
  autoFitScale: number;  // the computed auto-fit scale
  onZoomChange: (z: number | null) => void;
}

const ZoomBar = ({ zoom, autoFitScale, onZoomChange }: ZoomBarProps) => {
  const effectiveScale = zoom ?? autoFitScale;
  const pct = Math.round(effectiveScale * 100);
  const isAuto = zoom === null;

  const step = (delta: number) => {
    const base = zoom ?? autoFitScale;
    const next = Math.round((base + delta) * 10) / 10;
    onZoomChange(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next)));
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border border-border/50",
        "bg-card/90 backdrop-blur-sm shadow-lg px-1.5 py-1",
        "select-none"
      )}
    >
      {/* Zoom out */}
      <button
        type="button"
        onClick={() => step(-ZOOM_STEP)}
        disabled={effectiveScale <= ZOOM_MIN}
        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground disabled:opacity-30"
        title="Zoom out"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>

      {/* Percentage readout */}
      <span className="w-10 text-center font-mono text-[11px] font-medium text-foreground">
        {pct}%
      </span>

      {/* Zoom in */}
      <button
        type="button"
        onClick={() => step(ZOOM_STEP)}
        disabled={effectiveScale >= ZOOM_MAX}
        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground disabled:opacity-30"
        title="Zoom in"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>

      {/* Divider */}
      <div className="mx-0.5 h-4 w-px bg-border/60" />

      {/* Fit button */}
      <button
        type="button"
        onClick={() => onZoomChange(null)}
        className={cn(
          "flex h-6 items-center justify-center rounded-lg px-2 text-[10px] font-semibold transition-colors",
          isAuto
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
        title="Fit to screen"
      >
        Fit
      </button>

      {/* 100% button */}
      <button
        type="button"
        onClick={() => onZoomChange(1)}
        className={cn(
          "flex h-6 items-center justify-center rounded-lg px-2 text-[10px] font-semibold transition-colors",
          !isAuto && Math.abs(effectiveScale - 1) < 0.01
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
        title="100% — actual pixel size"
      >
        <Maximize2 className="mr-1 h-2.5 w-2.5" />
        100%
      </button>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const CanvasRenderer = forwardRef<
  CanvasRendererRef,
  CanvasRendererProps
>(({ image, settings }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoFitScaleRef = useRef(1);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const [containerWidth, setContainerWidth] = useState(700);
  const [containerHeight, setContainerHeight] = useState(500);
  const [isLoading, setIsLoading] = useState(false);
  // null = auto-fit; number = explicit zoom multiplier
  const [zoomLevel, setZoomLevel] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Load image from data URL whenever the image prop changes.
  useEffect(() => {
    if (image) {
      setIsLoading(true);
      const img = new Image();
      img.onload = () => {
        setLoadedImage(img);
        // Reset zoom when a new image is loaded
        setZoomLevel(null);
        setTimeout(() => setIsLoading(false), 200);
      };
      img.onerror = () => {
        setIsLoading(false);
        setLoadedImage(null);
      };
      img.src = image;
    } else {
      setLoadedImage(null);
      setIsLoading(false);
      setZoomLevel(null);
    }
  }, [image]);

  // Keep track of the container's rendered size so we can scale the preview.
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Recompute canvas dimensions when image, aspect ratio, padding, or mockup changes.
  useEffect(() => {
    if (!loadedImage) return;
    const layout = getDeviceLayout(
      settings.deviceMockup,
      loadedImage.width,
      loadedImage.height,
      settings.borderRadius
    );
    const { width, height } = getAspectRatioDimensions(
      settings.aspectRatio,
      layout.frameWidth,
      layout.frameHeight,
      settings.padding
    );
    setCanvasSize({ width, height });
  }, [
    loadedImage,
    settings.aspectRatio,
    settings.padding,
    settings.deviceMockup,
    settings.borderRadius,
  ]);

  // Ctrl+wheel to zoom.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoomLevel((prev) => {
        const base = prev ?? autoFitScaleRef.current;
        const next = Math.round((base + delta) * 10) / 10;
        return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next));
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // autoFitScaleRef is a stable ref; wheel reads current value via ref.current.
  }, []);

  /**
   * Core draw routine shared by the live preview and the 2x export path.
   *
   * Drawing order:
   *   1. Background (gradient or solid colour)
   *   2. Blurred backdrop (optional glassmorphism effect)
   *   2b. Grain overlay (background only)
   *   3. Drop shadow
   *   4. Device frame chrome
   *   5. Screenshot (letterboxed inside content area)
   */
  const drawToContext = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      canvasW: number,
      canvasH: number
    ) => {
      ctx.clearRect(0, 0, canvasW, canvasH);

      // --- 1. Background ---
      if (settings.useGradient) {
        const gradient = ctx.createLinearGradient(0, 0, canvasW, canvasH);
        gradient.addColorStop(0, settings.gradientStart);
        gradient.addColorStop(1, settings.gradientEnd);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = settings.backgroundColor;
      }
      ctx.fillRect(0, 0, canvasW, canvasH);

      if (!loadedImage) return;

      const layout = getDeviceLayout(
        settings.deviceMockup,
        loadedImage.width,
        loadedImage.height,
        settings.borderRadius
      );

      // Shadow offset — only vertical so the shadow falls naturally below.
      const shadowOffsetX = 0;
      const shadowOffsetY =
        settings.shadowIntensity > 0 ? settings.shadowIntensity / 2 : 0;

      // Top-left corner of the entire device frame bounding box on the canvas.
      const { x: frameX, y: frameY } = getCenteredPosition(
        canvasW,
        canvasH,
        layout.frameWidth,
        layout.frameHeight,
        shadowOffsetX,
        shadowOffsetY
      );

      // --- 2. Blurred backdrop ---
      if (settings.blurBackground) {
        ctx.save();
        ctx.filter = "blur(40px) saturate(1.2)";
        ctx.globalAlpha = 0.7;
        ctx.drawImage(loadedImage, -80, -80, canvasW + 160, canvasH + 160);
        ctx.restore();

        if (settings.useGradient) {
          const gradient = ctx.createLinearGradient(0, 0, canvasW, canvasH);
          gradient.addColorStop(0, settings.gradientStart + "90");
          gradient.addColorStop(1, settings.gradientEnd + "90");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvasW, canvasH);
        }
      }

      const frameOuterRadius =
        settings.deviceMockup === "none" ? settings.borderRadius : 14;

      // --- 2b. Grain overlay (background only) ---
      if (settings.grainIntensity > 0) {
        const gX = frameX + layout.contentX;
        const gY = frameY + layout.contentY;
        drawGrain(
          ctx,
          canvasW,
          canvasH,
          settings.grainIntensity,
          gX,
          gY,
          layout.contentWidth,
          layout.contentHeight,
          layout.contentRadius
        );
      }

      // --- 3. Drop shadow ---
      if (settings.shadowIntensity > 0) {
        ctx.save();
        ctx.shadowColor = `rgba(0, 0, 0, ${settings.shadowIntensity / 100})`;
        ctx.shadowBlur = settings.shadowIntensity * 1.5;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;

        ctx.beginPath();
        roundRect(
          ctx,
          frameX,
          frameY,
          layout.frameWidth,
          layout.frameHeight,
          frameOuterRadius
        );
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.restore();
      }

      // --- 4. Device frame chrome ---
      if (settings.deviceMockup !== "none") {
        const colors = getDeviceColors(isDark);
        drawDeviceFrame(
          ctx,
          settings.deviceMockup,
          frameX,
          frameY,
          layout,
          colors,
          frameOuterRadius
        );
      }

      // --- 5. Screenshot — letterboxed to content area ---
      const contentX = frameX + layout.contentX;
      const contentY = frameY + layout.contentY;

      drawImageLetterboxed(
        ctx,
        loadedImage,
        contentX,
        contentY,
        layout.contentWidth,
        layout.contentHeight,
        layout.contentRadius
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadedImage, settings, isDark]
  );

  // Trigger a preview redraw whenever any relevant state changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawToContext(ctx, canvas.width, canvas.height);
  }, [drawToContext, canvasSize]);

  // Expose exportImage and getImageAspectRatio to parent via ref.
  useImperativeHandle(ref, () => ({
    exportImage: (
      format: "png" | "jpeg" | "webp" = "png",
      quality: number = 0.95
    ) => {
      const canvas = canvasRef.current;
      if (!canvas || !loadedImage) return null;

      const exportCanvas = document.createElement("canvas");
      const scale = 2;
      exportCanvas.width = canvas.width * scale;
      exportCanvas.height = canvas.height * scale;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) return null;

      ctx.scale(scale, scale);
      drawToContext(ctx, canvas.width, canvas.height);

      const mimeType =
        format === "png"
          ? "image/png"
          : format === "jpeg"
            ? "image/jpeg"
            : "image/webp";
      return exportCanvas.toDataURL(mimeType, quality);
    },
    getImageAspectRatio: () => {
      if (!loadedImage) return null;
      return loadedImage.width / loadedImage.height;
    },
  }));

  // ── Zoom / scaling ──────────────────────────────────────────────────────────

  const availableW = Math.max(120, containerWidth - 48);
  const availableH = Math.max(120, containerHeight - 96); // leave room for zoom bar
  const autoFitScale = Math.min(
    1,
    availableW / canvasSize.width,
    availableH / canvasSize.height
  );
  // Keep the ref current so the wheel handler can read it without going stale.
  autoFitScaleRef.current = autoFitScale;

  const effectiveScale = zoomLevel ?? autoFitScale;
  const displayWidth  = Math.round(canvasSize.width  * effectiveScale);
  const displayHeight = Math.round(canvasSize.height * effectiveScale);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-1 flex-col items-center justify-center min-h-[360px] bg-gradient-to-br from-background to-accent/10 rounded-xl border border-border/60 overflow-hidden"
    >
      {/* ── Canvas preview ── */}
      <div
        className="relative rounded-lg overflow-hidden bg-card/80 transition-shadow duration-200"
        style={{
          width: displayWidth,
          height: displayHeight,
          boxShadow: image
            ? "0 12px 40px -22px rgba(0, 0, 0, 0.45)"
            : "0 0 0 1px hsl(var(--border) / 0.7)",
          opacity: isLoading ? 0.85 : 1,
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ width: displayWidth, height: displayHeight }}
          className="block"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">
                Processing...
              </p>
            </div>
          </div>
        )}

        {!image && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/90 backdrop-blur-sm border-2 border-dashed border-border/50 rounded-xl">
            <div className="p-4 rounded-full bg-muted/50">
              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <div className="text-center px-6">
              <p className="text-muted-foreground font-medium">Preview Area</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Upload a screenshot to see the magic
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Zoom controller (only when an image is loaded) ── */}
      {image && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <ZoomBar
            zoom={zoomLevel}
            autoFitScale={autoFitScale}
            onZoomChange={setZoomLevel}
          />
        </div>
      )}
    </div>
  );
});

CanvasRenderer.displayName = "CanvasRenderer";
