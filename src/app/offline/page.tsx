import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "You're offline — Credo",
  description: "No connection right now. Your in-progress workout is safe on this device.",
};

// Static by design: the service worker serves this straight from the
// precache when the network is unreachable, so it can't depend on data.
export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--shell-surface)] px-5 py-10 font-marketing">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[2.5px] text-[var(--shell-accent)]">
            Credo
          </span>
        </div>

        <div className="rounded-[14px] border border-[var(--shell-border)] bg-white p-6 text-center shadow-[0_1px_2px_rgba(26,26,30,0.04)] sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--shell-accent-light)]">
            <WifiOff size={22} className="text-[var(--shell-accent)]" />
          </div>

          <h1 className="mt-4 font-display text-[26px] leading-tight text-[var(--shell-text-primary)]">
            You&apos;re offline
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--shell-text-secondary)]">
            Your in-progress workout is saved on this device and will be there when
            you&apos;re back. No sets are lost — just reconnect to sync and keep
            training.
          </p>

          <Link
            href="/app/dashboard"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-[10px] bg-[var(--shell-accent)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)]"
          >
            Back to dashboard
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--shell-text-tertiary)]">
          This page will refresh automatically once you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
