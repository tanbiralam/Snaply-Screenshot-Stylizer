import { StyleSettings } from '@/types/beautifier';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsPanelProps {
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
}

export const SettingsPanel = ({ settings, onSettingsChange }: SettingsPanelProps) => {
  const updateSetting = <K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Settings</h3>

      {/* Padding */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Padding</Label>
          <span className="text-xs text-muted-foreground">{settings.padding}px</span>
        </div>
        <Slider
          value={[settings.padding]}
          onValueChange={([value]) => updateSetting('padding', value)}
          min={16}
          max={120}
          step={4}
          className="w-full"
        />
      </div>

      {/* Border Radius */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Border Radius</Label>
          <span className="text-xs text-muted-foreground">{settings.borderRadius}px</span>
        </div>
        <Slider
          value={[settings.borderRadius]}
          onValueChange={([value]) => updateSetting('borderRadius', value)}
          min={0}
          max={48}
          step={2}
          className="w-full"
        />
      </div>

      {/* Shadow Intensity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Shadow Intensity</Label>
          <span className="text-xs text-muted-foreground">{settings.shadowIntensity}%</span>
        </div>
        <Slider
          value={[settings.shadowIntensity]}
          onValueChange={([value]) => updateSetting('shadowIntensity', value)}
          min={0}
          max={80}
          step={5}
          className="w-full"
        />
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Aspect Ratio</Label>
        <Select
          value={settings.aspectRatio}
          onValueChange={(value) => updateSetting('aspectRatio', value as StyleSettings['aspectRatio'])}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="1:1">1:1 (Square)</SelectItem>
            <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
            <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
            <SelectItem value="9:16">9:16 (Story)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Use Gradient */}
      <div className="flex items-center justify-between py-2">
        <Label className="text-sm font-medium">Use Gradient</Label>
        <Switch
          checked={settings.useGradient}
          onCheckedChange={(checked) => updateSetting('useGradient', checked)}
        />
      </div>

      {/* Background Color / Gradient */}
      {settings.useGradient ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gradient Start</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.gradientStart}
                onChange={(e) => updateSetting('gradientStart', e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <input
                type="text"
                value={settings.gradientStart}
                onChange={(e) => updateSetting('gradientStart', e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gradient End</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.gradientEnd}
                onChange={(e) => updateSetting('gradientEnd', e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <input
                type="text"
                value={settings.gradientEnd}
                onChange={(e) => updateSetting('gradientEnd', e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Background Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => updateSetting('backgroundColor', e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
            />
            <input
              type="text"
              value={settings.backgroundColor}
              onChange={(e) => updateSetting('backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background"
            />
          </div>
        </div>
      )}

      {/* Blur Background */}
      <div className="flex items-center justify-between py-2">
        <div>
          <Label className="text-sm font-medium">Blur Background</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Use screenshot as blurred backdrop</p>
        </div>
        <Switch
          checked={settings.blurBackground}
          onCheckedChange={(checked) => updateSetting('blurBackground', checked)}
        />
      </div>
    </div>
  );
};
