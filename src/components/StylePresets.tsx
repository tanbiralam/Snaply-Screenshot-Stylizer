import { presets, Preset } from '@/types/beautifier';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StylePresetsProps {
  activePreset: string | null;
  onSelectPreset: (preset: Preset) => void;
}

export const StylePresets = ({ activePreset, onSelectPreset }: StylePresetsProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Style Presets</h3>
      <div className="grid gap-2">
        {presets.map((preset) => {
          const isActive = activePreset === preset.id;
          const gradientStyle = preset.settings.useGradient
            ? `linear-gradient(135deg, ${preset.settings.gradientStart}, ${preset.settings.gradientEnd})`
            : preset.settings.backgroundColor;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left group',
                isActive
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/50 hover:bg-accent/30'
              )}
            >
              <div
                className="w-10 h-10 rounded-md flex-shrink-0 shadow-sm"
                style={{ background: gradientStyle }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{preset.name}</p>
                <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
              </div>
              {isActive && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
