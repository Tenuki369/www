export default function IntakePage() {
  const steps = [
    'Company profile',
    'Operating footprint',
    'Service tier intent',
    'Compliance constraints',
    'Authentication handoff',
  ];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-5xl flex-col justify-center px-6 py-16">
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
          Dynamic intake
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
          Route the user before they ever touch the software.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[rgb(var(--muted))]">
          The intake engine captures operational context, qualifies the service tier, and hands the user
          into the correct authenticated experience.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-sm font-black text-black">
                {index + 1}
              </div>
              <span className="text-sm font-medium text-white">{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/login"
            className="rounded-full bg-[rgb(var(--accent))] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Continue to authentication
          </a>
          <a
            href="/"
            className="rounded-full border border-[rgb(var(--border))] bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to landing
          </a>
        </div>
      </section>
    </main>
  );
}
