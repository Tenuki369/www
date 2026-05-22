export default function LogisticsWorkspacePage() {
  const assets = [
    { label: 'Active loads', value: '21' },
    { label: 'On-time rate', value: '98%' },
    { label: 'Tracked assets', value: '64' },
    { label: 'Cost variance', value: '-6.3%' },
  ];

  return (
    <main className="px-6 py-8 lg:px-10">
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
          Physical logistics
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Dispatch and asset optimization</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(var(--muted))]">
          This tier focuses on transportation execution, tracked assets, and cost reduction across the network.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {assets.map((item) => (
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
            Dispatch board, asset twin, and transportation cost heatmap will be connected here next.
          </p>
        </div>
      </section>
    </main>
  );
}
