import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/auth';
import { endDemoSession } from '@/lib/session-actions';
import { CommandPalette } from '@/components/command-palette';

const navItems = [
  { href: '/dashboard', label: 'Router' },
  { href: '/dashboard/financial', label: 'Financial' },
  { href: '/dashboard/advisory', label: 'Advisory' },
  { href: '/dashboard/infrastructure', label: 'Infrastructure' },
  { href: '/dashboard/logistics', label: 'Logistics' },
  { href: '/settings', label: 'Settings' },
];

export default async function ProtectedLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getUserSession();

  if (!user || !user.tier) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 bg-black/20 px-6 py-6">
          <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5">
            <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
              Workspace shell
            </p>
            <h1 className="mt-3 text-xl font-black text-white">Anti-legacy dashboard</h1>
            <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
              Tenant-aware navigation, command-first workflows, and low-friction routing.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-[rgb(var(--muted))] transition hover:border-white/10 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-[rgb(var(--muted))]">
            <p className="font-semibold text-white">Command surface</p>
            <p className="mt-1">Cmd+K registry and contextual ranking are live in this build.</p>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="border-b border-white/10 bg-black/10 px-6 py-4 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
                  Active tier
                </p>
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                  {user.tier.replace('_', ' ')} · {user.email}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted))]">
                <span>
                  Press <span className="font-semibold text-white">Cmd+K</span> to open the command palette
                </span>
                <form action={endDemoSession}>
                  <button
                    type="submit"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-white transition hover:bg-white/10"
                  >
                    Log out
                  </button>
                </form>
              </div>
            </div>
          </div>

          {children}
        </main>
      </div>

      <CommandPalette tier={user.tier} />
    </div>
  );
}
