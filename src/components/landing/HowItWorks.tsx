const steps = [
  { lead: "Drop in any image", rest: "no account, no setup." },
  {
    lead: "Style it in your browser",
    rest: "every pixel is processed locally, nothing uploads.",
  },
  { lead: "Export", rest: "PNG, JPEG, or WebP at 2x resolution." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-content px-4 py-20 md:px-6">
      <p className="font-mono text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        How it works
      </p>
      <h2 className="mt-4 text-3xl font-bold">Three steps, zero friction</h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.lead}
            className="flex flex-col gap-3 rounded-lg border bg-card p-5 transition-[border-color,box-shadow] duration-120 ease-out hover:border-strong hover:shadow-card"
          >
            <span className="font-mono text-sm font-medium text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{step.lead}</span>{" "}
              — {step.rest}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
