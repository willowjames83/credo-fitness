"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

export interface SetRowState {
  weight: string;
  reps: string;
  completed: boolean;
}

interface SetRowProps {
  setNumber: number;
  state: SetRowState;
  disabled?: boolean;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onComplete: () => void;
  onUncomplete: () => void;
}

function sanitizeNumeric(value: string): string {
  return value.replace(/[^0-9.]/g, "");
}

export function SetRow({
  setNumber,
  state,
  disabled,
  onWeightChange,
  onRepsChange,
  onComplete,
  onUncomplete,
}: SetRowProps) {
  const inputClass =
    "h-11 w-full min-w-0 rounded-[10px] border border-[#E5E5E8] bg-white px-3 text-center font-mono text-base font-medium text-[#1A1A1E] outline-none transition-colors focus:border-[#E8501A] disabled:bg-[#F7F7F8] disabled:text-[#9E9EA3]";

  return (
    <div
      className={`grid grid-cols-[36px_1fr_1fr_52px] items-center gap-2 py-2 ${
        state.completed ? "opacity-60" : ""
      }`}
    >
      <span className="text-sm font-semibold text-[#6B6B73]">{setNumber}</span>
      <input
        type="text"
        inputMode="decimal"
        aria-label={`Set ${setNumber} weight (lb)`}
        value={state.weight}
        disabled={disabled || state.completed}
        onChange={(e) => onWeightChange(sanitizeNumeric(e.target.value))}
        className={inputClass}
      />
      <input
        type="text"
        inputMode="numeric"
        aria-label={`Set ${setNumber} reps`}
        value={state.reps}
        disabled={disabled || state.completed}
        onChange={(e) => onRepsChange(sanitizeNumeric(e.target.value).replace(/\./g, ""))}
        className={inputClass}
      />
      <div className="flex justify-end">
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          animate={state.completed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 }}
          disabled={disabled}
          aria-label={
            state.completed
              ? `Set ${setNumber} completed — tap to undo`
              : `Complete set ${setNumber}`
          }
          onClick={state.completed ? onUncomplete : onComplete}
          className={`flex h-11 w-11 items-center justify-center rounded-[10px] border transition-colors ${
            state.completed
              ? "border-[#2D8A4E] bg-[#2D8A4E] text-white"
              : "border-[#E5E5E8] bg-white text-[#9E9EA3] hover:border-[#2D8A4E] hover:text-[#2D8A4E]"
          } disabled:opacity-40`}
        >
          <Check size={18} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
}
