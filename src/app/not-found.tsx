import Link from "next/link";

// Branded 404. Rendered inside the root layout.
export default function NotFound() {
  return (
    <main
      role="main"
      className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-6 text-center text-text-primary"
    >
      <span className="text-[11px] font-bold uppercase tracking-[3px] text-credo">
        Credo
      </span>
      <div className="flex flex-col items-center gap-3">
        <p className="font-display text-5xl leading-none text-text-primary">404</p>
        <h1 className="text-xl font-semibold text-text-primary">
          Page not found
        </h1>
        <p className="max-w-sm text-sm text-text-secondary">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/app/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-credo px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credo/55 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Go to dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-app px-6 text-sm font-semibold text-text-primary transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credo/55 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
