import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSettings } from '@/types/beautifier';

interface CanvasRendererProps {
  image: string | null;
  settings: StyleSettings;
}

export interface CanvasRendererRef {
  exportImage: () => string | null;
}

const getAspectRatioDimensions = (
  aspectRatio: StyleSettings['aspectRatio'],
  imageWidth: number,
  imageHeight: number,
  padding: number
) => {
  const contentWidth = imageWidth + padding * 2;
  const contentHeight = imageHeight + padding * 2;

  switch (aspectRatio) {
    case '1:1': {
      const size = Math.max(contentWidth, contentHeight);
      return { width: size, height: size };
    }
    case '16:9': {
      const width = Math.max(contentWidth, (contentHeight * 16) / 9);
      const height = Math.max(contentHeight, (contentWidth * 9) / 16);
      return { width, height };
    }
    case '4:5': {
      const width = Math.max(contentWidth, (contentHeight * 4) / 5);
      const height = Math.max(contentHeight, (contentWidth * 5) / 4);
      return { width, height };
    }
    case '9:16': {
      const width = Math.max(contentWidth, (contentHeight * 9) / 16);
      const height = Math.max(contentHeight, (contentWidth * 16) / 9);
      return { width, height };
    }
    default:
      return { width: contentWidth, height: contentHeight };
  }
};

export const CanvasRenderer = forwardRef<CanvasRendererRef, CanvasRendererProps>(
  ({ image, settings }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    useEffect(() => {
      if (image) {
        const img = new Image();
        img.onload = () => setLoadedImage(img);
        img.src = image;
      } else {
        setLoadedImage(null);
      }
    }, [image]);

    useEffect(() => {
      if (!loadedImage) return;

      const { width, height } = getAspectRatioDimensions(
        settings.aspectRatio,
        loadedImage.width,
        loadedImage.height,
        settings.padding
      );
      setCanvasSize({ width, height });
    }, [loadedImage, settings.aspectRatio, settings.padding]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      if (settings.useGradient) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, settings.gradientStart);
        gradient.addColorStop(1, settings.gradientEnd);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = settings.backgroundColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!loadedImage) return;

      // Calculate centered position
      const x = (canvas.width - loadedImage.width) / 2;
      const y = (canvas.height - loadedImage.height) / 2;

      // Draw blurred background if enabled
      if (settings.blurBackground) {
        ctx.save();
        ctx.filter = 'blur(30px)';
        ctx.globalAlpha = 0.6;
        ctx.drawImage(loadedImage, -50, -50, canvas.width + 100, canvas.height + 100);
        ctx.restore();

        // Redraw the gradient with transparency
        if (settings.useGradient) {
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, settings.gradientStart + '80');
          gradient.addColorStop(1, settings.gradientEnd + '80');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      // Draw shadow
      if (settings.shadowIntensity > 0) {
        ctx.save();
        ctx.shadowColor = `rgba(0, 0, 0, ${settings.shadowIntensity / 100})`;
        ctx.shadowBlur = settings.shadowIntensity;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = settings.shadowIntensity / 3;

        // Draw shadow shape
        ctx.beginPath();
        roundRect(ctx, x, y, loadedImage.width, loadedImage.height, settings.borderRadius);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.restore();
      }

      // Draw image with rounded corners
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, x, y, loadedImage.width, loadedImage.height, settings.borderRadius);
      ctx.clip();
      ctx.drawImage(loadedImage, x, y);
      ctx.restore();
    }, [loadedImage, settings, canvasSize]);

    useImperativeHandle(ref, () => ({
      exportImage: () => {
        const canvas = canvasRef.current;
        if (!canvas || !loadedImage) return null;

        // Create high-res export canvas (2x)
        const exportCanvas = document.createElement('canvas');
        const scale = 2;
        exportCanvas.width = canvas.width * scale;
        exportCanvas.height = canvas.height * scale;
        const ctx = exportCanvas.getContext('2d');
        if (!ctx) return null;

        ctx.scale(scale, scale);

        // Redraw everything at 2x
        if (settings.useGradient) {
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, settings.gradientStart);
          gradient.addColorStop(1, settings.gradientEnd);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = settings.backgroundColor;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const x = (canvas.width - loadedImage.width) / 2;
        const y = (canvas.height - loadedImage.height) / 2;

        if (settings.blurBackground) {
          ctx.save();
          ctx.filter = 'blur(30px)';
          ctx.globalAlpha = 0.6;
          ctx.drawImage(loadedImage, -50, -50, canvas.width + 100, canvas.height + 100);
          ctx.restore();

          if (settings.useGradient) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, settings.gradientStart + '80');
            gradient.addColorStop(1, settings.gradientEnd + '80');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }

        if (settings.shadowIntensity > 0) {
          ctx.save();
          ctx.shadowColor = `rgba(0, 0, 0, ${settings.shadowIntensity / 100})`;
          ctx.shadowBlur = settings.shadowIntensity;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = settings.shadowIntensity / 3;
          ctx.beginPath();
          roundRect(ctx, x, y, loadedImage.width, loadedImage.height, settings.borderRadius);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.restore();
        }

        ctx.save();
        ctx.beginPath();
        roundRect(ctx, x, y, loadedImage.width, loadedImage.height, settings.borderRadius);
        ctx.clip();
        ctx.drawImage(loadedImage, x, y);
        ctx.restore();

        return exportCanvas.toDataURL('image/png');
      },
    }));

    // Calculate display size to fit container
    const containerWidth = containerRef.current?.clientWidth || 700;
    const scale = Math.min(1, (containerWidth - 32) / canvasSize.width);
    const displayWidth = canvasSize.width * scale;
    const displayHeight = canvasSize.height * scale;

    return (
      <div ref={containerRef} className="flex items-center justify-center w-full min-h-[400px] p-4">
        <div
          className="relative rounded-lg overflow-hidden shadow-xl"
          style={{ width: displayWidth, height: displayHeight }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              width: displayWidth,
              height: displayHeight,
            }}
            className="block"
          />
          {!image && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
              <p className="text-muted-foreground text-center px-4">
                Upload a screenshot to see the preview
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CanvasRenderer.displayName = 'CanvasRenderer';

// Helper function to draw rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
