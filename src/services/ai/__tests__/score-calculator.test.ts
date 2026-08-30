import { describe, expect, it } from "vitest";
import {
  CREDO_PILLAR_WEIGHTS,
  STRENGTH_SUBSCORE_WEIGHTS,
  calculateCardioScore,
  calculateCredoScore,
  calculateNutritionScore,
  calculateStabilityScore,
  calculateStrengthScore,
  computeScoreTrend,
  defaultStandardsLookup,
  demographicContextString,
  percentileFromStandard,
} from "../score-calculator";
import { NOW, PROFILE, daysAgo, historyEntry } from "./fixtures";

describe("weights", () => {
  it("strength subscore weights are 15/15/15/15/10/10/10/10 and sum to 1", () => {
    expect(STRENGTH_SUBSCORE_WEIGHTS["Upper Push"]).toBe(0.15);
    expect(STRENGTH_SUBSCORE_WEIGHTS["Upper Pull"]).toBe(0.15);
    expect(STRENGTH_SUBSCORE_WEIGHTS["Lower Push"]).toBe(0.15);
    expect(STRENGTH_SUBSCORE_WEIGHTS["Lower Pull"]).toBe(0.15);
    expect(STRENGTH_SUBSCORE_WEIGHTS.Core).toBe(0.1);
    expect(STRENGTH_SUBSCORE_WEIGHTS.Grip).toBe(0.1);
    expect(STRENGTH_SUBSCORE_WEIGHTS.Carry).toBe(0.1);
    expect(STRENGTH_SUBSCORE_WEIGHTS["Muscular Endurance"]).toBe(0.1);
    const sum = Object.values(STRENGTH_SUBSCORE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1);
  });

  it("credo pillar weights match constants (.3/.3/.2/.2)", () => {
    expect(CREDO_PILLAR_WEIGHTS).toEqual({
      strength: 0.3,
      cardio: 0.3,
      stability: 0.2,
      nutrition: 0.2,
    });
  });
});

describe("calculateCredoScore", () => {
  it("computes the weighted composite", () => {
    expect(
      calculateCredoScore({ strength: 80, cardio: 70, stability: 60, nutrition: 50 }),
    ).toBe(67); // 24 + 21 + 12 + 10
    expect(
      calculateCredoScore({ strength: 100, cardio: 100, stability: 100, nutrition: 100 }),
    ).toBe(100);
  });
});

describe("calculateStrengthScore", () => {
  it("scores a lift subscore from demographic percentiles", () => {
    const history = [historyEntry("bench_press", daysAgo(10), [[185, 8]])];
    const result = calculateStrengthScore({
      profile: PROFILE,
      exerciseHistory: history,
      now: NOW,
    });
    const upperPush = result.subscores.find((s) => s.category === "Upper Push")!;
    // 185x8 → e1RM 234.3, relative 1.27 vs male 40-49 bench standards → ~88th
    expect(upperPush.keyLift).toBe("Bench Press");
    expect(upperPush.estimated1RM).toBe(234);
    expect(upperPush.relativeStrength).toBeCloseTo(1.27, 1);
    expect(upperPush.percentile).toBeGreaterThan(75);
    expect(upperPush.percentile).toBeLessThanOrEqual(95);
    expect(result.subscores).toHaveLength(8);
  });

  it("uses the best result from the last 90 days only", () => {
    const withStalePR = calculateStrengthScore({
      profile: PROFILE,
      exerciseHistory: [
        historyEntry("bench_press", daysAgo(120), [[275, 5]]), // stale PR — ignored
        historyEntry("bench_press", daysAgo(10), [[185, 8]]),
      ],
      now: NOW,
    });
    const fresh = calculateStrengthScore({
      profile: PROFILE,
      exerciseHistory: [historyEntry("bench_press", daysAgo(10), [[185, 8]])],
      now: NOW,
    });
    expect(withStalePR.overall).toBe(fresh.overall);
  });

  it("overall equals the weighted sum of subscores", () => {
    const result = calculateStrengthScore({
      profile: PROFILE,
      exerciseHistory: [
        historyEntry("bench_press", daysAgo(10), [[185, 8]]),
        historyEntry("back_squat", daysAgo(7), [[225, 6]]),
      ],
      benchmarkResults: [{ name: "Plank", value: 120 }],
      now: NOW,
    });
    const expected = Math.round(
      result.subscores.reduce(
        (sum, s) => sum + s.score * STRENGTH_SUBSCORE_WEIGHTS[s.category],
        0,
      ),
    );
    expect(result.overall).toBe(expected);
    const core = result.subscores.find((s) => s.category === "Core")!;
    expect(core.score).toBe(75); // 120s plank
    expect(core.keyLift).toBe("Plank Hold");
  });

  it("builds the demographic context string", () => {
    expect(demographicContextString(PROFILE)).toBe("M, 40-44, 185 lb, Intermediate");
    expect(
      demographicContextString({ age: 33, sex: "female", weight: 140, experienceLevel: "beginner" }),
    ).toBe("F, 30-34, 140 lb, Beginner");
  });

  it("computes trend from prior snapshots (~4 weeks back)", () => {
    const result = calculateStrengthScore({
      profile: PROFILE,
      exerciseHistory: [historyEntry("bench_press", daysAgo(10), [[185, 8]])],
      priorScores: [{ date: daysAgo(28), overall: 5 }],
      now: NOW,
    });
    expect(result.trend).toBe("improving");
    expect(result.trendDelta).toBe(result.overall - 5);
  });

  it("returns zeroed subscores with no data", () => {
    const result = calculateStrengthScore({
      profile: PROFILE,
      exerciseHistory: [],
      now: NOW,
    });
    expect(result.overall).toBe(0);
    expect(result.trend).toBe("stable");
  });
});

describe("computeScoreTrend", () => {
  it("flags improving / declining / stable around a ±2 threshold", () => {
    const snaps = [{ date: daysAgo(28), overall: 60 }];
    expect(computeScoreTrend(70, snaps, NOW).trend).toBe("improving");
    expect(computeScoreTrend(50, snaps, NOW).trend).toBe("declining");
    expect(computeScoreTrend(61, snaps, NOW).trend).toBe("stable");
    expect(computeScoreTrend(70, [], NOW)).toEqual({ trend: "stable", trendDelta: 0 });
  });

  it("ignores snapshots newer than 14 days", () => {
    expect(
      computeScoreTrend(70, [{ date: daysAgo(3), overall: 40 }], NOW).trend,
    ).toBe("stable");
  });
});

describe("percentileFromStandard / defaultStandardsLookup", () => {
  it("interpolates linearly between percentile breakpoints", () => {
    const std = { p10: 0.5, p25: 0.7, p50: 0.9, p75: 1.1, p90: 1.3, p95: 1.5 };
    expect(percentileFromStandard(0.9, std)).toBe(50);
    const halfway = percentileFromStandard(1.0, std); // halfway 50→75 ≈ 62.5
    expect(halfway).toBeGreaterThanOrEqual(62);
    expect(halfway).toBeLessThanOrEqual(63);
    expect(percentileFromStandard(0, std)).toBe(0);
    expect(percentileFromStandard(5, std)).toBe(100);
  });

  it("serves age- and sex-specific fallback rows", () => {
    const male = defaultStandardsLookup("bench_press", "male", 42)!;
    const female = defaultStandardsLookup("bench_press", "female", 42)!;
    expect(male.p50).toBe(0.9);
    expect(female.p50).toBeLessThan(male.p50);
    expect(defaultStandardsLookup("unknown_lift", "male", 42)).toBeNull();
  });
});

describe("pillar calculators", () => {
  it("cardio: at-target inputs score 90+, empty inputs score 0", () => {
    const good = calculateCardioScore({
      weeklyZone2Minutes: 150,
      sessionsThisWeek: 3,
      weeksActiveOfLast4: 4,
    });
    expect(good).toBeGreaterThanOrEqual(90);
    expect(
      calculateCardioScore({ weeklyZone2Minutes: 0, sessionsThisWeek: 0, weeksActiveOfLast4: 0 }),
    ).toBe(0);
  });

  it("cardio: a strong VO2max lifts the score", () => {
    const base = { weeklyZone2Minutes: 75, sessionsThisWeek: 2, weeksActiveOfLast4: 3 };
    const withVo2 = calculateCardioScore({ ...base, vo2max: 55, age: 40, sex: "male" });
    const without = calculateCardioScore(base);
    expect(withVo2).toBeGreaterThan(without);
  });

  it("stability: full targets score 100, half-effort lands in between", () => {
    expect(
      calculateStabilityScore({
        weeklyStabilityMinutes: 60,
        weeklyCoreSets: 6,
        weeklyUnilateralSets: 4,
        recoveredGroupRatio: 1,
      }),
    ).toBe(100);
    const half = calculateStabilityScore({
      weeklyStabilityMinutes: 30,
      weeklyCoreSets: 3,
      weeklyUnilateralSets: 2,
      recoveredGroupRatio: 0.5,
    });
    expect(half).toBe(50);
  });

  it("nutrition: 7 on-target days score 100, nothing logged scores 0", () => {
    expect(
      calculateNutritionScore({
        dailyProteinG: [180, 175, 185, 180, 190, 178, 182],
        proteinTargetG: 180,
      }),
    ).toBe(100);
    expect(
      calculateNutritionScore({
        dailyProteinG: [null, null, null, null, null, null, null],
        proteinTargetG: 180,
      }),
    ).toBe(0);
  });

  it("nutrition: partial logging is penalized via consistency", () => {
    const partial = calculateNutritionScore({
      dailyProteinG: [180, 180, null, null, null, null, null],
      proteinTargetG: 180,
    });
    expect(partial).toBeGreaterThan(0);
    expect(partial).toBeLessThan(100);
  });
});
