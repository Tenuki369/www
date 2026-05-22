import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/auth';

function MasterDashboard() {
  const cards = [
    {
      title: 'Financial Operations',
      value: '0 open exceptions',
      body: 'Payments, reconciliation, and liquidity are in sync.',
    },
    {
      title: 'Managed Solutions',
      value: '3 milestones active',
      body: 'Advisor-led work is progressing against planned checkpoints.',
    },
    {
      title: 'Automation Fabric',
      value: '12 workflows enabled',
      body: 'API and workflow infrastructure is ready for orchestration.',
    },
    {
      title: 'Logistics Optimization',
      value: '2 active routes',
      body: 'Dispatch and asset movement are being monitored in real time.',
    },
  ];

  return (
    <main className="px-6 py-8 lg:px-10">
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
          Router dashboard
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">All-Inclusive control center</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(var(--muted))]">
          This is the consolidated operating view for users with access across all service pillars.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <h2 className="text-base font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-xl font-black text-[rgb(var(--accent))]">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">{card.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default async function DashboardRouter() {
  const user = await getUserSession();

  if (!user || !user.tier) {
    redirect('/intake');
  }

  if (user.tier === 'ALL_INCLUSIVE') {
    return <MasterDashboard />;
  }

  switch (user.tier) {
    case 'FINANCIAL':
      redirect('/dashboard/financial');
    case 'ADVISORY':
      redirect('/dashboard/advisory');
    case 'INFRASTRUCTURE':
      redirect('/dashboard/infrastructure');
    case 'LOGISTICS':
      redirect('/dashboard/logistics');
    default:
      redirect('/intake');
  }
}
