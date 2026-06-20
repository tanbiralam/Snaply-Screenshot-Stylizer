import Image from "next/image";
import heroAfter from "../../../public/landing/hero-after.png";
import heroBefore from "../../../public/landing/hero-before.png";

/**
 * Real before/after of the Stylizer: the flat source screenshot (before)
 * tucked tilted behind the styled output (after) on its gradient backdrop.
 * Overlapping composition — the two images aren't co-framed, so a wipe
 * slider would jump; the stack sells the transformation instead.
 */
export function HeroVisual() {
  return (
    <div className="relative mt-12 sm:mt-16">
      {/* After — the styled output, dominant */}
      <figure className="relative ml-auto w-full sm:w-[88%]">
        <span className="absolute left-3 top-3 z-10 rounded-md bg-background/80 px-2.5 py-1 font-mono text-2xs font-medium uppercase tracking-wider text-foreground backdrop-blur">
          After
        </span>
        <Image
          src={heroAfter}
          alt="A screenshot styled with Snaply — placed on a gradient backdrop with padding, rounded corners, and a soft shadow."
          sizes="(max-width: 768px) 100vw, 760px"
          priority
          className="w-full rounded-xl shadow-modal ring-1 ring-border"
        />
      </figure>

      {/* Before — flat source, tucked in tilted */}
      <figure className="absolute -bottom-4 left-0 w-[42%] max-w-[280px] -rotate-3 sm:-bottom-6">
        <span className="absolute left-2 top-2 z-10 rounded bg-background/80 px-2 py-0.5 font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
          Before
        </span>
        <Image
          src={heroBefore}
          alt="The same screenshot before styling — flat, no background or shadow."
          sizes="(max-width: 768px) 42vw, 280px"
          className="w-full rounded-lg border bg-card shadow-lg"
        />
      </figure>
    </div>
  );
}
