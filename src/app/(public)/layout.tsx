import type { ReactNode } from 'react';

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <header className="border-b border-white/10 bg-black/20">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
              Unified Services Platform
            </p>
            <p className="text-xs text-[rgb(var(--muted))]">Conversion plane</p>
          </div>
          <nav className="flex items-center gap-4 text-sm text-[rgb(var(--muted))]">
            <a className="transition hover:text-[rgb(var(--foreground))]" href="/intake">
              Intake
            </a>
            <a className="transition hover:text-[rgb(var(--foreground))]" href="/login">
              Login
            </a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
