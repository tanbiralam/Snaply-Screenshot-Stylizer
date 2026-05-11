"use client";

import { useCallback, useRef } from "react";
import { Code, ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeInputProps {
  code: string;
  onChange: (code: string) => void;
}

const PLACEHOLDER_CODE = `// Paste or type your code here
function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");`;

export const CodeInput = ({ code, onChange }: CodeInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch {
      // Fallback – focus the textarea so the user can Ctrl+V
      textareaRef.current?.focus();
    }
  }, [onChange]);

  const hasCode = code.trim().length > 0;

  if (hasCode) {
    return (
      <div className="w-full max-w-2xl">
        <div className="relative rounded-xl border hairline overflow-hidden bg-secondary/40">
          {/* Mini header */}
          <div className="flex items-center justify-between px-3 py-2 border-b hairline bg-secondary/50">
            <div className="flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Code Input</span>
            </div>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded border hairline hover:bg-secondary"
            >
              Clear
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className={cn(
              "w-full min-h-[160px] max-h-[320px] resize-y p-4 bg-transparent",
              "font-mono text-xs leading-relaxed text-foreground",
              "placeholder:text-muted-foreground/50",
              "outline-none focus:ring-0 border-none"
            )}
            placeholder={PLACEHOLDER_CODE}
          />
        </div>
      </div>
    );
  }

  // Empty state
  return (
    <div className="w-full max-w-lg">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 p-8 rounded-xl border border-dashed transition-colors duration-200 cursor-pointer group",
          "hairline hover:border-foreground/30 hover:bg-secondary/60"
        )}
        onClick={handlePaste}
      >
        <div className="p-3 rounded-lg bg-secondary group-hover:bg-secondary/80 transition-colors duration-150">
          <ClipboardPaste className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        <div className="text-center">
          <p className="font-medium text-sm text-foreground">
            Paste your code snippet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click here or press Ctrl+V · Then style it beautifully
          </p>
        </div>

        {/* Hidden textarea for fallback paste */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer resize-none"
          placeholder={PLACEHOLDER_CODE}
        />
      </div>
    </div>
  );
};
