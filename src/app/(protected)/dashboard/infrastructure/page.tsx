export default function InfrastructureWorkspacePage() {
  const signals = [
    { label: 'API endpoints', value: '18' },
    { label: 'Automations live', value: '11' },
    { label: 'Agent runs today', value: '42' },
    { label: 'Incidents', value: '1' },
  ];

  return (
    <main className="px-6 py-8 lg:px-10">
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
          Digital infrastructure
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Automation and API control</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(var(--muted))]">
          This tier governs APIs, event-driven workflows, and multi-agent tooling across the tenant.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {signals.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] uppercase">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-white">Workspace actions</p>
          <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
            API registry, command orchestration, and workflow publishing will live here next.
          </p>
        </div>
      </section>
    </main>
  );
}
