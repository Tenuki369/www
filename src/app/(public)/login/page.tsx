export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <p className="text-xs font-semibold tracking-[0.24em] text-[rgb(var(--accent))] uppercase">
          Authentication
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
          Enter the tenant-aware workspace.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[rgb(var(--muted))]">
          Version 0.a uses a demo session contract. In the production build, this surface will hand off to
          secure identity providers and tenant binding.
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">
          <div>
            <label className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))] uppercase">
              Demo route
            </label>
            <div className="mt-2 rounded-xl border border-white/10 bg-[rgb(var(--background))] px-4 py-3 text-sm text-white">
              Provide an <code className="font-mono text-[rgb(var(--accent))]">x-demo-tier</code> header to
              simulate authenticated access.
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/dashboard"
              className="rounded-full bg-[rgb(var(--accent))] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Continue to dashboard
            </a>
            <a
              href="/intake"
              className="rounded-full border border-[rgb(var(--border))] bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to intake
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
