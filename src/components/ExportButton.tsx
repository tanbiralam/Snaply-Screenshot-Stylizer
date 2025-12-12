import { Download, Loader2, CheckCircle2, FileImage, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  onExport: (format: 'png' | 'jpeg' | 'webp') => string | null;
  disabled?: boolean;
}

type ExportFormat = 'png' | 'jpeg' | 'webp';

interface FormatOption {
  value: ExportFormat;
  label: string;
  description: string;
  extension: string;
}

const formatOptions: FormatOption[] = [
  {
    value: 'png',
    label: 'PNG',
    description: 'Lossless, best quality',
    extension: 'png',
  },
  {
    value: 'jpeg',
    label: 'JPEG',
    description: 'Smaller file size',
    extension: 'jpg',
  },
  {
    value: 'webp',
    label: 'WebP',
    description: 'Modern, balanced',
    extension: 'webp',
  },
];

export const ExportButton = ({ onExport, disabled }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [lastExported, setLastExported] = useState<ExportFormat | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (disabled) {
      toast.error('Please upload an image first', {
        description: 'You need to upload a screenshot before downloading',
      });
      return;
    }

    setIsExporting(true);
    setDropdownOpen(false);

    await new Promise(resolve => setTimeout(resolve, 400));

    const dataUrl = onExport(format);
    if (!dataUrl) {
      toast.error('Failed to export image', {
        description: 'Something went wrong while generating the image',
      });
      setIsExporting(false);
      return;
    }

    const link = document.createElement('a');
    const formatOption = formatOptions.find(f => f.value === format);
    link.download = `beautified-${Date.now()}.${formatOption?.extension || 'png'}`;
    link.href = dataUrl;
    link.click();

    setLastExported(format);
    setSelectedFormat(format);

    toast.success('Image downloaded successfully!', {
      description: `Saved as ${formatOption?.label} format`,
      icon: <CheckCircle2 className="w-4 h-4" />,
    });

    setIsExporting(false);

    setTimeout(() => setLastExported(null), 3000);
  };

  const selectedFormatOption = formatOptions.find(f => f.value === selectedFormat);

  return (
    <div className="flex gap-2 w-full">
      <Button
        onClick={() => handleExport(selectedFormat)}
        disabled={disabled || isExporting}
        size="lg"
        className="flex-1 gap-2 px-6 shadow-sm hover:shadow-md transition-colors duration-200"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="relative">Exporting...</span>
          </>
        ) : lastExported === selectedFormat ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span className="relative">Downloaded!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span className="relative">Download {selectedFormatOption?.label}</span>
          </>
        )}
      </Button>

      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={disabled || isExporting}
            size="lg"
            variant="outline"
            className={cn(
              "gap-2 px-3 shadow-sm hover:shadow-md transition-colors duration-200 border-2",
              dropdownOpen && "border-primary bg-primary/5"
            )}
          >
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform duration-200",
              dropdownOpen && "rotate-180"
            )} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56"
          sideOffset={8}
        >
          <DropdownMenuLabel className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-primary" />
            Export Format
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {formatOptions.map((format) => (
            <DropdownMenuItem
              key={format.value}
              onClick={() => handleExport(format.value)}
              className={cn(
                "cursor-pointer transition-colors duration-200",
                selectedFormat === format.value && "bg-primary/10"
              )}
            >
              <div className="flex flex-col gap-0.5 py-1">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{format.label}</span>
                  {selectedFormat === format.value && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
