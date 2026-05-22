import { getUserSession } from '@/lib/auth';
import { listAgentSummaries } from '@/lib/agents/registry';
import { AgentStudio } from '@/components/agent-studio';

export default async function InfrastructureWorkspacePage() {
  const user = await getUserSession();
  const tier = user?.tier ?? null;

  // Show agents the active tier is entitled to run.
  const agents = listAgentSummaries().filter(
    (agent) =>
      tier === 'ALL_INCLUSIVE' || agent.pillar === 'ALL_INCLUSIVE' || agent.pillar === tier,
  );

  const signals = [
    { label: 'API endpoints', value: '18' },
    { label: 'Automations live', value: '11' },
    { label: 'Agents available', value: String(agents.length) },
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
      </section>

      <section className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
            Multi-Agent Workflow Studio
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Run an agent</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[rgb(var(--muted))]">
            Configured agents run server-side on Claude with their role, guardrails, and tools. Review the
            reasoning and tool trace before acting on the result.
          </p>
        </div>

        <AgentStudio agents={agents} />
      </section>
    </main>
  );
}
