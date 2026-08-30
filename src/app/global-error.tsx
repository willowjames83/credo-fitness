"use client";

// Top-level error boundary. This replaces the root layout entirely when the
// root itself throws, so it must render its own <html>/<body> and pull in the
// global stylesheet to get the Credo design tokens.
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <main
          role="alert"
          aria-live="assertive"
          className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-6 text-center text-text-primary"
        >
          <span className="text-[11px] font-bold uppercase tracking-[3px] text-credo">
            Credo
          </span>
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">
              Something went wrong
            </h1>
            <p className="max-w-sm text-sm text-text-secondary">
              An unexpected error interrupted the app. You can try again — if it
              keeps happening, please reload in a moment.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-credo px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credo/55 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
