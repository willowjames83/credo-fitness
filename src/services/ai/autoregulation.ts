// autoregulation.ts
// Real-time set-by-set adjustment rules (PRD 3.1 "REAL-TIME ADJUSTMENT RULES").
// Pure module: everything the rules need is passed in.

import type { CompletedSetInput, PlannedExerciseSpec, SetAdjustment } from "@/lib/types";
import { roundToIncrement } from "./weight-recommender";

export interface AdjustAfterSetParams {
  plannedExercise: PlannedExerciseSpec;
  /** All sets completed so far for this exercise, including `justCompleted`. */
  completedSets: CompletedSetInput[];
  justCompleted: CompletedSetInput;
  roundingIncrement?: number;
}

/**
 * PRD rules, evaluated in priority order after each completed set:
 * 1. reps < targetReps[0] by 2+          → reduce next set weight 5-10%
 * 2. RPE >= 9                            → reduce remaining volume by 1 set
 * 3. reps > targetReps[1] by 2+          → flag for weight increase next session
 * 4. rest > 2x recommended               → note fatigue, adjust expectations
 */
export function adjustAfterSet(params: AdjustAfterSetParams): SetAdjustment {
  const { plannedExercise, justCompleted } = params;
  const increment = params.roundingIncrement ?? 5;
  const [minReps, maxReps] = plannedExercise.targetReps;
  const weight = justCompleted.weight || plannedExercise.recommendedWeight;

  // Rule 1: fell short of the rep floor by 2+ → drop weight for the next set.
  const shortfall = minReps - justCompleted.reps;
  if (shortfall >= 2) {
    // 5% short by 2-3 reps, 10% short by 4+.
    const pct = shortfall >= 4 ? 0.1 : 0.05;
    const nextSetWeight = Math.max(0, roundToIncrement(weight * (1 - pct), increment));
    return {
      action: "reduce_weight",
      nextSetWeight,
      reason: `Only ${justCompleted.reps} reps against a target of ${minReps}-${maxReps} — dropping ${Math.round(pct * 100)}% for the next set.`,
    };
  }

  // Rule 2 (PRD rule 3): near-max exertion → cut one set of remaining volume.
  if (justCompleted.rpe != null && justCompleted.rpe >= 9) {
    return {
      action: "reduce_volume",
      dropSets: 1,
      reason: `RPE ${justCompleted.rpe}/10 — that was close to your limit. Cutting one set to keep quality high.`,
    };
  }

  // Rule 3 (PRD rule 2): beat the rep ceiling by 2+ → weight goes up next time.
  if (justCompleted.reps - maxReps >= 2) {
    return {
      action: "flag_increase",
      reason: `${justCompleted.reps} reps beats the ${minReps}-${maxReps} target — flagged for a weight increase next session.`,
    };
  }

  // Rule 4: rest ran way over → note fatigue, no weight change.
  if (
    justCompleted.restDuration != null &&
    plannedExercise.restPeriod > 0 &&
    justCompleted.restDuration > plannedExercise.restPeriod * 2
  ) {
    return {
      action: "none",
      reason: `Rest ran ${justCompleted.restDuration}s against a ${plannedExercise.restPeriod}s target — fatigue noted, expectations adjusted for the rest of this session.`,
    };
  }

  return { action: "none", reason: "Right on target — keep going." };
}
