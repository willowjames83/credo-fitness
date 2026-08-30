// Credo strength standards.
//
// Ported from the iOS app's StrengthStandards.swift (relative-strength tables:
// 1RM / bodyweight by sex and age bracket). The Swift tables carry no
// experience dimension, so those values are treated as the INTERMEDIATE
// population; beginner and advanced cohorts are derived with multipliers
// consistent with published progressions (Symmetric Strength / ExRx /
// Strength Level ballpark: beginner cohorts sit ~20% below intermediate,
// advanced ~18% above).
//
// Time-based (Plank, Dead Hang) and rep-based (Push-Up, Pull-Up) standards
// are not in the Swift port; they are filled in from published-standards-
// consistent values (ExRx push-up norms, ACSM-style plank/hang benchmarks)
// with the same age-bracket decline shape as the lift tables.

import type {
  Difficulty,
  Sex,
  StandardPercentiles,
  StrengthCategory,
} from "../../lib/types";

export type AgeBracket = "18-29" | "30-39" | "40-49" | "50-59" | "60+";

export const AGE_BRACKETS: AgeBracket[] = [
  "18-29",
  "30-39",
  "40-49",
  "50-59",
  "60+",
];

export const EXPERIENCE_LEVELS: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

/** How the standard's value is measured. */
export type StandardUnit = "bw_ratio" | "seconds" | "reps";

export interface StrengthStandardEntry {
  /** Canonical exercise/test name, e.g. "Bench Press". */
  exercise: string;
  category: StrengthCategory;
  unit: StandardUnit;
  sex: Sex;
  ageBracket: AgeBracket;
  experienceLevel: Difficulty;
  percentiles: StandardPercentiles;
}

// ── Base tables (intermediate cohort) ────────────────────────────────────
// Row order matches AGE_BRACKETS. Columns: p10, p25, p50, p75, p90, p95.

type Row = [number, number, number, number, number, number];

interface BaseStandard {
  exercise: string;
  category: StrengthCategory;
  unit: StandardUnit;
  male: Row[];
  female: Row[];
}

const BASE_STANDARDS: BaseStandard[] = [
  // ── Relative-strength lifts (1RM / bodyweight) — ported from Swift ──
  {
    exercise: "Bench Press",
    category: "Upper Push",
    unit: "bw_ratio",
    male: [
      [0.55, 0.75, 1.0, 1.25, 1.5, 1.65],
      [0.5, 0.72, 0.95, 1.2, 1.4, 1.55],
      [0.5, 0.7, 0.9, 1.1, 1.3, 1.5],
      [0.45, 0.6, 0.8, 1.0, 1.2, 1.35],
      [0.35, 0.5, 0.65, 0.85, 1.05, 1.2],
    ],
    female: [
      [0.25, 0.4, 0.55, 0.75, 0.95, 1.1],
      [0.22, 0.38, 0.52, 0.7, 0.88, 1.02],
      [0.2, 0.35, 0.48, 0.65, 0.82, 0.95],
      [0.18, 0.3, 0.42, 0.58, 0.72, 0.85],
      [0.15, 0.25, 0.35, 0.48, 0.62, 0.72],
    ],
  },
  {
    exercise: "Overhead Press",
    category: "Upper Push",
    unit: "bw_ratio",
    male: [
      [0.35, 0.45, 0.6, 0.8, 0.95, 1.05],
      [0.32, 0.42, 0.58, 0.75, 0.9, 1.0],
      [0.3, 0.4, 0.55, 0.7, 0.85, 0.95],
      [0.25, 0.35, 0.48, 0.62, 0.75, 0.85],
      [0.2, 0.28, 0.4, 0.52, 0.65, 0.75],
    ],
    female: [
      [0.18, 0.28, 0.4, 0.55, 0.68, 0.78],
      [0.16, 0.25, 0.38, 0.52, 0.65, 0.72],
      [0.15, 0.22, 0.35, 0.48, 0.6, 0.68],
      [0.12, 0.2, 0.3, 0.42, 0.52, 0.6],
      [0.1, 0.15, 0.25, 0.35, 0.45, 0.52],
    ],
  },
  {
    exercise: "Barbell Row",
    category: "Upper Pull",
    unit: "bw_ratio",
    male: [
      [0.45, 0.6, 0.8, 1.0, 1.2, 1.35],
      [0.42, 0.58, 0.75, 0.95, 1.15, 1.28],
      [0.4, 0.55, 0.72, 0.9, 1.1, 1.22],
      [0.35, 0.48, 0.65, 0.82, 0.98, 1.1],
      [0.28, 0.4, 0.55, 0.7, 0.85, 0.95],
    ],
    female: [
      [0.28, 0.4, 0.55, 0.72, 0.88, 1.0],
      [0.25, 0.38, 0.52, 0.68, 0.82, 0.95],
      [0.22, 0.35, 0.48, 0.62, 0.78, 0.88],
      [0.2, 0.3, 0.42, 0.55, 0.68, 0.78],
      [0.15, 0.25, 0.35, 0.48, 0.58, 0.68],
    ],
  },
  {
    // Added weight / bodyweight ratio.
    exercise: "Weighted Pull-Up",
    category: "Upper Pull",
    unit: "bw_ratio",
    male: [
      [0.0, 0.1, 0.25, 0.45, 0.65, 0.8],
      [0.0, 0.08, 0.22, 0.4, 0.58, 0.72],
      [0.0, 0.05, 0.18, 0.35, 0.5, 0.65],
      [0.0, 0.0, 0.12, 0.28, 0.42, 0.55],
      [0.0, 0.0, 0.08, 0.2, 0.35, 0.45],
    ],
    female: [
      [0.0, 0.0, 0.08, 0.2, 0.35, 0.48],
      [0.0, 0.0, 0.05, 0.18, 0.3, 0.42],
      [0.0, 0.0, 0.03, 0.15, 0.25, 0.35],
      [0.0, 0.0, 0.0, 0.1, 0.2, 0.28],
      [0.0, 0.0, 0.0, 0.05, 0.15, 0.22],
    ],
  },
  {
    exercise: "Back Squat",
    category: "Lower Push",
    unit: "bw_ratio",
    male: [
      [0.65, 0.9, 1.2, 1.5, 1.8, 2.0],
      [0.6, 0.85, 1.15, 1.4, 1.7, 1.9],
      [0.55, 0.78, 1.05, 1.3, 1.55, 1.75],
      [0.48, 0.68, 0.9, 1.12, 1.35, 1.52],
      [0.38, 0.55, 0.75, 0.95, 1.15, 1.3],
    ],
    female: [
      [0.45, 0.65, 0.9, 1.15, 1.4, 1.58],
      [0.42, 0.6, 0.85, 1.08, 1.32, 1.48],
      [0.38, 0.55, 0.78, 1.0, 1.22, 1.38],
      [0.32, 0.48, 0.68, 0.88, 1.08, 1.22],
      [0.25, 0.38, 0.55, 0.72, 0.9, 1.05],
    ],
  },
  {
    exercise: "Front Squat",
    category: "Lower Push",
    unit: "bw_ratio",
    male: [
      [0.5, 0.7, 0.95, 1.2, 1.45, 1.6],
      [0.48, 0.68, 0.9, 1.12, 1.38, 1.52],
      [0.45, 0.62, 0.85, 1.05, 1.28, 1.42],
      [0.38, 0.55, 0.72, 0.9, 1.1, 1.25],
      [0.3, 0.45, 0.6, 0.78, 0.95, 1.08],
    ],
    female: [
      [0.35, 0.52, 0.72, 0.95, 1.15, 1.3],
      [0.32, 0.48, 0.68, 0.88, 1.08, 1.22],
      [0.28, 0.45, 0.62, 0.82, 1.0, 1.15],
      [0.25, 0.38, 0.55, 0.72, 0.88, 1.0],
      [0.2, 0.32, 0.45, 0.6, 0.75, 0.88],
    ],
  },
  {
    exercise: "Deadlift",
    category: "Lower Pull",
    unit: "bw_ratio",
    male: [
      [0.75, 1.0, 1.35, 1.7, 2.05, 2.3],
      [0.7, 0.95, 1.28, 1.6, 1.95, 2.18],
      [0.65, 0.88, 1.18, 1.48, 1.8, 2.0],
      [0.55, 0.75, 1.0, 1.3, 1.58, 1.75],
      [0.45, 0.62, 0.85, 1.1, 1.35, 1.5],
    ],
    female: [
      [0.55, 0.78, 1.05, 1.35, 1.65, 1.85],
      [0.5, 0.72, 1.0, 1.28, 1.55, 1.75],
      [0.45, 0.65, 0.9, 1.18, 1.42, 1.62],
      [0.38, 0.55, 0.78, 1.02, 1.25, 1.42],
      [0.3, 0.45, 0.65, 0.85, 1.05, 1.22],
    ],
  },
  {
    exercise: "Romanian Deadlift",
    category: "Lower Pull",
    unit: "bw_ratio",
    male: [
      [0.55, 0.72, 0.95, 1.2, 1.45, 1.6],
      [0.5, 0.68, 0.9, 1.12, 1.38, 1.52],
      [0.48, 0.62, 0.82, 1.05, 1.28, 1.42],
      [0.4, 0.55, 0.72, 0.92, 1.12, 1.25],
      [0.32, 0.45, 0.6, 0.78, 0.95, 1.08],
    ],
    female: [
      [0.38, 0.55, 0.75, 0.95, 1.18, 1.32],
      [0.35, 0.5, 0.7, 0.9, 1.1, 1.25],
      [0.32, 0.45, 0.65, 0.82, 1.02, 1.15],
      [0.28, 0.4, 0.55, 0.72, 0.88, 1.02],
      [0.22, 0.32, 0.45, 0.6, 0.75, 0.88],
    ],
  },
  {
    exercise: "Trap Bar Deadlift",
    category: "Lower Pull",
    unit: "bw_ratio",
    male: [
      [0.8, 1.05, 1.4, 1.78, 2.15, 2.4],
      [0.75, 1.0, 1.35, 1.68, 2.02, 2.28],
      [0.7, 0.92, 1.25, 1.55, 1.88, 2.1],
      [0.58, 0.8, 1.05, 1.35, 1.65, 1.85],
      [0.48, 0.65, 0.9, 1.15, 1.42, 1.58],
    ],
    female: [
      [0.58, 0.82, 1.1, 1.42, 1.72, 1.95],
      [0.52, 0.75, 1.05, 1.35, 1.62, 1.82],
      [0.48, 0.68, 0.95, 1.25, 1.5, 1.7],
      [0.4, 0.58, 0.82, 1.08, 1.32, 1.5],
      [0.32, 0.48, 0.68, 0.9, 1.1, 1.28],
    ],
  },
  {
    // Per-hand carried weight / bodyweight.
    exercise: "Farmer Carry",
    category: "Carry",
    unit: "bw_ratio",
    male: [
      [0.3, 0.45, 0.6, 0.8, 1.0, 1.15],
      [0.28, 0.42, 0.58, 0.75, 0.95, 1.08],
      [0.25, 0.38, 0.52, 0.7, 0.88, 1.0],
      [0.22, 0.32, 0.45, 0.6, 0.75, 0.88],
      [0.18, 0.25, 0.38, 0.5, 0.65, 0.75],
    ],
    female: [
      [0.2, 0.32, 0.45, 0.6, 0.78, 0.9],
      [0.18, 0.28, 0.42, 0.55, 0.72, 0.85],
      [0.15, 0.25, 0.38, 0.5, 0.65, 0.78],
      [0.12, 0.22, 0.32, 0.45, 0.58, 0.68],
      [0.1, 0.18, 0.28, 0.38, 0.48, 0.58],
    ],
  },

  // ── Time / rep standards (not in the Swift port; published-consistent) ──
  {
    exercise: "Plank",
    category: "Core",
    unit: "seconds",
    male: [
      [30, 60, 95, 150, 210, 270],
      [28, 55, 90, 140, 195, 250],
      [25, 48, 80, 125, 170, 220],
      [20, 40, 65, 100, 140, 180],
      [15, 30, 50, 80, 110, 145],
    ],
    female: [
      [25, 50, 80, 130, 180, 230],
      [22, 45, 75, 120, 165, 210],
      [20, 40, 68, 105, 145, 185],
      [16, 32, 55, 85, 118, 150],
      [12, 25, 42, 68, 92, 120],
    ],
  },
  {
    exercise: "Dead Hang",
    category: "Grip",
    unit: "seconds",
    male: [
      [20, 35, 60, 90, 120, 150],
      [18, 32, 55, 85, 112, 140],
      [15, 28, 48, 75, 100, 125],
      [12, 22, 40, 62, 82, 105],
      [8, 16, 30, 48, 65, 82],
    ],
    female: [
      [12, 22, 40, 62, 85, 108],
      [10, 20, 36, 56, 78, 98],
      [8, 17, 30, 48, 66, 84],
      [6, 13, 25, 40, 55, 70],
      [4, 10, 18, 30, 42, 55],
    ],
  },
  {
    exercise: "Push-Up",
    category: "Muscular Endurance",
    unit: "reps",
    male: [
      [10, 20, 30, 42, 55, 65],
      [8, 17, 27, 38, 50, 60],
      [6, 14, 22, 32, 42, 52],
      [5, 10, 17, 26, 35, 42],
      [3, 7, 12, 19, 26, 33],
    ],
    female: [
      [5, 11, 18, 28, 38, 46],
      [4, 9, 15, 24, 33, 40],
      [3, 7, 12, 20, 27, 34],
      [2, 5, 9, 15, 21, 27],
      [1, 3, 6, 11, 16, 21],
    ],
  },
  {
    exercise: "Pull-Up",
    category: "Muscular Endurance",
    unit: "reps",
    male: [
      [1, 4, 8, 13, 18, 22],
      [1, 3, 7, 11, 16, 20],
      [0, 2, 6, 9, 13, 17],
      [0, 1, 4, 7, 10, 13],
      [0, 0, 2, 5, 8, 10],
    ],
    female: [
      [0, 1, 2, 5, 8, 11],
      [0, 0, 2, 4, 7, 9],
      [0, 0, 1, 3, 5, 7],
      [0, 0, 1, 2, 4, 6],
      [0, 0, 0, 1, 3, 4],
    ],
  },
];

// Experience-level multipliers applied to the intermediate baseline.
const EXPERIENCE_MULTIPLIERS: Record<Difficulty, number> = {
  beginner: 0.8,
  intermediate: 1.0,
  advanced: 1.18,
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function rowToPercentiles(row: Row, multiplier: number, unit: StandardUnit): StandardPercentiles {
  const scale = (v: number) =>
    unit === "reps" ? Math.round(v * multiplier) : round2(v * multiplier);
  return {
    p10: scale(row[0]),
    p25: scale(row[1]),
    p50: scale(row[2]),
    p75: scale(row[3]),
    p90: scale(row[4]),
    p95: scale(row[5]),
  };
}

function buildStandards(): StrengthStandardEntry[] {
  const entries: StrengthStandardEntry[] = [];
  for (const base of BASE_STANDARDS) {
    for (const sex of ["male", "female"] as Sex[]) {
      const rows = sex === "male" ? base.male : base.female;
      rows.forEach((row, i) => {
        for (const level of EXPERIENCE_LEVELS) {
          entries.push({
            exercise: base.exercise,
            category: base.category,
            unit: base.unit,
            sex,
            ageBracket: AGE_BRACKETS[i],
            experienceLevel: level,
            percentiles: rowToPercentiles(row, EXPERIENCE_MULTIPLIERS[level], base.unit),
          });
        }
      });
    }
  }
  return entries;
}

export const STRENGTH_STANDARDS: StrengthStandardEntry[] = buildStandards();

// ── Lookup helpers ───────────────────────────────────────────────────────

export function ageBracketFor(age: number): string {
  if (age < 30) return "18-29";
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  return "60+";
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function findStandard(
  exercise: string,
  sex: Sex,
  age: number,
  experienceLevel: string,
): StrengthStandardEntry | undefined {
  const bracket = ageBracketFor(age);
  const wantedExercise = normalize(exercise);
  const wantedLevel = EXPERIENCE_LEVELS.includes(experienceLevel as Difficulty)
    ? (experienceLevel as Difficulty)
    : "intermediate";
  return STRENGTH_STANDARDS.find(
    (s) =>
      s.sex === sex &&
      s.ageBracket === bracket &&
      s.experienceLevel === wantedLevel &&
      normalize(s.exercise) === wantedExercise,
  );
}

/**
 * Interpolates the user's value against the percentile bands for the matching
 * standard, returning an integer percentile clamped to 1-99.
 *
 * `value` is in the standard's unit: relative strength (1RM / bodyweight) for
 * lifts, seconds for holds, reps for endurance tests.
 */
export function lookupPercentile(params: {
  exercise: string;
  sex: "male" | "female";
  age: number;
  experienceLevel: string;
  value: number;
}): number {
  const standard = findStandard(
    params.exercise,
    params.sex,
    params.age,
    params.experienceLevel,
  );
  if (!standard) return 1;

  const p = standard.percentiles;
  // Extrapolate slightly beyond p95 like the Swift port did.
  const breakpoints: Array<[number, number]> = [
    [0, 0],
    [10, p.p10],
    [25, p.p25],
    [50, p.p50],
    [75, p.p75],
    [90, p.p90],
    [95, p.p95],
    [99, p.p95 * 1.15],
  ];

  const value = params.value;
  if (value <= 0) return 1;
  const last = breakpoints[breakpoints.length - 1];
  if (value >= last[1]) return 99;

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const [lowerPct, lowerVal] = breakpoints[i];
    const [upperPct, upperVal] = breakpoints[i + 1];
    if (value >= lowerVal && value <= upperVal) {
      // Flat segment (e.g. weighted pull-up brackets where p10 == p25 == 0).
      if (upperVal === lowerVal) continue;
      const fraction = (value - lowerVal) / (upperVal - lowerVal);
      const pct = Math.round(lowerPct + fraction * (upperPct - lowerPct));
      return Math.min(99, Math.max(1, pct));
    }
  }
  return 1;
}
