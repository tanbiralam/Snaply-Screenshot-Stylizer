"use client";

import { createHighlighter, type Highlighter, type ThemedToken } from "shiki";
import type { CodeLanguage, CodeTheme } from "@/types";

// ─── Singleton highlighter (lazy-loaded) ──────────────────────────────────────

let highlighterPromise: Promise<Highlighter> | null = null;

const ALL_LANGS: CodeLanguage[] = [
  "typescript", "javascript", "python", "json",
  "html", "css", "bash", "go", "rust", "java", "cpp", "sql",
];

const ALL_THEMES: CodeTheme[] = [
  "github-dark", "github-light", "dracula", "nord",
  "vitesse-dark", "one-dark-pro", "catppuccin-mocha", "min-dark", "slack-dark",
];

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ALL_THEMES,
      langs: ALL_LANGS,
    });
  }
  return highlighterPromise;
}

// ─── Token output type ────────────────────────────────────────────────────────

export interface CodeToken {
  content: string;
  color: string;
}

export interface TokenizedCode {
  /** One array of tokens per line */
  lines: CodeToken[][];
  /** Background colour of the theme */
  bg: string;
  /** Default foreground colour of the theme */
  fg: string;
}

// ─── Main tokenizer function ──────────────────────────────────────────────────

export async function tokenizeCode(
  code: string,
  language: CodeLanguage,
  theme: CodeTheme
): Promise<TokenizedCode> {
  const highlighter = await getHighlighter();

  const result = highlighter.codeToTokens(code, {
    lang: language,
    theme: theme,
  });

  const bg = result.bg || "#1a1a2e";
  const fg = result.fg || "#e1e1e1";

  const lines: CodeToken[][] = result.tokens.map((lineTokens: ThemedToken[]) =>
    lineTokens.map((token) => ({
      content: token.content,
      color: token.color || fg,
    }))
  );

  return { lines, bg, fg };
}
