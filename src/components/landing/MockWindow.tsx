/**
 * DOM-composed mock app window used by the landing illustrations
 * (hero before/after, spotlight preset tiles). Pure styled DOM —
 * no image assets, theme-aware via tokens only.
 */
export function MockWindow({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const dot = compact ? "h-1 w-1" : "h-2 w-2";

  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden border bg-card ${compact ? "rounded-sm" : "rounded-md"} ${className}`}
    >
      <div
        className={`flex items-center border-b bg-secondary ${compact ? "gap-1 px-2 py-1" : "gap-1.5 px-3 py-2"}`}
      >
        <span className={`${dot} rounded-full bg-muted-foreground/30`} />
        <span className={`${dot} rounded-full bg-muted-foreground/30`} />
        <span className={`${dot} rounded-full bg-muted-foreground/30`} />
      </div>
      <div className={`flex flex-col ${compact ? "gap-1 p-2" : "gap-2 p-4"}`}>
        <span className={`${compact ? "h-1" : "h-2"} w-3/4 rounded-sm bg-muted-foreground/20`} />
        <span className={`${compact ? "h-1" : "h-2"} w-1/2 rounded-sm bg-muted-foreground/15`} />
        {!compact && (
          <>
            <span className="h-2 w-2/3 rounded-sm bg-muted-foreground/15" />
            <span className="mt-1 h-10 w-full rounded-sm bg-secondary" />
          </>
        )}
      </div>
    </div>
  );
}
