/**
 * Credo adaptive training engine — public API barrel.
 *
 * Every module here is PURE: no DB access, no fetch, no hidden clock reads.
 * The API layer injects all data (exercise library, history, recovery states,
 * standards) and the current time (`now: Date`). Everything is deterministic,
 * so identical inputs always produce identical plans.
 *
 * Modules:
 * - workout-generator: THE core engine. `generateWorkout(...)` implements PRD
 *   3.1 Steps 1-7 for one training day; `generateWeek(...)` produces the full
 *   week honoring the split with recovery simulated between days.
 *   `determineSplit(...)` maps preferences → SplitDay[] (2d Full Body,
 *   3d PPL, 4d Upper/Lower, 5-6d PPL).
 * - weight-recommender: `epley1RM`, `best1RMFromHistory` (best-of-window),
 *   `recommendWeight` (goal → %1RM/rep-range table), `applyProgression`
 *   (fatigue deload -5% / double-progression +2.5-5%),
 *   `demographicEstimate1RM` (conservative no-history fallback).
 * - recovery-tracker: `updateRecoveryAfterWorkout`, `fatigueLevelFor`,
 *   `groupsAvailableForTraining`, `recoveryWindowHours` (48-72h+ scaled by
 *   volume and experience).
 * - exercise-selector: `selectExercises` (PRD Step 3: equipment/difficulty
 *   filters, compounds first, ~duration/8 exercises, variety rotation, focus
 *   and exclusions), `suggestAlternatives` (same-pattern substitutes),
 *   `orderForSession`.
 * - autoregulation: `adjustAfterSet` — the PRD real-time adjustment rules,
 *   returning a SetAdjustment after every completed set.
 * - score-calculator: `calculateStrengthScore` (8 weighted subscores,
 *   best-of-90-days, demographic percentiles with an injectable
 *   `StandardsLookup`), `calculateCardioScore`, `calculateStabilityScore`,
 *   `calculateNutritionScore`, `calculateCredoScore` (.3/.3/.2/.2),
 *   `computeScoreTrend`.
 * - warmup-generator: `generateWarmup` — 5-8 bodyweight/band movements
 *   targeting today's primary muscles (PRD 4.1).
 */

export {
  epley1RM,
  roundToIncrement,
  best1RMFromHistory,
  recommendWeight,
  applyProgression,
  detectFatigue,
  demographicEstimate1RM,
  GOAL_INTENSITY,
  type WeightRecommendation,
  type ProgressionResult,
  type ProgressionAction,
  type DemographicLookup,
} from "./weight-recommender";

export {
  recoveryWindowHours,
  fatigueLevelFor,
  updateRecoveryAfterWorkout,
  groupsAvailableForTraining,
  hoursSinceTrained,
  type TrainedGroupVolume,
} from "./recovery-tracker";

export {
  selectExercises,
  suggestAlternatives,
  orderForSession,
  isCompound,
  equipmentSatisfied,
  type SelectExercisesParams,
} from "./exercise-selector";

export {
  generateWorkout,
  generateWeek,
  determineSplit,
  splitTypeName,
  detectSkippedGroups,
  type GenerateWorkoutParams,
} from "./workout-generator";

export { adjustAfterSet, type AdjustAfterSetParams } from "./autoregulation";

export {
  calculateStrengthScore,
  calculateCardioScore,
  calculateStabilityScore,
  calculateNutritionScore,
  calculateCredoScore,
  computeScoreTrend,
  percentileFromStandard,
  defaultStandardsLookup,
  demographicContextString,
  scoreFromTarget,
  vo2maxScore,
  STRENGTH_SUBSCORE_WEIGHTS,
  CREDO_PILLAR_WEIGHTS,
  type StandardsLookup,
  type BenchmarkResultInput,
  type ScoreSnapshot,
  type CardioScoreInput,
  type StabilityScoreInput,
  type NutritionScoreInput,
  type PillarScores,
  type CalculateStrengthScoreParams,
} from "./score-calculator";

export {
  generateWarmup,
  type WarmupMovement,
  type WarmupRoutine,
} from "./warmup-generator";
