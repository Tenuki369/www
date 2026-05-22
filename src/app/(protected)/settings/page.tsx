import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/auth';
import { endDemoSession, startDemoSession } from '@/lib/session-actions';
import { ORDERED_TIERS } from '@/lib/tiers';

export default async function SettingsPage() {
  const user = await getUserSession();

  if (!user || !user.tier) {
    redirect('/login');
  }

  return (
    <main className="px-6 py-8 lg:px-10">
      <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
          Tenant settings
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Session and access</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(var(--muted))]">
          Preferences and access management. In 0.a this surface controls the demo session; production will
          add real RBAC policy, entitlements, and audit history.
        </p>

        <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { label: 'Operator', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'Tenant', value: user.tenantId },
            { label: 'Active tier', value: user.tier.replace('_', ' ') },
            { label: 'Roles', value: user.roles.join(', ') },
            { label: 'Permissions', value: user.permissions.join(', ') },
          ].map((row) => (
            <div key={row.label} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <dt className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] uppercase">
                {row.label}
              </dt>
              <dd className="mt-2 text-sm font-medium text-white">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8">
        <h2 className="text-lg font-semibold text-white">Switch service tier</h2>
        <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
          Rebind this demo session to a different tier to preview its workspace and command set.
        </p>

        <form action={startDemoSession} className="mt-6 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] uppercase">
              Tier
            </span>
            <select
              name="tier"
              defaultValue={user.tier}
              className="min-w-[220px] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[rgb(var(--accent))]"
            >
              {ORDERED_TIERS.map((tier) => (
                <option key={tier.key} value={tier.key}>
                  {tier.name} — {tier.tagline}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full bg-[rgb(var(--accent))] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Apply tier
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-3xl border border-[rgb(var(--danger))]/30 bg-[rgb(var(--danger))]/5 p-8">
        <h2 className="text-lg font-semibold text-white">End session</h2>
        <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
          Clears the demo session cookie and returns to the authentication surface.
        </p>
        <form action={endDemoSession} className="mt-6">
          <button
            type="submit"
            className="rounded-full border border-[rgb(var(--danger))]/50 bg-[rgb(var(--danger))]/10 px-5 py-3 text-sm font-semibold text-[rgb(var(--danger))] transition hover:bg-[rgb(var(--danger))]/20"
          >
            Log out
          </button>
        </form>
      </section>
    </main>
  );
}
