import { MockWindow } from "./MockWindow";

/**
 * Before/after illustration of what the Stylizer does: the same mock
 * window flat (before) vs wrapped on a jade-tinted gradient backdrop
 * with padding, radius, and shadow (after). Static DOM, no canvas.
 */
export function HeroVisual() {
  return (
    <div className="mt-12 grid gap-4 md:grid-cols-2">
      <figure>
        <figcaption className="mb-2 font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
          Before
        </figcaption>
        <div className="rounded-lg border bg-secondary p-4 sm:p-6">
          <MockWindow />
        </div>
      </figure>

      <figure>
        <figcaption className="mb-2 font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
          After
        </figcaption>
        <div className="rounded-lg border bg-gradient-to-br from-primary/25 via-primary/10 to-primary/30 p-8 sm:p-10">
          <MockWindow className="rounded-lg shadow-modal" />
        </div>
      </figure>
    </div>
  );
}
