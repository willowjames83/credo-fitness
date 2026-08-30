"use client";

import { X, TrendingUp, TrendingDown, MinusCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import type { SetAdjustment } from "@/lib/types";

interface AdjustmentChipProps {
  adjustment: SetAdjustment;
  /** Present only for reduce_weight — applies nextSetWeight to the next set. */
  onApply?: () => void;
  onDismiss: () => void;
}

const ICONS = {
  reduce_weight: TrendingDown,
  flag_increase: TrendingUp,
  reduce_volume: MinusCircle,
  none: Info,
} as const;

export function AdjustmentChip({ adjustment, onApply, onDismiss }: AdjustmentChipProps) {
  const Icon = ICONS[adjustment.action];
  const positive = adjustment.action === "flag_increase";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-2.5 rounded-[14px] border px-3.5 py-3 ${
        positive
          ? "border-[#2D8A4E]/25 bg-[#E8F5ED]"
          : "border-[#C47A1A]/25 bg-[#FFF3E0]"
      }`}
    >
      <Icon
        size={16}
        className={`mt-0.5 shrink-0 ${positive ? "text-[#2D8A4E]" : "text-[#C47A1A]"}`}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-[13px] leading-snug text-[#1A1A1E]">{adjustment.reason}</p>
        {adjustment.action === "reduce_weight" &&
          adjustment.nextSetWeight != null &&
          onApply && (
            <button
              type="button"
              onClick={onApply}
              className="self-start rounded-[8px] bg-[#C47A1A] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Set next set to {adjustment.nextSetWeight} lb
            </button>
          )}
      </div>
      <button
        type="button"
        aria-label="Dismiss suggestion"
        onClick={onDismiss}
        className="shrink-0 rounded p-1 text-[#9E9EA3] transition-colors hover:text-[#1A1A1E]"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
