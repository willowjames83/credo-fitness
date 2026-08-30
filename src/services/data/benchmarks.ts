// The Credo Ten — the benchmark tests behind the composite Credo percentile.
// Names, units, and pillars match src/data/mock-benchmarks.ts.
//
// Percentile standards are sex x age-bracket tables. Lift benchmarks are
// absolute loads (lbs); endurance benchmarks are reps, seconds, or watts.
// Values are compiled to be consistent with published sources (Symmetric
// Strength / ExRx / Strength Level lift tables, ExRx push-up norms, and
// Concept2 ranking data for the 1000m row), assuming population-typical
// bodyweights. `isInversed` marks tests where a LOWER value is better
// (1000m Row time).

import type { Sex, StandardPercentiles } from "../../lib/types";

export type BenchmarkPillar = "strength" | "stability" | "cardio";

export interface BenchmarkDefinition {
  name: string;
  unit: string;
  pillar: BenchmarkPillar;
  isInversed?: boolean;
  description: string;
  instructions: string;
}

export const CREDO_TEN: BenchmarkDefinition[] = [
  {
    name: "Hex Bar Deadlift",
    unit: "lbs",
    pillar: "strength",
    description:
      "Total-body pulling strength with a spine-friendly neutral grip — the single best proxy for picking heavy things off the ground for life.",
    instructions:
      "Warm up progressively, then work to a heavy single or estimate 1RM from a 3-5 rep set. Stand centered in the bar, push the floor away, and lock out tall. Record the heaviest completed lift in lbs.",
  },
  {
    name: "Back Squat",
    unit: "lbs",
    pillar: "strength",
    description:
      "Lower-body pushing strength through the full squat pattern — the foundation for stairs, chairs, and getting off the floor in your marginal decade.",
    instructions:
      "Work up to a heavy single or estimate 1RM from a 3-5 rep set taken to at least parallel depth. Record the heaviest completed lift in lbs.",
  },
  {
    name: "Bench Press",
    unit: "lbs",
    pillar: "strength",
    description:
      "Upper-body horizontal pressing strength — the standard test of push power.",
    instructions:
      "Work up to a heavy single or estimate 1RM from a 3-5 rep set. Touch the bar to mid-chest under control, no bounce, and press to lockout. Record the heaviest completed lift in lbs.",
  },
  {
    name: "Pull-Ups",
    unit: "reps",
    pillar: "strength",
    description:
      "Relative upper-body pulling strength — controlling your own bodyweight overhead.",
    instructions:
      "From a full dead hang, perform strict pull-ups (chin over bar, no kipping). Record the maximum unbroken reps.",
  },
  {
    name: "Push-Ups",
    unit: "reps",
    pillar: "strength",
    description:
      "Upper-body muscular endurance — an ACSM-standard test with strong longevity correlations.",
    instructions:
      "In a rigid plank position, lower your chest to just above the floor and press up fully. Record the maximum unbroken reps at a steady cadence.",
  },
  {
    name: "Dead Hang",
    unit: "sec",
    pillar: "stability",
    description:
      "Grip endurance and shoulder integrity — Attia's benchmark for the Centenarian Decathlon (target: 2 minutes for men, 90 seconds for women).",
    instructions:
      "Hang from a bar with straight arms and packed shoulders. The test ends when either hand leaves the bar. Record total seconds.",
  },
  {
    name: "Farmer Carry",
    unit: "lbs × 40m",
    pillar: "stability",
    description:
      "Loaded carry capacity — grip, core, and gait under load; the groceries-and-suitcase test of real-world strength.",
    instructions:
      "Carry a pair of dumbbells or kettlebells 40 meters without setting them down, walking tall with controlled steps. Record the total combined weight (both hands) in lbs successfully carried the full distance.",
  },
  {
    name: "Plank Hold",
    unit: "sec",
    pillar: "stability",
    description:
      "Anterior core endurance — the ability to keep the spine braced under fatigue.",
    instructions:
      "Hold a forearm plank with a straight line from head to heels. The test ends when the hips sag or pike. Record total seconds.",
  },
  {
    name: "1000m Row",
    unit: "sec",
    pillar: "cardio",
    isInversed: true,
    description:
      "Anaerobic-aerobic power over roughly 3-4 minutes — a full-body engine test where a lower time is better.",
    instructions:
      "On a rowing erg with the damper set between 4-6, row 1000m all-out from a standing start. Record total seconds (lower is better).",
  },
  {
    name: "Norwegian 4x4",
    unit: "watts avg",
    pillar: "cardio",
    description:
      "VO2max interval capacity: four 4-minute efforts at ~90-95% max heart rate with 3-minute recoveries. Scored as average watts held across the work intervals.",
    instructions:
      "On a bike or rowing erg, complete 4 x 4-minute maximal-sustainable intervals with 3 minutes easy between. Record the average watts across the four work intervals.",
  },
];

// ── Percentile standards ────────────────────────────────────────────────
// Row order: age brackets 18-29, 30-39, 40-49, 50-59, 60+.
// Columns: p10, p25, p50, p75, p90, p95. For inversed benchmarks the values
// DESCEND across the row (p10 is the slowest time, p95 the fastest).

type Row = [number, number, number, number, number, number];

const BENCHMARK_AGE_BRACKETS = ["18-29", "30-39", "40-49", "50-59", "60+"] as const;
export type BenchmarkAgeBracket = (typeof BENCHMARK_AGE_BRACKETS)[number];

interface BenchmarkStandard {
  name: string;
  male: Row[];
  female: Row[];
}

const BENCHMARK_STANDARDS_DATA: BenchmarkStandard[] = [
  {
    name: "Hex Bar Deadlift",
    male: [
      [155, 225, 315, 405, 485, 545],
      [145, 215, 300, 385, 460, 515],
      [135, 195, 275, 350, 420, 470],
      [115, 165, 235, 305, 365, 410],
      [95, 135, 195, 255, 305, 345],
    ],
    female: [
      [95, 135, 185, 245, 300, 340],
      [90, 125, 175, 230, 280, 320],
      [80, 115, 160, 210, 255, 290],
      [70, 95, 135, 180, 220, 250],
      [55, 80, 115, 150, 185, 210],
    ],
  },
  {
    name: "Back Squat",
    male: [
      [115, 165, 225, 295, 360, 405],
      [110, 155, 215, 275, 335, 380],
      [100, 140, 195, 250, 305, 345],
      [85, 120, 170, 215, 260, 295],
      [70, 100, 140, 180, 220, 250],
    ],
    female: [
      [65, 95, 135, 180, 220, 250],
      [60, 90, 125, 165, 205, 235],
      [55, 80, 115, 150, 185, 210],
      [45, 70, 100, 130, 160, 185],
      [35, 55, 80, 105, 130, 150],
    ],
  },
  {
    name: "Bench Press",
    male: [
      [95, 135, 185, 235, 285, 320],
      [90, 130, 175, 225, 270, 300],
      [85, 120, 160, 205, 245, 275],
      [75, 105, 140, 180, 215, 245],
      [60, 85, 115, 150, 180, 205],
    ],
    female: [
      [45, 60, 85, 115, 145, 165],
      [40, 55, 80, 110, 135, 155],
      [35, 50, 75, 100, 125, 145],
      [30, 45, 65, 90, 110, 125],
      [25, 35, 55, 75, 90, 105],
    ],
  },
  {
    name: "Pull-Ups",
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
  {
    name: "Push-Ups",
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
    name: "Dead Hang",
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
    // Total combined weight (both hands) carried 40m.
    name: "Farmer Carry",
    male: [
      [90, 130, 180, 240, 300, 340],
      [85, 125, 170, 225, 285, 320],
      [75, 110, 155, 205, 260, 295],
      [65, 95, 130, 175, 220, 255],
      [50, 75, 110, 145, 185, 215],
    ],
    female: [
      [55, 85, 120, 160, 205, 235],
      [50, 80, 110, 150, 190, 220],
      [45, 70, 100, 135, 170, 200],
      [35, 60, 85, 115, 145, 170],
      [30, 45, 70, 95, 120, 140],
    ],
  },
  {
    name: "Plank Hold",
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
    // Seconds; lower is better (rows descend from p10 slow to p95 fast).
    name: "1000m Row",
    male: [
      [268, 248, 226, 208, 194, 186],
      [274, 254, 232, 214, 200, 192],
      [284, 262, 240, 222, 208, 199],
      [298, 276, 252, 234, 219, 210],
      [318, 294, 270, 250, 235, 225],
    ],
    female: [
      [305, 285, 262, 242, 228, 219],
      [312, 291, 268, 248, 234, 225],
      [322, 300, 277, 257, 242, 233],
      [338, 315, 290, 270, 254, 244],
      [360, 335, 310, 288, 272, 262],
    ],
  },
  {
    name: "Norwegian 4x4",
    male: [
      [140, 185, 240, 300, 360, 400],
      [135, 178, 230, 288, 345, 385],
      [125, 165, 212, 265, 318, 355],
      [108, 142, 185, 232, 278, 310],
      [90, 120, 155, 195, 235, 262],
    ],
    female: [
      [95, 125, 165, 205, 248, 275],
      [90, 120, 158, 198, 238, 265],
      [85, 110, 146, 183, 220, 245],
      [72, 96, 127, 160, 192, 214],
      [60, 80, 106, 133, 160, 178],
    ],
  },
];

export interface BenchmarkStandardEntry {
  benchmark: string;
  sex: Sex;
  ageBracket: BenchmarkAgeBracket;
  isInversed: boolean;
  percentiles: StandardPercentiles;
}

function rowToPercentiles(row: Row): StandardPercentiles {
  return { p10: row[0], p25: row[1], p50: row[2], p75: row[3], p90: row[4], p95: row[5] };
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/[^a-z0-9]+/g, "");
}

const INVERSED_BENCHMARKS = new Set(
  CREDO_TEN.filter((b) => b.isInversed).map((b) => normalizeName(b.name)),
);

export const BENCHMARK_STANDARDS: BenchmarkStandardEntry[] =
  BENCHMARK_STANDARDS_DATA.flatMap((standard) =>
    (["male", "female"] as Sex[]).flatMap((sex) =>
      (sex === "male" ? standard.male : standard.female).map((row, i) => ({
        benchmark: standard.name,
        sex,
        ageBracket: BENCHMARK_AGE_BRACKETS[i],
        isInversed: INVERSED_BENCHMARKS.has(normalizeName(standard.name)),
        percentiles: rowToPercentiles(row),
      })),
    ),
  );

export function benchmarkAgeBracketFor(age: number): BenchmarkAgeBracket {
  if (age < 30) return "18-29";
  if (age < 40) return "30-39";
  if (age < 50) return "40-49";
  if (age < 60) return "50-59";
  return "60+";
}

export function getBenchmarkDefinition(name: string): BenchmarkDefinition | undefined {
  const wanted = normalizeName(name);
  // "Plank" and "Plank Hold" (and "Norwegian 4×4" / "4x4") refer to the same tests.
  return CREDO_TEN.find(
    (b) => normalizeName(b.name) === wanted || normalizeName(b.name).startsWith(wanted),
  );
}

/**
 * Percentile (1-99) for a benchmark result via linear interpolation between
 * percentile bands. For inversed benchmarks (e.g. 1000m Row time) a LOWER
 * value scores a HIGHER percentile.
 */
export function lookupBenchmarkPercentile(
  name: string,
  sex: Sex,
  age: number,
  value: number,
): number {
  const wanted = normalizeName(name);
  const bracket = benchmarkAgeBracketFor(age);
  const entry = BENCHMARK_STANDARDS.find(
    (s) =>
      s.sex === sex &&
      s.ageBracket === bracket &&
      (normalizeName(s.benchmark) === wanted ||
        normalizeName(s.benchmark).startsWith(wanted)),
  );
  if (!entry) return 1;

  const p = entry.percentiles;
  let points: Array<[number, number]> = [
    [10, p.p10],
    [25, p.p25],
    [50, p.p50],
    [75, p.p75],
    [90, p.p90],
    [95, p.p95],
  ];

  let v = value;
  if (entry.isInversed) {
    // Negate so the sequence ascends with percentile, then interpolate normally.
    points = points.map(([pct, val]) => [pct, -val]);
    v = -value;
  }

  const first = points[0];
  const last = points[points.length - 1];
  // Extrapolation edges: 1st percentile well below p10, 99th slightly beyond p95.
  const floor: [number, number] = [1, first[1] - Math.abs(last[1] - first[1]) * 0.35 - 1e-9];
  const ceil: [number, number] = [99, last[1] + Math.abs(last[1] - first[1]) * 0.2];
  const bands = [floor, ...points, ceil];

  if (v <= bands[0][1]) return 1;
  if (v >= bands[bands.length - 1][1]) return 99;

  for (let i = 0; i < bands.length - 1; i++) {
    const [lowerPct, lowerVal] = bands[i];
    const [upperPct, upperVal] = bands[i + 1];
    if (v >= lowerVal && v <= upperVal) {
      if (upperVal === lowerVal) continue;
      const fraction = (v - lowerVal) / (upperVal - lowerVal);
      const pct = Math.round(lowerPct + fraction * (upperPct - lowerPct));
      return Math.min(99, Math.max(1, pct));
    }
  }
  return 1;
}
