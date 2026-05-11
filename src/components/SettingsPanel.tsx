"use client";

import { useState } from "react";
import { StyleSettings, CodeSettings, EditorMode } from "@/types";
import { Palette, Smartphone, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { StyleTab } from "./StyleTab";
import { DeviceTab } from "./DeviceTab";
import { CodeSettingsTab } from "./CodeSettingsTab";

interface SettingsPanelProps {
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
  imageAspectRatio?: number | null;
  editorMode: EditorMode;
  codeSettings?: CodeSettings;
  onCodeSettingsChange?: (settings: CodeSettings) => void;
}

type ActiveTab = "style" | "device" | "code";

export const SettingsPanel = ({
  settings,
  onSettingsChange,
  imageAspectRatio,
  editorMode,
  codeSettings,
  onCodeSettingsChange,
}: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    editorMode === "code" ? "code" : "style"
  );

  const updateSetting = <K extends keyof StyleSettings>(key: K, value: StyleSettings[K]) => {
    const newSettings = { ...settings, [key]: value };

    const bgControls: Array<keyof StyleSettings> = [
      "useGradient",
      "gradientStart",
      "gradientEnd",
      "gradientAngle",
      "backgroundColor"
    ];

    if (bgControls.includes(key as keyof StyleSettings)) {
      newSettings.backgroundImage = null;
    }

    onSettingsChange(newSettings);
  };

  const isCodeMode = editorMode === "code";

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 border-b hairline">
        {isCodeMode && (
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors duration-150",
              "border-b-2 -mb-px",
              activeTab === "code"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Code className="h-3.5 w-3.5" />
            Code
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors duration-150",
            "border-b-2 -mb-px",
            activeTab === "style"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Palette className="h-3.5 w-3.5" />
          Style
        </button>
        {!isCodeMode && (
          <button
            type="button"
            onClick={() => setActiveTab("device")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors duration-150",
              "border-b-2 -mb-px",
              activeTab === "device"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Device
            {settings.deviceMockup !== "none" && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-semibold text-background">
                1
              </span>
            )}
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeTab === "code" && isCodeMode && codeSettings && onCodeSettingsChange ? (
          <CodeSettingsTab
            codeSettings={codeSettings}
            onCodeSettingsChange={onCodeSettingsChange}
          />
        ) : activeTab === "style" ? (
          <StyleTab settings={settings} updateSetting={updateSetting} />
        ) : activeTab === "device" ? (
          <DeviceTab
            settings={settings}
            onSettingsChange={onSettingsChange}
            imageAspectRatio={imageAspectRatio}
          />
        ) : null}
      </div>
    </div>
  );
};
