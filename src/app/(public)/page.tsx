export default function MarketingLandingPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl flex-col justify-center gap-10 px-6 py-16">
      <section className="max-w-3xl">
        <p className="mb-4 inline-flex rounded-full border border-[rgb(var(--border))] bg-white/5 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-[rgb(var(--accent))] uppercase">
          0.a / unified services platform
        </p>
        <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
          Tenant-aware software for finance, advisory, infrastructure, and logistics.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[rgb(var(--muted))]">
          Replace legacy menus, spreadsheets, and siloed tools with one routing layer, one command surface,
          and one operating model for every service tier.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Capital routing',
            body: 'Payments, reconciliation, and liquidity control with exception-first workflows.',
          },
          {
            title: 'Managed solutions',
            body: 'Advisor-led projects, compliance evidence, and milestone orchestration.',
          },
          {
            title: 'Automation fabric',
            body: 'API control, multi-agent workflows, and task automation across the tenant.',
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.25)]"
          >
            <h2 className="text-lg font-semibold text-white">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">{card.body}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-wrap gap-3">
        <a
          href="/intake"
          className="rounded-full bg-[rgb(var(--accent))] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Start intake
        </a>
        <a
          href="/login"
          className="rounded-full border border-[rgb(var(--border))] bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Login
        </a>
      </section>
    </main>
  );
}
