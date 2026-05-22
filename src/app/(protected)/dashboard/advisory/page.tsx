export default function AdvisoryWorkspacePage() {
  const milestones = [
    { label: 'Active projects', value: '7' },
    { label: 'Evidence items', value: '24' },
    { label: 'Reviews due', value: '3' },
    { label: 'SLA risk', value: 'Low' },
  ];

  return (
    <main className="px-6 py-8 lg:px-10">
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
          Skilled advisory
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Managed solutions and compliance</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(var(--muted))]">
          This tier organizes advisor-led work, milestone evidence, and compliance reviews in one place.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {milestones.map((item) => (
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
            Workflow runner, evidence vault, and escalation mesh will be connected in the next build phase.
          </p>
        </div>
      </section>
    </main>
  );
}
