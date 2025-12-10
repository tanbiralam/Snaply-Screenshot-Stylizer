import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExportButtonProps {
  onExport: () => string | null;
  disabled?: boolean;
}

export const ExportButton = ({ onExport, disabled }: ExportButtonProps) => {
  const handleExport = () => {
    const dataUrl = onExport();
    if (!dataUrl) {
      toast.error('Please upload an image first');
      return;
    }

    const link = document.createElement('a');
    link.download = `beautified-screenshot-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Image downloaded successfully!');
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled}
      size="lg"
      className="w-full gap-2"
    >
      <Download className="w-5 h-5" />
      Download PNG
    </Button>
  );
};
