import { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  hasImage: boolean;
}

export const ImageUpload = ({ onImageUpload, hasImage }: ImageUploadProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
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
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 p-8 rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer group',
        hasImage
          ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
          : 'border-border hover:border-primary/50 hover:bg-accent/50'
      )}
    >
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className={cn(
        'p-4 rounded-full transition-colors duration-300',
        hasImage ? 'bg-primary/10' : 'bg-muted/30 group-hover:bg-primary/10'
      )}>
        {hasImage ? (
          <ImageIcon className="w-8 h-8 text-primary" />
        ) : (
          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>
      <div className="text-center">
        <p className="font-medium text-foreground">
          {hasImage ? 'Upload a different screenshot' : 'Drop your screenshot here'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to browse • PNG, JPG, WebP
        </p>
      </div>
    </div>
  );
};
