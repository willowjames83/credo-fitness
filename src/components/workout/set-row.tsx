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
    "focus-ring h-11 w-full min-w-0 rounded-[10px] border border-app bg-card-surface px-3 text-center font-mono text-base font-medium text-text-primary outline-none transition-colors focus:border-credo disabled:bg-surface disabled:text-text-tertiary";

  return (
    <div
      className={`grid grid-cols-[36px_1fr_1fr_52px] items-center gap-2 py-2 ${
        state.completed ? "opacity-60" : ""
      }`}
    >
      <span className="text-sm font-semibold text-text-secondary">{setNumber}</span>
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
          className={`focus-ring flex h-11 w-11 items-center justify-center rounded-[10px] border transition-colors ${
            state.completed
              ? "border-success bg-success text-white"
              : "border-app bg-card-surface text-text-tertiary hover:border-success hover:text-success"
          } disabled:opacity-40`}
        >
          <Check size={18} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
}
