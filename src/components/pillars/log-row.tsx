"use client";

// A single logged item (cardio session, stability session, protein entry) with
// a confirm-then-delete affordance. Shared by all three pillar pages.

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface LogRowProps {
  title: string;
  meta: string;
  /** Mono numeral shown on the right, e.g. "45" */
  value: string;
  /** Small unit after the value, e.g. "min" or "g". */
  unit: string;
  color: string;
  onDelete: () => Promise<void>;
}

export function LogRow({
  title,
  meta,
  value,
  unit,
  color,
  onDelete,
}: LogRowProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function remove() {
    if (pending) return;
    setPending(true);
    try {
      await onDelete();
    } finally {
      setPending(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-app bg-card-surface px-3.5 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-text-primary">
          {title}
        </div>
        <div className="mt-0.5 truncate text-[11px] text-text-tertiary">{meta}</div>
      </div>

      <div className="shrink-0 text-right">
        <span
          className="font-mono text-[16px] font-semibold"
          style={{ color }}
        >
          {value}
        </span>
        <span className="ml-0.5 text-[11px] text-text-tertiary">{unit}</span>
      </div>

      {confirming ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="focus-ring rounded-[8px] px-2 py-1 text-[12px] font-medium text-text-secondary transition-colors hover:bg-surface"
          >
            Keep
          </button>
          <button
            type="button"
            onClick={() => void remove()}
            disabled={pending}
            className="focus-ring rounded-[8px] bg-danger px-2.5 py-1 text-[12px] font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {pending ? "…" : "Delete"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Delete ${title}`}
          className="focus-ring shrink-0 rounded-full p-1.5 text-text-tertiary transition-colors hover:bg-surface hover:text-danger"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
