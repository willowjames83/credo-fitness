"use client";

// Error boundary scoped to the authenticated /app segment. Rendered inside the
// app shell (header, sidebar, tab bar stay put), so it fills the content area
// rather than the whole viewport.
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-16 text-center"
    >
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-lg font-semibold text-text-primary">
          Something went wrong
        </h1>
        <p className="max-w-xs text-sm text-text-secondary">
          We couldn&rsquo;t load this section. Try again — your data is safe.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-credo px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credo/55 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        Try again
      </button>
    </div>
  );
}
