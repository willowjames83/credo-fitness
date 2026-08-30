"use client";

import { useEffect, useReducer } from "react";
import { nowMs } from "./time";

interface RestTimerProps {
  /** Epoch ms when the rest period ends. */
  endsAt: number;
  onSkip: () => void;
  onExtend: (seconds: number) => void;
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function RestTimer({ endsAt, onSkip, onExtend }: RestTimerProps) {
  // Re-render each second; remaining time is always derived from the
  // endsAt timestamp so tab sleep / throttling never causes drift.
  const [, tick] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.ceil((endsAt - nowMs()) / 1000);
  const done = remaining <= 0;

  return (
    <div
      role="timer"
      aria-live="polite"
      className={`flex items-center justify-between rounded-[14px] border px-4 py-3 transition-colors ${
        done
          ? "border-credo bg-credo"
          : "border-app bg-credo-light"
      }`}
    >
      <div className="flex flex-col">
        <span
          className={`text-xs font-semibold tracking-wide uppercase ${
            done ? "text-white/85" : "text-credo"
          }`}
        >
          {done ? "Rest over — next set" : "Rest"}
        </span>
        <span
          className={`font-mono text-3xl font-semibold tabular-nums ${
            done ? "text-white" : "text-credo"
          }`}
        >
          {formatClock(remaining)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!done && (
          <button
            type="button"
            onClick={() => onExtend(30)}
            className="focus-ring h-11 rounded-[10px] border border-credo/25 bg-card-surface px-3 text-sm font-semibold text-credo transition-colors hover:bg-credo-light"
          >
            +30s
          </button>
        )}
        <button
          type="button"
          onClick={onSkip}
          className={`focus-ring h-11 rounded-[10px] px-4 text-sm font-semibold transition-colors ${
            done
              ? "bg-card-surface text-credo hover:bg-credo-light"
              : "border border-credo/25 bg-card-surface text-credo hover:bg-credo-light"
          }`}
        >
          {done ? "Go" : "Skip"}
        </button>
      </div>
    </div>
  );
}
