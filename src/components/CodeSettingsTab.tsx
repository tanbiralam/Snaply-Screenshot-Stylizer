"use client";

import {
  CodeSettings,
  codeLanguageOptions,
  codeThemeOptions,
  CodeLanguage,
  CodeTheme,
} from "@/types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CodeSettingsTabProps {
  codeSettings: CodeSettings;
  onCodeSettingsChange: (settings: CodeSettings) => void;
}

const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
    {children}
  </p>
);

export const CodeSettingsTab = ({
  codeSettings,
  onCodeSettingsChange,
}: CodeSettingsTabProps) => {
  const update = <K extends keyof CodeSettings>(key: K, value: CodeSettings[K]) => {
    onCodeSettingsChange({ ...codeSettings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Language */}
      <div className="space-y-3">
        <SectionLabel>Language</SectionLabel>
        <Select
          value={codeSettings.codeLanguage}
          onValueChange={(v) => update("codeLanguage", v as CodeLanguage)}
        >
          <SelectTrigger className="h-8 text-xs rounded-lg border hairline">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {codeLanguageOptions.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <SectionLabel>Theme</SectionLabel>
        <div className="grid grid-cols-1 gap-1">
          {codeThemeOptions.map((theme) => {
            const isActive = codeSettings.codeTheme === theme.value;
            return (
              <button
                key={theme.value}
                type="button"
                onClick={() => update("codeTheme", theme.value as CodeTheme)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-150 text-left",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <span
                  className="w-5 h-5 rounded-md flex-shrink-0 ring-1 ring-border"
                  style={{ backgroundColor: theme.bg }}
                />
                <span className="text-xs font-medium truncate">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <SectionLabel>Typography</SectionLabel>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Font size</Label>
            <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {codeSettings.codeFontSize}px
            </span>
          </div>
          <Slider
            value={[codeSettings.codeFontSize]}
            onValueChange={([v]) => update("codeFontSize", v)}
            min={10}
            max={24}
            step={1}
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <SectionLabel>Options</SectionLabel>
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Line numbers</Label>
          <Switch
            checked={codeSettings.codeShowLineNumbers}
            onCheckedChange={(v) => update("codeShowLineNumbers", v)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground">Window title</Label>
          <input
            type="text"
            value={codeSettings.codeWindowTitle}
            onChange={(e) => update("codeWindowTitle", e.target.value)}
            placeholder="untitled"
            className="w-full rounded-lg border hairline bg-background px-2 py-1.5 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
