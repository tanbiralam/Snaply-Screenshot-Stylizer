import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

interface ExportButtonProps {
  onExport: () => string | null;
  disabled?: boolean;
}

export const ExportButton = ({ onExport, disabled }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled) {
      toast.error('Please upload an image first');
      return;
    }

    setIsExporting(true);
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const dataUrl = onExport();
    if (!dataUrl) {
      toast.error('Failed to export image');
      setIsExporting(false);
      return;
    }

    const link = document.createElement('a');
    link.download = `beautified-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    toast.success('Image downloaded!');
    setIsExporting(false);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      size="lg"
      className="gap-2 px-6 shadow-md hover:shadow-lg transition-shadow"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download PNG
        </>
      )}
    </Button>
  );
};
