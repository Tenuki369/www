export default function FinancialWorkspacePage() {
  const metrics = [
    { label: 'Available cash', value: '$18.2M' },
    { label: 'Pending exceptions', value: '4' },
    { label: 'Auto-matched items', value: '96%' },
    { label: 'Settlement window', value: 'T+0 / T+1' },
  ];

  return (
    <main className="px-6 py-8 lg:px-10">
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
          Financial operations
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Capital routing and reconciliation</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(var(--muted))]">
          This tier focuses on payments, ledger synchronization, and liquidity visibility with an
          exception-first operating model.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] uppercase">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-black text-white">{metric.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-white">Workspace actions</p>
          <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
            Reconciliation graph, payment routing, and liquidity simulations will be added here in the next
            build phase.
          </p>
        </div>
      </section>
    </main>
  );
}
