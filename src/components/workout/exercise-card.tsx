"use client";

import type { PlannedExerciseDTO, SetAdjustment } from "@/lib/types";
import { SetRow, type SetRowState } from "./set-row";
import { AdjustmentChip } from "./adjustment-chip";

interface ExerciseCardProps {
  exercise: PlannedExerciseDTO;
  sets: SetRowState[];
  adjustment: SetAdjustment | null;
  onWeightChange: (setIndex: number, value: string) => void;
  onRepsChange: (setIndex: number, value: string) => void;
  onCompleteSet: (setIndex: number) => void;
  onUncompleteSet: (setIndex: number) => void;
  onApplyAdjustment: () => void;
  onDismissAdjustment: () => void;
}

export function ExerciseCard({
  exercise,
  sets,
  adjustment,
  onWeightChange,
  onRepsChange,
  onCompleteSet,
  onUncompleteSet,
  onApplyAdjustment,
  onDismissAdjustment,
}: ExerciseCardProps) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E5E5E8] bg-white">
      <div className="border-b border-[#E5E5E8] px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-[#1A1A1E]">
            {exercise.name}
          </span>
          <span className="shrink-0 rounded-[6px] bg-[#F7F7F8] px-2 py-1 font-mono text-xs text-[#6B6B73]">
            {exercise.targetSets} × {exercise.targetRepMin}-{exercise.targetRepMax}
          </span>
        </div>
        {exercise.previousSession && (
          <p className="mt-1 text-xs text-[#9E9EA3]">
            Previous: {exercise.previousSession}
          </p>
        )}
        {exercise.rationale && (
          <p className="mt-1 text-xs text-[#1A7A6D]">{exercise.rationale}</p>
        )}
      </div>

      <div className="px-4 py-2">
        <div className="grid grid-cols-[36px_1fr_1fr_52px] gap-2 border-b border-[#EEEFF1] py-2">
          <span className="text-[11px] font-semibold text-[#9E9EA3] uppercase">Set</span>
          <span className="text-center text-[11px] font-semibold text-[#9E9EA3] uppercase">
            lb
          </span>
          <span className="text-center text-[11px] font-semibold text-[#9E9EA3] uppercase">
            Reps
          </span>
          <span aria-hidden />
        </div>
        {sets.map((s, i) => (
          <SetRow
            key={i}
            setNumber={i + 1}
            state={s}
            onWeightChange={(v) => onWeightChange(i, v)}
            onRepsChange={(v) => onRepsChange(i, v)}
            onComplete={() => onCompleteSet(i)}
            onUncomplete={() => onUncompleteSet(i)}
          />
        ))}
      </div>

      {adjustment && (
        <div className="px-4 pb-4">
          <AdjustmentChip
            adjustment={adjustment}
            onApply={
              adjustment.action === "reduce_weight" ? onApplyAdjustment : undefined
            }
            onDismiss={onDismissAdjustment}
          />
        </div>
      )}
    </div>
  );
}
