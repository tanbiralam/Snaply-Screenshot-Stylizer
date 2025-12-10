import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  hasImage: boolean;
}

export const ImageUpload = ({ onImageUpload, hasImage }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.match(/image\/(png|jpeg|webp)/)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageUpload(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageUpload(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group',
        isDragging
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : hasImage
          ? 'border-primary/40 bg-primary/5 hover:border-primary/60'
          : 'border-border/60 hover:border-primary/50 hover:bg-accent/30'
      )}
    >
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div
        className={cn(
          'p-3 rounded-full transition-all duration-300',
          isDragging
            ? 'bg-primary/20 scale-110'
            : hasImage
            ? 'bg-primary/10'
            : 'bg-muted/50 group-hover:bg-primary/10 group-hover:scale-105'
        )}
      >
        {hasImage ? (
          <CheckCircle className="w-6 h-6 text-primary" />
        ) : isDragging ? (
          <ImageIcon className="w-6 h-6 text-primary" />
        ) : (
          <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>
      <div className="text-center">
        <p className="font-medium text-sm text-foreground">
          {hasImage ? 'Replace screenshot' : isDragging ? 'Drop to upload' : 'Drop screenshot here'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {hasImage ? 'Click or drag a new file' : 'or click to browse • PNG, JPG, WebP'}
        </p>
      </div>
    </div>
  );
};
