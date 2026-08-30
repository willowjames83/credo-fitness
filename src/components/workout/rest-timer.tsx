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
          ? "border-[#E8501A] bg-[#E8501A]"
          : "border-[#E5E5E8] bg-[#FFF0E9]"
      }`}
    >
      <div className="flex flex-col">
        <span
          className={`text-xs font-semibold tracking-wide uppercase ${
            done ? "text-white/85" : "text-[#E8501A]"
          }`}
        >
          {done ? "Rest over — next set" : "Rest"}
        </span>
        <span
          className={`font-mono text-3xl font-semibold tabular-nums ${
            done ? "text-white" : "text-[#E8501A]"
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
            className="h-11 rounded-[10px] border border-[#E8501A]/25 bg-white px-3 text-sm font-semibold text-[#E8501A] transition-colors hover:bg-[#FFF0E9]"
          >
            +30s
          </button>
        )}
        <button
          type="button"
          onClick={onSkip}
          className={`h-11 rounded-[10px] px-4 text-sm font-semibold transition-colors ${
            done
              ? "bg-white text-[#E8501A] hover:bg-[#FFF0E9]"
              : "border border-[#E8501A]/25 bg-white text-[#E8501A] hover:bg-[#FFF0E9]"
          }`}
        >
          {done ? "Go" : "Skip"}
        </button>
      </div>
    </div>
  );
}
