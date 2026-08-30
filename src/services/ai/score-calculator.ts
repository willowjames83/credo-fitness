// score-calculator.ts
// Strength Score (PRD 3.2), pillar scores, and composite Credo Score.
// Ports ScoringEngine / StrengthScoreCalculator / CardioScoreCalculator /
// StabilityScoreCalculator / NutritionScoreCalculator from the iOS app.
// Pure module: history, benchmarks, standards, and time are all injected.

import type {
  ExerciseHistoryEntry,
  Sex,
  StandardPercentiles,
  StrengthCategory,
  StrengthScoreResult,
  StrengthSubscore,
  UserProfileInput,
} from "@/lib/types";
import { best1RMFromHistory } from "./weight-recommender";

// ── Weights ─────────────────────────────────────────────────────────────────

/** PRD 3.2 subscore weights (15/15/15/15/10/10/10/10). */
export const STRENGTH_SUBSCORE_WEIGHTS: Record<StrengthCategory, number> = {
  "Upper Push": 0.15,
  "Upper Pull": 0.15,
  "Lower Push": 0.15,
  "Lower Pull": 0.15,
  Core: 0.1,
  Grip: 0.1,
  Carry: 0.1,
  "Muscular Endurance": 0.1,
};

/**
 * Composite Credo Score weights. Mirrors CREDO_SCORE_WEIGHTS in
 * src/lib/constants.ts (not imported to keep this module UI-dependency-free).
 */
export const CREDO_PILLAR_WEIGHTS = {
  strength: 0.3,
  cardio: 0.3,
  stability: 0.2,
  nutrition: 0.2,
} as const;

// ── Shared helpers ──────────────────────────────────────────────────────────

const clamp01to100 = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

type Breakpoint = [value: number, pct: number];

function interpolate(value: number, breakpoints: Breakpoint[]): number {
  if (value <= 0) return 0;
  const last = breakpoints[breakpoints.length - 1];
  if (value >= last[0]) return Math.round(last[1]);
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const [lowV, lowP] = breakpoints[i];
    const [highV, highP] = breakpoints[i + 1];
    if (value >= lowV && value <= highV) {
      const fraction = (value - lowV) / (highV - lowV);
      return Math.round(lowP + fraction * (highP - lowP));
    }
  }
  return 0;
}

/** Linear interpolation of a relative-strength ratio against a standards row. */
export function percentileFromStandard(
  relativeStrength: number,
  std: StandardPercentiles,
): number {
  const breakpoints: Breakpoint[] = [
    [0, 0],
    [std.p10, 10],
    [std.p25, 25],
    [std.p50, 50],
    [std.p75, 75],
    [std.p90, 90],
    [std.p95, 95],
    [std.p95 * 1.15, 100], // extrapolate slightly beyond the 95th
  ];
  return interpolate(relativeStrength, breakpoints);
}

// ── Fallback demographic standards (ported from StrengthStandards.swift) ────
// Relative strength (1RM / bodyweight) percentiles by age bracket:
// [18-29, 30-39, 40-49, 50-59, 60+] rows of [p10, p25, p50, p75, p90, p95].

type StandardRows = number[][];
const FALLBACK_STANDARDS: Record<Sex, Record<string, StandardRows>> = {
  male: {
    bench_press: [
      [0.55, 0.75, 1.0, 1.25, 1.5, 1.65], [0.5, 0.72, 0.95, 1.2, 1.4, 1.55],
      [0.5, 0.7, 0.9, 1.1, 1.3, 1.5], [0.45, 0.6, 0.8, 1.0, 1.2, 1.35],
      [0.35, 0.5, 0.65, 0.85, 1.05, 1.2],
    ],
    ohp: [
      [0.35, 0.45, 0.6, 0.8, 0.95, 1.05], [0.32, 0.42, 0.58, 0.75, 0.9, 1.0],
      [0.3, 0.4, 0.55, 0.7, 0.85, 0.95], [0.25, 0.35, 0.48, 0.62, 0.75, 0.85],
      [0.2, 0.28, 0.4, 0.52, 0.65, 0.75],
    ],
    barbell_row: [
      [0.45, 0.6, 0.8, 1.0, 1.2, 1.35], [0.42, 0.58, 0.75, 0.95, 1.15, 1.28],
      [0.4, 0.55, 0.72, 0.9, 1.1, 1.22], [0.35, 0.48, 0.65, 0.82, 0.98, 1.1],
      [0.28, 0.4, 0.55, 0.7, 0.85, 0.95],
    ],
    weighted_pullup: [
      [0.0, 0.1, 0.25, 0.45, 0.65, 0.8], [0.0, 0.08, 0.22, 0.4, 0.58, 0.72],
      [0.0, 0.05, 0.18, 0.35, 0.5, 0.65], [0.0, 0.0, 0.12, 0.28, 0.42, 0.55],
      [0.0, 0.0, 0.08, 0.2, 0.35, 0.45],
    ],
    back_squat: [
      [0.65, 0.9, 1.2, 1.5, 1.8, 2.0], [0.6, 0.85, 1.15, 1.4, 1.7, 1.9],
      [0.55, 0.78, 1.05, 1.3, 1.55, 1.75], [0.48, 0.68, 0.9, 1.12, 1.35, 1.52],
      [0.38, 0.55, 0.75, 0.95, 1.15, 1.3],
    ],
    front_squat: [
      [0.5, 0.7, 0.95, 1.2, 1.45, 1.6], [0.48, 0.68, 0.9, 1.12, 1.38, 1.52],
      [0.45, 0.62, 0.85, 1.05, 1.28, 1.42], [0.38, 0.55, 0.72, 0.9, 1.1, 1.25],
      [0.3, 0.45, 0.6, 0.78, 0.95, 1.08],
    ],
    deadlift: [
      [0.75, 1.0, 1.35, 1.7, 2.05, 2.3], [0.7, 0.95, 1.28, 1.6, 1.95, 2.18],
      [0.65, 0.88, 1.18, 1.48, 1.8, 2.0], [0.55, 0.75, 1.0, 1.3, 1.58, 1.75],
      [0.45, 0.62, 0.85, 1.1, 1.35, 1.5],
    ],
    rdl: [
      [0.55, 0.72, 0.95, 1.2, 1.45, 1.6], [0.5, 0.68, 0.9, 1.12, 1.38, 1.52],
      [0.48, 0.62, 0.82, 1.05, 1.28, 1.42], [0.4, 0.55, 0.72, 0.92, 1.12, 1.25],
      [0.32, 0.45, 0.6, 0.78, 0.95, 1.08],
    ],
    trap_bar_deadlift: [
      [0.8, 1.05, 1.4, 1.78, 2.15, 2.4], [0.75, 1.0, 1.35, 1.68, 2.02, 2.28],
      [0.7, 0.92, 1.25, 1.55, 1.88, 2.1], [0.58, 0.8, 1.05, 1.35, 1.65, 1.85],
      [0.48, 0.65, 0.9, 1.15, 1.42, 1.58],
    ],
    farmer_carry: [
      [0.3, 0.45, 0.6, 0.8, 1.0, 1.15], [0.28, 0.42, 0.58, 0.75, 0.95, 1.08],
      [0.25, 0.38, 0.52, 0.7, 0.88, 1.0], [0.22, 0.32, 0.45, 0.6, 0.75, 0.88],
      [0.18, 0.25, 0.38, 0.5, 0.65, 0.75],
    ],
  },
  female: {
    bench_press: [
      [0.25, 0.4, 0.55, 0.75, 0.95, 1.1], [0.22, 0.38, 0.52, 0.7, 0.88, 1.02],
      [0.2, 0.35, 0.48, 0.65, 0.82, 0.95], [0.18, 0.3, 0.42, 0.58, 0.72, 0.85],
      [0.15, 0.25, 0.35, 0.48, 0.62, 0.72],
    ],
    ohp: [
      [0.18, 0.28, 0.4, 0.55, 0.68, 0.78], [0.16, 0.25, 0.38, 0.52, 0.65, 0.72],
      [0.15, 0.22, 0.35, 0.48, 0.6, 0.68], [0.12, 0.2, 0.3, 0.42, 0.52, 0.6],
      [0.1, 0.15, 0.25, 0.35, 0.45, 0.52],
    ],
    barbell_row: [
      [0.28, 0.4, 0.55, 0.72, 0.88, 1.0], [0.25, 0.38, 0.52, 0.68, 0.82, 0.95],
      [0.22, 0.35, 0.48, 0.62, 0.78, 0.88], [0.2, 0.3, 0.42, 0.55, 0.68, 0.78],
      [0.15, 0.25, 0.35, 0.48, 0.58, 0.68],
    ],
    weighted_pullup: [
      [0.0, 0.0, 0.08, 0.2, 0.35, 0.48], [0.0, 0.0, 0.05, 0.18, 0.3, 0.42],
      [0.0, 0.0, 0.03, 0.15, 0.25, 0.35], [0.0, 0.0, 0.0, 0.1, 0.2, 0.28],
      [0.0, 0.0, 0.0, 0.05, 0.15, 0.22],
    ],
    back_squat: [
      [0.45, 0.65, 0.9, 1.15, 1.4, 1.58], [0.42, 0.6, 0.85, 1.08, 1.32, 1.48],
      [0.38, 0.55, 0.78, 1.0, 1.22, 1.38], [0.32, 0.48, 0.68, 0.88, 1.08, 1.22],
      [0.25, 0.38, 0.55, 0.72, 0.9, 1.05],
    ],
    front_squat: [
      [0.35, 0.52, 0.72, 0.95, 1.15, 1.3], [0.32, 0.48, 0.68, 0.88, 1.08, 1.22],
      [0.28, 0.45, 0.62, 0.82, 1.0, 1.15], [0.25, 0.38, 0.55, 0.72, 0.88, 1.0],
      [0.2, 0.32, 0.45, 0.6, 0.75, 0.88],
    ],
    deadlift: [
      [0.55, 0.78, 1.05, 1.35, 1.65, 1.85], [0.5, 0.72, 1.0, 1.28, 1.55, 1.75],
      [0.45, 0.65, 0.9, 1.18, 1.42, 1.62], [0.38, 0.55, 0.78, 1.02, 1.25, 1.42],
      [0.3, 0.45, 0.65, 0.85, 1.05, 1.22],
    ],
    rdl: [
      [0.38, 0.55, 0.75, 0.95, 1.18, 1.32], [0.35, 0.5, 0.7, 0.9, 1.1, 1.25],
      [0.32, 0.45, 0.65, 0.82, 1.02, 1.15], [0.28, 0.4, 0.55, 0.72, 0.88, 1.02],
      [0.22, 0.32, 0.45, 0.6, 0.75, 0.88],
    ],
    trap_bar_deadlift: [
      [0.58, 0.82, 1.1, 1.42, 1.72, 1.95], [0.52, 0.75, 1.05, 1.35, 1.62, 1.82],
      [0.48, 0.68, 0.95, 1.25, 1.5, 1.7], [0.4, 0.58, 0.82, 1.08, 1.32, 1.5],
      [0.32, 0.48, 0.68, 0.9, 1.1, 1.28],
    ],
    farmer_carry: [
      [0.2, 0.32, 0.45, 0.6, 0.78, 0.9], [0.18, 0.28, 0.42, 0.55, 0.72, 0.85],
      [0.15, 0.25, 0.38, 0.5, 0.65, 0.78], [0.12, 0.22, 0.32, 0.45, 0.58, 0.68],
      [0.1, 0.18, 0.28, 0.38, 0.48, 0.58],
    ],
  },
};

function ageBracketIndex(age: number): number {
  if (age < 30) return 0;
  if (age < 40) return 1;
  if (age < 50) return 2;
  if (age < 60) return 3;
  return 4;
}

/**
 * Injectable standards lookup: relative-strength percentile breakpoints for
 * a lift + demographic. The default falls back to the ported iOS tables.
 */
export type StandardsLookup = (
  exerciseId: string,
  sex: Sex,
  age: number,
) => StandardPercentiles | null;

export const defaultStandardsLookup: StandardsLookup = (exerciseId, sex, age) => {
  const rows = FALLBACK_STANDARDS[sex]?.[exerciseId];
  if (!rows) return null;
  const [p10, p25, p50, p75, p90, p95] = rows[ageBracketIndex(age)];
  return { p10, p25, p50, p75, p90, p95 };
};

// ── Strength Score ──────────────────────────────────────────────────────────

/** A logged Credo Ten benchmark result, keyed by benchmark name. */
export interface BenchmarkResultInput {
  name: string; // e.g. "Plank", "Dead Hang", "Push-Ups", "Pull-Ups"
  value: number;
  unit?: string;
  testedAt?: string; // ISO
}

/** A prior overall Strength Score snapshot, for trend computation. */
export interface ScoreSnapshot {
  date: string; // ISO
  overall: number;
}

const CATEGORY_LIFTS: Record<
  Exclude<StrengthCategory, "Core" | "Grip" | "Muscular Endurance">,
  { id: string; name: string }[]
> = {
  "Upper Push": [
    { id: "bench_press", name: "Bench Press" },
    { id: "ohp", name: "Overhead Press" },
  ],
  "Upper Pull": [
    { id: "weighted_pullup", name: "Weighted Pull-Up" },
    { id: "barbell_row", name: "Barbell Row" },
  ],
  "Lower Push": [
    { id: "back_squat", name: "Back Squat" },
    { id: "front_squat", name: "Front Squat" },
  ],
  "Lower Pull": [
    { id: "deadlift", name: "Deadlift" },
    { id: "rdl", name: "Romanian Deadlift" },
    { id: "trap_bar_deadlift", name: "Trap Bar Deadlift" },
  ],
  Carry: [{ id: "farmer_carry", name: "Farmer Carry" }],
};

// Rough percentile mappings for time/rep-based categories (from the iOS app).
const PLANK_SECONDS: Breakpoint[] = [[0, 0], [30, 20], [60, 40], [90, 60], [120, 75], [180, 90], [240, 95]];
const DEAD_HANG_SECONDS: Breakpoint[] = [[0, 0], [30, 20], [60, 45], [90, 65], [120, 80], [150, 90], [180, 95]];
const KNEE_RAISE_TOTAL_REPS: Breakpoint[] = [[0, 0], [10, 20], [20, 40], [30, 60], [40, 75], [50, 85], [60, 95]];
const PULLUP_REPS_MALE: Breakpoint[] = [[0, 0], [3, 20], [6, 35], [10, 50], [15, 65], [20, 78], [25, 88], [30, 95]];
const PULLUP_REPS_FEMALE: Breakpoint[] = [[0, 0], [1, 30], [3, 45], [6, 60], [10, 75], [15, 88], [20, 95]];
const PUSHUP_REPS_MALE: Breakpoint[] = [[0, 0], [10, 20], [20, 40], [30, 55], [40, 70], [50, 82], [60, 90], [70, 95]];
const PUSHUP_REPS_FEMALE: Breakpoint[] = [[0, 0], [5, 25], [10, 40], [20, 60], [30, 75], [40, 88], [50, 95]];

function findBenchmark(
  benchmarks: BenchmarkResultInput[],
  keyword: string,
): BenchmarkResultInput | undefined {
  const lower = keyword.toLowerCase();
  return benchmarks.find((b) => b.name.toLowerCase().replace(/[-\s]/g, "").includes(lower));
}

function groupHistoryByExercise(
  history: ExerciseHistoryEntry[],
): Map<string, ExerciseHistoryEntry[]> {
  const map = new Map<string, ExerciseHistoryEntry[]>();
  for (const entry of history) {
    const list = map.get(entry.exerciseId);
    if (list) list.push(entry);
    else map.set(entry.exerciseId, [entry]);
  }
  return map;
}

export interface CalculateStrengthScoreParams {
  profile: UserProfileInput;
  exerciseHistory: ExerciseHistoryEntry[];
  benchmarkResults?: BenchmarkResultInput[];
  standardsLookup?: StandardsLookup;
  /** Prior overall scores for trend computation (change over last 4 weeks). */
  priorScores?: ScoreSnapshot[];
  now: Date;
}

/** Demographic context string, e.g. "M, 40-44, 185 lb, Intermediate". */
export function demographicContextString(profile: UserProfileInput): string {
  const sexLabel = profile.sex === "female" ? "F" : "M";
  const age = profile.age ?? 30;
  const bracketStart = Math.floor(age / 5) * 5;
  const bracket = `${bracketStart}-${bracketStart + 4}`;
  const weight = Math.round(profile.weight ?? 170);
  const exp = profile.experienceLevel ?? "beginner";
  const expLabel = exp.charAt(0).toUpperCase() + exp.slice(1);
  return `${sexLabel}, ${bracket}, ${weight} lb, ${expLabel}`;
}

/**
 * PRD 3.2: 8 subscores (each 0-100) weighted 15/15/15/15/10/10/10/10.
 * Lift categories use best estimated 1RM from the last 90 days, normalized to
 * bodyweight and mapped to a demographic percentile. Core/Grip/Endurance can
 * also draw from Credo Ten benchmark results.
 */
export function calculateStrengthScore(
  params: CalculateStrengthScoreParams,
): StrengthScoreResult {
  const { profile, exerciseHistory, now } = params;
  const benchmarks = params.benchmarkResults ?? [];
  const lookup = params.standardsLookup ?? defaultStandardsLookup;
  const bodyweight = profile.weight ?? 170;
  const sex = profile.sex ?? "male";
  const age = profile.age ?? 30;
  const byExercise = groupHistoryByExercise(exerciseHistory);

  // Best-of-90-days percentile for a set of candidate lifts.
  const liftSubscore = (
    category: StrengthCategory,
    lifts: { id: string; name: string }[],
  ): StrengthSubscore => {
    let best: StrengthSubscore = {
      category,
      score: 0,
      keyLift: lifts[0].name,
      estimated1RM: 0,
      relativeStrength: 0,
      percentile: 0,
    };
    for (const lift of lifts) {
      const oneRM = best1RMFromHistory(byExercise.get(lift.id) ?? [], 90, now);
      if (oneRM == null || oneRM <= 0) continue;
      const relative = oneRM / bodyweight;
      const std = lookup(lift.id, sex, age);
      const pct = std ? percentileFromStandard(relative, std) : 0;
      if (pct > best.percentile || (pct === best.percentile && oneRM > best.estimated1RM)) {
        best = {
          category,
          score: pct,
          keyLift: lift.name,
          estimated1RM: Math.round(oneRM),
          relativeStrength: Math.round(relative * 100) / 100,
          percentile: pct,
        };
      }
    }
    return best;
  };

  const metricSubscore = (
    category: StrengthCategory,
    candidates: { label: string; value: number; breakpoints: Breakpoint[] }[],
  ): StrengthSubscore => {
    let best = { label: candidates[0]?.label ?? "", value: 0, pct: 0 };
    for (const c of candidates) {
      const pct = interpolate(c.value, c.breakpoints);
      if (pct > best.pct) best = { label: c.label, value: c.value, pct };
    }
    return {
      category,
      score: best.pct,
      keyLift: best.label,
      estimated1RM: Math.round(best.value),
      relativeStrength: 0,
      percentile: best.pct,
    };
  };

  // History-derived rep metrics for benchmark-less users.
  const bestSingleSetReps = (exerciseId: string): number => {
    let best = 0;
    for (const entry of byExercise.get(exerciseId) ?? []) {
      for (const set of entry.sets) best = Math.max(best, set.reps);
    }
    return best;
  };
  const bestTotalSessionReps = (exerciseId: string): number => {
    let best = 0;
    for (const entry of byExercise.get(exerciseId) ?? []) {
      best = Math.max(best, entry.sets.reduce((sum, s) => sum + s.reps, 0));
    }
    return best;
  };

  const plank = findBenchmark(benchmarks, "plank");
  const deadHang = findBenchmark(benchmarks, "deadhang") ?? findBenchmark(benchmarks, "hang");
  const pushUps = findBenchmark(benchmarks, "pushup");
  const pullUps = findBenchmark(benchmarks, "pullup");

  const carrySub = liftSubscore("Carry", CATEGORY_LIFTS.Carry);

  const subscores: StrengthSubscore[] = [
    liftSubscore("Upper Push", CATEGORY_LIFTS["Upper Push"]),
    liftSubscore("Upper Pull", CATEGORY_LIFTS["Upper Pull"]),
    liftSubscore("Lower Push", CATEGORY_LIFTS["Lower Push"]),
    liftSubscore("Lower Pull", CATEGORY_LIFTS["Lower Pull"]),
    metricSubscore("Core", [
      { label: "Plank Hold", value: plank?.value ?? 0, breakpoints: PLANK_SECONDS },
      {
        label: "Hanging Knee Raise",
        value: bestTotalSessionReps("hanging_knee_raise"),
        breakpoints: KNEE_RAISE_TOTAL_REPS,
      },
    ]),
    // Grip: dead hang benchmark, else the farmer carry percentile.
    (() => {
      const hangSub = metricSubscore("Grip", [
        { label: "Dead Hang", value: deadHang?.value ?? 0, breakpoints: DEAD_HANG_SECONDS },
      ]);
      return hangSub.score >= carrySub.score
        ? hangSub
        : { ...carrySub, category: "Grip" as StrengthCategory };
    })(),
    carrySub,
    metricSubscore("Muscular Endurance", [
      {
        label: "Pull-Up Reps",
        value: Math.max(pullUps?.value ?? 0, bestSingleSetReps("pullup")),
        breakpoints: sex === "female" ? PULLUP_REPS_FEMALE : PULLUP_REPS_MALE,
      },
      {
        label: "Push-Up Reps",
        value: Math.max(pushUps?.value ?? 0, bestSingleSetReps("pushup")),
        breakpoints: sex === "female" ? PUSHUP_REPS_FEMALE : PUSHUP_REPS_MALE,
      },
    ]),
  ];

  const overall = clamp01to100(
    subscores.reduce(
      (sum, s) => sum + s.score * STRENGTH_SUBSCORE_WEIGHTS[s.category],
      0,
    ),
  );

  const { trend, trendDelta } = computeScoreTrend(overall, params.priorScores ?? [], now);

  return {
    overall,
    subscores,
    // Subscores are demographic percentiles, so their weighted blend is our
    // best cohort-percentile estimate until real cohort distributions exist.
    percentile: overall,
    demographicContext: demographicContextString(profile),
    trend,
    trendDelta,
  };
}

/**
 * Trend vs ~4 weeks ago: the snapshot closest to `windowDays` back (accepting
 * anything older than 14 days). Delta beyond ±2 points flips the trend.
 */
export function computeScoreTrend(
  currentOverall: number,
  priorScores: ScoreSnapshot[],
  now: Date,
  windowDays = 28,
): { trend: StrengthScoreResult["trend"]; trendDelta: number } {
  const targetTime = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  const minAgeTime = now.getTime() - 14 * 24 * 60 * 60 * 1000;
  let baseline: ScoreSnapshot | null = null;
  let bestDist = Infinity;
  for (const snap of priorScores) {
    const t = Date.parse(snap.date);
    if (Number.isNaN(t) || t > minAgeTime) continue;
    const dist = Math.abs(t - targetTime);
    if (dist < bestDist) {
      bestDist = dist;
      baseline = snap;
    }
  }
  if (!baseline) return { trend: "stable", trendDelta: 0 };
  const delta = Math.round(currentOverall - baseline.overall);
  const trend = delta >= 2 ? "improving" : delta <= -2 ? "declining" : "stable";
  return { trend, trendDelta: delta };
}

// ── Cardio Score (ported from CardioScoreCalculator.swift) ──────────────────

/** Ratio-to-target scoring with diminishing returns above target. */
export function scoreFromTarget(current: number, target: number): number {
  if (target <= 0) return 0;
  const ratio = current / target;
  if (ratio >= 1) {
    const bonus = Math.min((ratio - 1) * 10, 10);
    return Math.min(100, Math.round(90 + bonus));
  }
  return Math.max(0, Math.round(ratio * 90));
}

/** Rough VO2max percentile score, age- and sex-adjusted. */
export function vo2maxScore(vo2max: number, age: number, sex: Sex): number {
  // Normalize to a 30-year-old male-equivalent value (~1%/yr decline, sex offset).
  const ageAdjusted = vo2max + Math.max(0, age - 30) * 0.35;
  const normalized = sex === "female" ? ageAdjusted * 1.11 : ageAdjusted;
  const breakpoints: Breakpoint[] = [
    [20, 5], [30, 15], [35, 30], [40, 45], [45, 62], [50, 78], [55, 90], [60, 97],
  ];
  return interpolate(normalized, breakpoints);
}

export interface CardioScoreInput {
  weeklyZone2Minutes: number;
  zone2TargetMinutes?: number; // default 150
  sessionsThisWeek: number;
  /** How many of the last 4 weeks had at least one cardio session (0-4). */
  weeksActiveOfLast4: number;
  vo2max?: number;
  age?: number;
  sex?: Sex;
}

/**
 * Cardio pillar (0-100). Zone-2 minutes vs target 40%, frequency (3+/wk) 30%,
 * 4-week consistency 30%. When a VO2max estimate is provided the weights
 * shift to 35/25/20 with 20% on the VO2max percentile.
 */
export function calculateCardioScore(input: CardioScoreInput): number {
  const zone = scoreFromTarget(input.weeklyZone2Minutes, input.zone2TargetMinutes ?? 150);
  const freq = scoreFromTarget(input.sessionsThisWeek, 3);
  const consistency = scoreFromTarget(input.weeksActiveOfLast4, 4);

  if (input.vo2max != null && input.vo2max > 0) {
    const vo2 = vo2maxScore(input.vo2max, input.age ?? 30, input.sex ?? "male");
    return clamp01to100(zone * 0.35 + freq * 0.25 + consistency * 0.2 + vo2 * 0.2);
  }
  return clamp01to100(zone * 0.4 + freq * 0.3 + consistency * 0.3);
}

// ── Stability Score (ported from StabilityScoreCalculator.swift) ────────────

export interface StabilityScoreInput {
  /** Warmup/mobility minutes this week. */
  weeklyStabilityMinutes: number;
  weeklyStabilityTargetMinutes?: number; // default 60
  weeklyCoreSets: number; // target 6+
  weeklyUnilateralSets: number; // target 4+
  /** Fraction (0-1) of muscle groups currently not overtrained. */
  recoveredGroupRatio: number;
}

/**
 * Stability pillar (0-100): weekly mobility minutes 30%, core volume 30%
 * (target 6 sets), unilateral/balance work 20% (target 4 sets), recovery
 * compliance 20%.
 */
export function calculateStabilityScore(input: StabilityScoreInput): number {
  const minutes =
    Math.min(input.weeklyStabilityMinutes / (input.weeklyStabilityTargetMinutes ?? 60), 1) * 100;
  const core = Math.min(input.weeklyCoreSets / 6, 1) * 100;
  const unilateral = Math.min(input.weeklyUnilateralSets / 4, 1) * 100;
  const recovery = Math.min(Math.max(input.recoveredGroupRatio, 0), 1) * 100;
  return clamp01to100(minutes * 0.3 + core * 0.3 + unilateral * 0.2 + recovery * 0.2);
}

// ── Nutrition Score (ported from NutritionScoreCalculator.swift) ────────────

export interface NutritionScoreInput {
  /** Last 7 days of protein logs; null = day not logged. */
  dailyProteinG: (number | null)[];
  proteinTargetG: number;
}

const LOGGING_SCORE_BY_DAYS = [0, 20, 35, 50, 65, 80, 90, 100];

/**
 * Nutrition pillar (0-100): protein adherence 60% (100 within ±10% of target,
 * scaled below, mild over-shoot penalty), logging consistency 40%.
 */
export function calculateNutritionScore(input: NutritionScoreInput): number {
  const { proteinTargetG } = input;
  const days = input.dailyProteinG.slice(0, 7);
  const logged = days.filter((d): d is number => d != null);

  let adherence = 0;
  if (logged.length > 0 && proteinTargetG > 0) {
    const perDay = logged.map((grams) => {
      const ratio = Math.min(grams / proteinTargetG, 1.3);
      if (ratio >= 0.9 && ratio <= 1.1) return 100;
      if (ratio > 1.1) return Math.max(100 - (ratio - 1.1) * 200, 60);
      return (ratio / 0.9) * 100;
    });
    adherence = perDay.reduce((a, b) => a + b, 0) / perDay.length;
  }

  const loggingScore =
    LOGGING_SCORE_BY_DAYS[Math.min(logged.length, LOGGING_SCORE_BY_DAYS.length - 1)];

  return clamp01to100(adherence * 0.6 + loggingScore * 0.4);
}

// ── Credo Score ─────────────────────────────────────────────────────────────

export interface PillarScores {
  strength: number;
  cardio: number;
  stability: number;
  nutrition: number;
}

/** Composite Credo Score: strength .3, cardio .3, stability .2, nutrition .2. */
export function calculateCredoScore(pillars: PillarScores): number {
  return clamp01to100(
    pillars.strength * CREDO_PILLAR_WEIGHTS.strength +
      pillars.cardio * CREDO_PILLAR_WEIGHTS.cardio +
      pillars.stability * CREDO_PILLAR_WEIGHTS.stability +
      pillars.nutrition * CREDO_PILLAR_WEIGHTS.nutrition,
  );
}
