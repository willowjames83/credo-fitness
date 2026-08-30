import { describe, expect, it } from "vitest";
import {
  applyProgression,
  best1RMFromHistory,
  demographicEstimate1RM,
  detectFatigue,
  epley1RM,
  recommendWeight,
} from "../weight-recommender";
import { LIBRARY, NOW, PROFILE, daysAgo, historyEntry } from "./fixtures";

const bench = LIBRARY.find((e) => e.id === "bench_press")!;

describe("epley1RM", () => {
  it("returns the weight itself for a single rep", () => {
    expect(epley1RM(225, 1)).toBe(225);
  });

  it("applies weight * (1 + reps/30)", () => {
    expect(epley1RM(200, 5)).toBeCloseTo(233.33, 1);
    expect(epley1RM(185, 8)).toBeCloseTo(234.33, 1);
  });

  it("returns 0 for invalid inputs", () => {
    expect(epley1RM(200, 0)).toBe(0);
    expect(epley1RM(0, 10)).toBe(0);
  });
});

describe("best1RMFromHistory", () => {
  it("returns the best Epley estimate across in-window sets", () => {
    const entries = [
      historyEntry("bench_press", daysAgo(10), [[185, 8], [185, 6]]),
      historyEntry("bench_press", daysAgo(40), [[195, 5]]), // 227.5
    ];
    // 185x8 = 234.33 is the best
    expect(best1RMFromHistory(entries, 90, NOW)).toBeCloseTo(234.33, 1);
  });

  it("ignores entries outside the window (best-of-90-days behavior)", () => {
    const entries = [
      historyEntry("bench_press", daysAgo(120), [[275, 5]]), // stale PR
      historyEntry("bench_press", daysAgo(10), [[185, 5]]),
    ];
    expect(best1RMFromHistory(entries, 90, NOW)).toBeCloseTo(215.83, 1);
  });

  it("honors a stored estimated1RM when it beats computed sets", () => {
    const entries = [
      historyEntry("bench_press", daysAgo(5), [[100, 5]], { estimated1RM: 250 }),
    ];
    expect(best1RMFromHistory(entries, 90, NOW)).toBe(250);
  });

  it("returns null with no usable history", () => {
    expect(best1RMFromHistory([], 90, NOW)).toBeNull();
  });
});

describe("recommendWeight (PRD goal → intensity table)", () => {
  it("build_muscle → 65-75% for 8-12 reps", () => {
    const rec = recommendWeight({ goal: "build_muscle", estimated1RM: 200 });
    expect(rec.pctOf1RM).toBeCloseTo(0.7);
    expect(rec.weight).toBe(140);
    expect(rec.repRange).toEqual([8, 12]);
  });

  it("increase_strength → 80-90% for 3-6 reps", () => {
    const rec = recommendWeight({ goal: "increase_strength", estimated1RM: 200 });
    expect(rec.pctOf1RM).toBeCloseTo(0.85);
    expect(rec.weight).toBe(170);
    expect(rec.repRange).toEqual([3, 6]);
  });

  it("get_lean → 55-65% for 12-15 reps", () => {
    const rec = recommendWeight({ goal: "get_lean", estimated1RM: 200 });
    expect(rec.weight).toBe(120);
    expect(rec.repRange).toEqual([12, 15]);
  });

  it("longevity and general_fitness → 65-80% for 6-10 reps", () => {
    for (const goal of ["longevity", "general_fitness"] as const) {
      const rec = recommendWeight({ goal, estimated1RM: 200 });
      expect(rec.pctOf1RM).toBeCloseTo(0.725);
      expect(rec.weight).toBe(145);
      expect(rec.repRange).toEqual([6, 10]);
    }
  });

  it("respects a custom rounding increment", () => {
    const rec = recommendWeight({
      goal: "build_muscle",
      estimated1RM: 203,
      roundingIncrement: 2.5,
    });
    expect(rec.weight % 2.5).toBe(0);
  });
});

describe("detectFatigue / applyProgression", () => {
  it("detects declining reps at the same weight in the last session", () => {
    const fatigued = historyEntry("bench_press", daysAgo(2), [[185, 8], [185, 6], [185, 5]]);
    expect(detectFatigue(fatigued)).toBe(true);
    const steady = historyEntry("bench_press", daysAgo(2), [[185, 8], [185, 8], [185, 8]]);
    expect(detectFatigue(steady)).toBe(false);
  });

  it("deloads 5% on a fatigued last session", () => {
    const result = applyProgression({
      history: [
        historyEntry("bench_press", daysAgo(5), [[185, 8], [185, 8]]),
        historyEntry("bench_press", daysAgo(2), [[185, 8], [185, 6], [185, 5]]),
      ],
      targetRepRange: [8, 12],
      currentWeight: 185,
    });
    expect(result.action).toBe("deload");
    expect(result.weight).toBe(175); // 185 * 0.95 = 175.75 → 175
  });

  it("increases 2.5-5% after two sessions hitting all target reps", () => {
    const result = applyProgression({
      history: [
        historyEntry("bench_press", daysAgo(5), [[185, 12], [185, 12], [185, 12]]),
        historyEntry("bench_press", daysAgo(2), [[185, 12], [185, 13], [185, 12]]),
      ],
      targetRepRange: [8, 12],
      currentWeight: 185,
    });
    expect(result.action).toBe("increase");
    expect(result.weight).toBeGreaterThan(185);
    expect(result.weight).toBeLessThanOrEqual(Math.round(185 * 1.055));
  });

  it("holds when only one session hit all target reps", () => {
    const result = applyProgression({
      history: [
        historyEntry("bench_press", daysAgo(5), [[185, 9], [185, 8]]),
        historyEntry("bench_press", daysAgo(2), [[185, 12], [185, 12]]),
      ],
      targetRepRange: [8, 12],
      currentWeight: 185,
    });
    expect(result.action).toBe("hold");
    expect(result.weight).toBe(185);
  });
});

describe("demographicEstimate1RM", () => {
  it("gives a conservative rounded estimate with no lookup", () => {
    const estimate = demographicEstimate1RM({ profile: PROFILE, exercise: bench });
    expect(estimate).toBeGreaterThan(50);
    expect(estimate).toBeLessThan(PROFILE.weight!); // conservative: below bodyweight bench
    expect(estimate % 5).toBe(0);
  });

  it("scales down for females and beginners", () => {
    const base = demographicEstimate1RM({ profile: PROFILE, exercise: bench });
    const female = demographicEstimate1RM({
      profile: { ...PROFILE, sex: "female" },
      exercise: bench,
    });
    const beginner = demographicEstimate1RM({
      profile: { ...PROFILE, experienceLevel: "beginner" },
      exercise: bench,
    });
    expect(female).toBeLessThan(base);
    expect(beginner).toBeLessThan(base);
  });

  it("prefers an injected percentile lookup", () => {
    const estimate = demographicEstimate1RM({
      profile: PROFILE,
      exercise: bench,
      percentileLookup: () => 152,
    });
    expect(estimate).toBe(150); // rounded to 5
  });
});
