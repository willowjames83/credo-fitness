"use client";

import { motion } from "framer-motion";

interface RpeSheetProps {
  exerciseName: string;
  onSelect: (rating: number) => void;
  onSkip: () => void;
}

const RATINGS = [
  { value: 1, label: "Easy" },
  { value: 2, label: "Moderate" },
  { value: 3, label: "Working" },
  { value: 4, label: "Hard" },
  { value: 5, label: "Max effort" },
];

export function RpeSheet({ exerciseName, onSelect, onSkip }: RpeSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onSkip}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        role="dialog"
        aria-label={`Rate effort for ${exerciseName}`}
        className="relative w-full max-w-[640px] rounded-t-[20px] border border-app bg-card-surface p-5 pb-[calc(20px+env(safe-area-inset-bottom))] lg:max-w-[420px] lg:rounded-[20px] lg:pb-5"
      >
        <p className="text-[11px] font-semibold tracking-[1.5px] text-text-tertiary uppercase">
          How hard was that?
        </p>
        <p className="mt-1 text-base font-semibold text-text-primary">{exerciseName}</p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onSelect(r.value)}
              className="focus-ring flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-[12px] border border-app bg-card-surface py-2 transition-colors hover:border-credo hover:bg-credo-light"
            >
              <span className="font-mono text-lg font-semibold text-text-primary">
                {r.value}
              </span>
              <span className="text-[10px] leading-tight font-medium text-text-secondary">
                {r.label}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="focus-ring mt-3 h-11 w-full rounded-[10px] text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
        >
          Skip
        </button>
      </motion.div>
    </div>
  );
}
