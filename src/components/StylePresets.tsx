import { presets, Preset } from '@/types/beautifier';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StylePresetsProps {
  activePreset: string | null;
  onSelectPreset: (preset: Preset) => void;
}

export const StylePresets = ({ activePreset, onSelectPreset }: StylePresetsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground/80 text-xs uppercase tracking-wider">
        Style Presets
      </h3>
      <div className="space-y-2">
        {presets.map((preset, index) => {
          const isActive = activePreset === preset.id;
          const gradientStyle = preset.settings.useGradient
            ? `linear-gradient(135deg, ${preset.settings.gradientStart}, ${preset.settings.gradientEnd})`
            : preset.settings.backgroundColor;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              style={{ animationDelay: `${index * 50}ms` }}
              className={cn(
                'relative w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left group animate-fade-in',
                isActive
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-transparent bg-background hover:bg-accent/50 hover:shadow-sm'
              )}
            >
              <div
                className={cn(
                  'w-11 h-11 rounded-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
                  isActive ? 'shadow-lg' : 'shadow-sm'
                )}
                style={{ background: gradientStyle }}
              />
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-semibold text-sm text-foreground">{preset.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{preset.description}</p>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isActive
                    ? 'bg-primary scale-100'
                    : 'bg-border/50 scale-90 opacity-0 group-hover:opacity-100'
                )}
              >
                {isActive && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
