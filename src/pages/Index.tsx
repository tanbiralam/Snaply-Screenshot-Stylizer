import { useState, useRef } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { StylePresets } from '@/components/StylePresets';
import { CanvasRenderer, CanvasRendererRef } from '@/components/CanvasRenderer';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ExportButton } from '@/components/ExportButton';
import { StyleSettings, defaultSettings, Preset } from '@/types/beautifier';
import { Sparkles, ChevronDown, Palette, Sliders } from 'lucide-react';
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
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const canvasRef = useRef<CanvasRendererRef>(null);

  const handlePresetSelect = (preset: Preset) => {
    setActivePreset(preset.id);
    setSettings({ ...settings, ...preset.settings });
  };

  const handleSettingsChange = (newSettings: StyleSettings) => {
    setSettings(newSettings);
    setActivePreset(null);
  };

  const handleExport = (format: 'png' | 'jpeg' | 'webp') => {
    return canvasRef.current?.exportImage(format) ?? null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-20 animate-slide-down">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Screenshot Beautifier</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Transform screenshots into stunning visuals
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <ExportButton onExport={handleExport} disabled={!image} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6">
          {/* Left Panel - Style Presets */}
          <aside className="lg:block order-2 lg:order-1">
            {/* Mobile collapsible */}
            <div className="lg:hidden">
              <Collapsible open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Style Presets</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform duration-200',
                      leftPanelOpen && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 animate-slide-up">
                  <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                    <StylePresets
                      activePreset={activePreset}
                      onSelectPreset={handlePresetSelect}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Desktop fixed panel */}
            <div className="hidden lg:block sticky top-20">
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm max-h-[calc(100vh-110px)] overflow-y-auto">
                <StylePresets
                  activePreset={activePreset}
                  onSelectPreset={handlePresetSelect}
                />
              </div>
            </div>
          </aside>

          {/* Center - Canvas */}
          <div className="space-y-4 order-1 lg:order-2">
            <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm animate-fade-in">
              <ImageUpload onImageUpload={setImage} hasImage={!!image} />
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 overflow-hidden shadow-lg animate-scale-in">
              <CanvasRenderer ref={canvasRef} image={image} settings={settings} />
            </div>
            {/* Mobile export button */}
            <div className="md:hidden animate-fade-in">
              <ExportButton onExport={handleExport} disabled={!image} />
            </div>
          </div>

          {/* Right Panel - Settings */}
          <aside className="lg:block order-3">
            {/* Mobile collapsible */}
            <div className="lg:hidden">
              <Collapsible open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Settings</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform duration-200',
                      rightPanelOpen && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 animate-slide-up">
                  <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                    <SettingsPanel
                      settings={settings}
                      onSettingsChange={handleSettingsChange}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Desktop fixed panel */}
            <div className="hidden lg:block sticky top-20">
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm max-h-[calc(100vh-110px)] overflow-y-auto">
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 mt-12 py-6 animate-fade-in">
        <p className="text-center text-xs text-muted-foreground">
          Free to use • No login required • Local processing only
        </p>
      </footer>
    </div>
  );
};

export default Index;
