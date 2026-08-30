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
        className="absolute inset-0 bg-[#1A1A1E]/40"
        onClick={onSkip}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        role="dialog"
        aria-label={`Rate effort for ${exerciseName}`}
        className="relative w-full max-w-[640px] rounded-t-[20px] border border-[#E5E5E8] bg-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))] lg:max-w-[420px] lg:rounded-[20px] lg:pb-5"
      >
        <p className="text-[11px] font-semibold tracking-[1.5px] text-[#9E9EA3] uppercase">
          How hard was that?
        </p>
        <p className="mt-1 text-base font-semibold text-[#1A1A1E]">{exerciseName}</p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onSelect(r.value)}
              className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-[12px] border border-[#E5E5E8] bg-white py-2 transition-colors hover:border-[#E8501A] hover:bg-[#FFF0E9]"
            >
              <span className="font-mono text-lg font-semibold text-[#1A1A1E]">
                {r.value}
              </span>
              <span className="text-[10px] leading-tight font-medium text-[#6B6B73]">
                {r.label}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 h-11 w-full rounded-[10px] text-sm font-medium text-[#6B6B73] transition-colors hover:bg-[#F7F7F8]"
        >
          Skip
        </button>
      </motion.div>
    </div>
  );
}
