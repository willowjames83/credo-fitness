"use client";

// Route-segment error boundary for the root segment. Rendered inside the root
// layout, so it does not include <html>/<body>.
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error boundary:", error);
  }, [error]);

  return (
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
          This page hit an unexpected error. You can try again.
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
  );
}
