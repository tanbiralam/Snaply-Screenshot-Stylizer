# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress — repositioning into the multi-tool suite.

## Current Goal

- Units 1–2 complete. Next is Unit 3 (landing page rebuild).

## Completed

- **Unit 2 — Jade theme implementation** (2026-06-13)
  - `src/index.css` now defines the full Jade token set from `ui-context.md` — all 16 color tokens as hex CSS custom properties plus `--shadow-card`/`--shadow-modal` — under `:root[data-theme="dark"]` (also bare `:root`, so dark is the no-JS fallback) and `:root[data-theme="light"]`.
  - shadcn's HSL variable layer (`--background`, `--card`, `--primary`, `--border`, `--ring`, etc.) is mapped from the Jade palette in HSL-triplet form under both selectors; `src/components/ui/` untouched and inherits both themes. Added a `--warning` HSL var + Tailwind `warning` color for the existing amber UI states.
  - `next-themes` reconfigured: `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem`; Tailwind `darkMode` switched to `["selector", '[data-theme="dark"]']`. `ThemeToggle` now toggles off `resolvedTheme` (correct when the stored theme is "system").
  - Radius remap: `--radius: 0.5rem` → `rounded-sm` 4px, `md` 6px, `lg` 8px (cards), `xl` 12px.
  - Fonts: Geist Sans/Mono via the `geist` package (next/font), exposed as `--font-sans`/`--font-mono` and wired through Tailwind's `fontFamily`. Poppins/Fira Code Google imports removed; EB Garamond kept only for the legacy landing serif (removed in Unit 3).
  - Color sweep (scoped, color-substitution only): indigo active states in `DevicePreviewSVG` → `--primary`; amber classes in `DeviceTab`/`DeviceCard` → `warning` token; `text-green-500` checks in `ShareMenu` → `text-primary` (success = jade); pure-gray rings in `StylePresets`/`CodeSettingsTab` → `ring-border`; X-share gray hover → `bg-foreground/10`; `index.css` decorative gradients (`bg-paper-glow`, `bg-gradient-canvas{,-soft}`) re-pointed at accent tokens. Light-theme shadow ramp re-tinted to jade ink (no pure black).
  - Theme switch transitions colors at 200ms ease-in-out via a zero-specificity base rule (explicit transition utilities still win); a global `prefers-reduced-motion: reduce` block kills transitions/animations.
  - Canvas/export content intentionally NOT swept: style presets, device-mockup pixel colors, code themes, traffic-light dots, and the landing's mock-screenshot depictions are exported/depicted content, not UI chrome.
  - Verified: `npm run build` passes; prod-server smoke test confirms the no-flash `data-theme` script, Geist font variables, Jade tokens + both theme selectors in compiled CSS, and the `/editor` 308 redirect.

- **Unit 1 — Route restructure + tool registry** (2026-06-13)
  - Moved the screenshot editor from `/editor` to `/create/screenshot`. The page is split into a server `page.tsx` (registry-derived metadata) and the unchanged client editor (`ScreenshotEditor.tsx`); no editor logic, state, or styling was modified.
  - Added a permanent redirect `/editor` → `/create/screenshot` via `redirects()` in `next.config.mjs`.
  - Scaffolded category folders `src/app/create/`, `src/app/edit/`, `src/app/optimize/`, each with a minimal pass-through `layout.tsx` (breadcrumb + related-tools shell deferred to a later unit; marked with TODO).
  - Created `src/lib/registry/tools.ts` — the single tool registry with the `Tool` interface (`slug, category, name, description, keywords, icon, status`), all 10 tools (`screenshot` is `live`, the other 9 are `soon`), `CATEGORY_LABELS`, and helpers (`toolPath`, `getTool`, `getToolsByCategory`, `getLiveTools`).
  - Updated the three landing links (`Hero`, `Nav`, `CTA`) from `/editor` to `/create/screenshot`.
  - `npm run build` passes with no type errors.

## In Progress

- None.

## Next Up

- Unit 3 — landing page rebuild.

## Open Questions

- **Token name collision**: `ui-context.md` names two semantic tokens `--accent-foreground` and `--ring`, but shadcn's variable layer already uses those exact names (as HSL triplets). The hex tokens are exposed as `--accent-foreground-token` and `--ring-token` instead. If a different convention is preferred (e.g. prefixing all Jade tokens), `ui-context.md` should be updated to match.
- **shadcn vars with no Jade source named in the spec**: `--secondary`/`--muted` were mapped to `--bg-surface`, shadcn's `--accent` (hover surface for menus/selects) to `--bg-hover`, and `--destructive-foreground` follows the accent-foreground flip (dark ink on the bright dark-mode red, white on the deep light-mode red). The unused `--chart-*` variables were dropped. Flag if any of these should map differently.
- **Default vs system theme**: the brief asks for both `defaultTheme="dark"` and "system preference respected on first visit". With next-themes these are mutually exclusive — `defaultTheme="dark"` means a light-OS first-time visitor gets dark, not light. Implemented as specified (`defaultTheme="dark"`, `enableSystem`); switch to `defaultTheme="system"` if first-visit system detection should win.
- Social brand colors in `ShareMenu` (LinkedIn blue, Instagram pink hover tints) were kept as brand colors, not tokenized.

- **Branding mismatch**: `project-overview.md` names the product **Pixltly**, but the codebase (layout metadata, landing copy, editor header) still says **Snaply**. Unit 1 kept existing branding untouched; a later unit should resolve which name ships and update metadata/copy accordingly.
- The current editor includes a built-in "Code" mode (mode toggle in its header). The registry lists Code Card as a separate `soon` tool at `/create/code`. When `/create/code` is built, decide whether the screenshot editor's code mode is removed or redirected.

## Architecture Decisions

- The registry stores the Lucide **icon name as a string** (per `ui-context.md`: "Each tool's registry entry carries its own Lucide icon name") rather than importing icon components, keeping the registry dependency-free for server-side consumers (sitemap, metadata).
- Unbuilt tools have **no route segments**; their existence is carried solely by `status: "soon"` in the registry, so nav surfaces can render them without dead links.
- The `/editor` redirect lives in `next.config.mjs` (`permanent: true`) rather than as a page-level `redirect()`, matching the "permanent redirect" rule in `code-standards.md`. If the app later moves to `output: "export"`, this must be revisited (config redirects don't apply to static export).

## Session Notes

- The Unit 1 brief described the editor as living at `src/app/page.tsx` with types in `src/types/beautifier.ts`; in the actual repo, `/` is a landing page, the editor was at `src/app/editor/page.tsx`, and types live in `src/types/` (`index.ts`, `settings.ts`, `presets.ts`, `code.ts`, `devices.ts`). The move was done from the real location.
- The editor's components remain in `src/components/` unchanged; only the page moved.
