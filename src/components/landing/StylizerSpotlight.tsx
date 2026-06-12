import Link from "next/link";
import { getTool, toolPath } from "@/lib/registry/tools";
import { presetCategories } from "@/types/presets";
import { MockWindow } from "./MockWindow";

/* Real presets named in the copy and used to label the preview tiles.
   Looked up by id so renames in src/types/presets.ts flow through. */
const SPOTLIGHT_PRESET_IDS = ["img-aurora", "glassmorphism", "gradient-sunset"];

/* Distinct token-only gradient backdrops for the three preview tiles. */
const tileBackdrops = [
  "bg-gradient-to-br from-primary/30 via-primary/10 to-primary/5",
  "bg-gradient-to-br from-foreground/15 to-primary/10",
  "bg-gradient-to-br from-primary/15 to-foreground/10",
];

const sliders = [
  { label: "Padding", fill: "w-2/3", thumb: "left-2/3" },
  { label: "Radius", fill: "w-1/3", thumb: "left-1/3" },
  { label: "Shadow", fill: "w-1/2", thumb: "left-1/2" },
];

export function StylizerSpotlight() {
  const tool = getTool("create", "screenshot");
  if (!tool) return null;

  const allPresets = presetCategories.flatMap((c) => c.presets);
  const spotlightPresets = SPOTLIGHT_PRESET_IDS.map((id) =>
    allPresets.find((p) => p.id === id)
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section className="mx-auto max-w-content px-4 py-20 md:px-6">
      <p className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        Spotlight
      </p>
      <h2 className="mt-4 text-3xl font-bold">{tool.name}</h2>

      {/* Row 1 — presets: text left, tiles right */}
      <div className="mt-8 grid items-center gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-medium">One-click styles</h3>
          <p className="text-sm text-muted-foreground">
            Presets like {spotlightPresets.map((p) => p.name).join(", ")} set
            the backdrop, padding, corner radius, and shadow together — pick
            one and your screenshot is ready to share.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {spotlightPresets.map((preset, i) => (
            <figure key={preset.id}>
              <div
                className={`rounded-md border p-3 ${tileBackdrops[i % tileBackdrops.length]}`}
              >
                <MockWindow compact />
              </div>
              <figcaption className="mt-1.5 font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                {preset.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Row 2 — control: visual left, text right */}
      <div className="mt-12 grid items-center gap-8 md:grid-cols-2">
        <div
          aria-hidden="true"
          className="flex flex-col gap-5 rounded-lg border bg-card p-5 md:order-first"
        >
          {sliders.map((slider) => (
            <div key={slider.label}>
              <span className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                {slider.label}
              </span>
              <div className="relative mt-2 h-1.5 rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full bg-primary ${slider.fill}`}
                />
                <span
                  className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ${slider.thumb}`}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
              Aspect
            </span>
            <span className="rounded-md border px-2.5 py-0.5 font-mono text-2xs text-foreground">
              16:9
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
              Export
            </span>
            <span className="font-mono text-2xs text-foreground">
              PNG · JPEG · WEBP
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-medium">Full control when you want it</h3>
          <p className="text-sm text-muted-foreground">
            Dial in padding, corner radius, shadow strength, and aspect ratio
            yourself — then export PNG, JPEG, or WebP at 2x resolution.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Link
          href={toolPath(tool)}
          className="inline-flex h-12 items-center rounded-md bg-primary px-6 font-medium text-primary-foreground transition-colors duration-120 ease-out hover:bg-primary-hover"
        >
          Open {tool.name}
        </Link>
      </div>
    </section>
  );
}
