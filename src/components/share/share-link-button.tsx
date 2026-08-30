"use client";

// Reusable "Share" ghost button: calls a POST /api/share-shaped action,
// copies the resulting absolute URL, and shows a brief "Link copied" state.
// Used by the splits page (custom split share toggle) and the workout
// summary screen (share workout).

import { useState } from "react";
import { Check, Link2, Loader2 } from "lucide-react";
import { copyToClipboard } from "./api";

export function ShareLinkButton({
  onShare,
  label = "Share",
  className = "",
}: {
  /** Performs the share API call and returns the relative share URL (e.g. "/s/abc123"). */
  onShare: () => Promise<{ url: string }>;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "copied" | "error">("idle");

  async function handleClick() {
    if (state === "loading") return;
    setState("loading");
    try {
      const { url } = await onShare();
      const absolute = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
      const copied = await copyToClipboard(absolute);
      setState(copied ? "copied" : "error");
      if (copied) setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "loading"}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--shell-border)] bg-white px-3.5 text-[13px] font-semibold text-[var(--shell-text-primary)] transition-colors hover:border-[var(--shell-text-tertiary)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {state === "loading" ? (
        <Loader2 size={14} className="animate-spin" />
      ) : state === "copied" ? (
        <Check size={14} className="text-[var(--shell-success)]" />
      ) : (
        <Link2 size={14} />
      )}
      {state === "copied" ? "Link copied" : state === "error" ? "Couldn't share" : label}
    </button>
  );
}
