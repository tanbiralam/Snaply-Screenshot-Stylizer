import { useState, useRef } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { StylePresets } from '@/components/StylePresets';
import { CanvasRenderer, CanvasRendererRef } from '@/components/CanvasRenderer';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ExportButton } from '@/components/ExportButton';
import { StyleSettings, defaultSettings, Preset } from '@/types/beautifier';
import { Sparkles, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const canvasRef = useRef<CanvasRendererRef>(null);

  const handlePresetSelect = (preset: Preset) => {
    setActivePreset(preset.id);
    setSettings({ ...settings, ...preset.settings });
  };

  const handleSettingsChange = (newSettings: StyleSettings) => {
    setSettings(newSettings);
    setActivePreset(null);
  };

  const handleExport = () => {
    return canvasRef.current?.exportImage() ?? null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Screenshot Beautifier</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Transform your screenshots into stunning visuals
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <ExportButton onExport={handleExport} disabled={!image} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
          {/* Left Panel - Style Presets */}
          <aside className="lg:block">
            {/* Mobile collapsible */}
            <div className="lg:hidden">
              <Collapsible open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-card border border-border">
                  <span className="font-semibold">Style Presets</span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform',
                      leftPanelOpen && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <StylePresets
                      activePreset={activePreset}
                      onSelectPreset={handlePresetSelect}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Desktop fixed panel */}
            <div className="hidden lg:block sticky top-24">
              <div className="p-4 rounded-lg bg-card border border-border max-h-[calc(100vh-120px)] overflow-y-auto">
                <StylePresets
                  activePreset={activePreset}
                  onSelectPreset={handlePresetSelect}
                />
              </div>
            </div>
          </aside>

          {/* Center - Canvas */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <ImageUpload onImageUpload={setImage} hasImage={!!image} />
            </div>
            <div className="rounded-lg bg-card border border-border overflow-hidden">
              <CanvasRenderer ref={canvasRef} image={image} settings={settings} />
            </div>
            {/* Mobile export button */}
            <div className="md:hidden">
              <ExportButton onExport={handleExport} disabled={!image} />
            </div>
          </div>

          {/* Right Panel - Settings */}
          <aside className="lg:block">
            {/* Mobile collapsible */}
            <div className="lg:hidden">
              <Collapsible open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-card border border-border">
                  <span className="font-semibold">Settings</span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform',
                      rightPanelOpen && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <SettingsPanel
                      settings={settings}
                      onSettingsChange={handleSettingsChange}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Desktop fixed panel */}
            <div className="hidden lg:block sticky top-24">
              <div className="p-4 rounded-lg bg-card border border-border max-h-[calc(100vh-120px)] overflow-y-auto">
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
