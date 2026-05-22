import { isServiceTier } from '@/lib/auth';
import { startDemoSession } from '@/lib/session-actions';
import { ORDERED_TIERS } from '@/lib/tiers';

interface LoginPageProps {
  searchParams: Promise<{ tier?: string; redirect?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const suggested = isServiceTier(params.tier) ? params.tier : null;
  const redirectTo = params.redirect;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-4xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
          Authentication
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
          Enter the tenant-aware workspace.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[rgb(var(--muted))]">
          Version 0.a uses a demo session. Choose the service tier to bind this session to — the production
          build will hand off to a secure identity provider and real tenant binding.
        </p>

        {params.error === 'invalid-tier' ? (
          <p className="mt-6 rounded-xl border border-[rgb(var(--danger))]/40 bg-[rgb(var(--danger))]/10 px-4 py-3 text-sm text-[rgb(var(--danger))]">
            That tier wasn&apos;t recognized. Pick one below to continue.
          </p>
        ) : null}

        {suggested ? (
          <p className="mt-6 rounded-xl border border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent))]/10 px-4 py-3 text-sm text-white">
            Based on your intake, we suggest the{' '}
            <span className="font-semibold text-[rgb(var(--accent))]">{suggested.replace('_', ' ')}</span> tier.
            It&apos;s pre-selected below.
          </p>
        ) : null}

        <form action={startDemoSession} className="mt-8">
          {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}

          <fieldset className="grid gap-3 md:grid-cols-2">
            <legend className="sr-only">Select a service tier</legend>
            {ORDERED_TIERS.map((tier, index) => {
              const checked = suggested ? tier.key === suggested : index === 0;
              return (
                <label
                  key={tier.key}
                  className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition hover:border-white/20 has-[:checked]:border-[rgb(var(--accent))] has-[:checked]:bg-[rgb(var(--accent))]/5"
                >
                  <input
                    type="radio"
                    name="tier"
                    value={tier.key}
                    defaultChecked={checked}
                    className="mt-1 h-4 w-4 accent-[rgb(var(--accent))]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{tier.name}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-[rgb(var(--muted))]">
                      {tier.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-[rgb(var(--accent))] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Continue to dashboard
            </button>
            <a
              href="/intake"
              className="rounded-full border border-[rgb(var(--border))] bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to intake
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}
