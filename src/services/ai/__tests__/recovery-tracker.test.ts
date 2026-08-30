import { describe, expect, it } from "vitest";
import {
  fatigueLevelFor,
  groupsAvailableForTraining,
  recoveryWindowHours,
  updateRecoveryAfterWorkout,
} from "../recovery-tracker";
import { NOW, PROFILE } from "./fixtures";

const HOUR = 60 * 60 * 1000;

describe("recoveryWindowHours", () => {
  it("uses a ~48h base for moderate volume", () => {
    expect(recoveryWindowHours(3, "intermediate")).toBe(48);
  });

  it("scales up with volume, capped inside 24-96h", () => {
    expect(recoveryWindowHours(6, "intermediate")).toBeGreaterThan(
      recoveryWindowHours(3, "intermediate"),
    );
    expect(recoveryWindowHours(20, "beginner")).toBeLessThanOrEqual(96);
    expect(recoveryWindowHours(0, "advanced")).toBeGreaterThanOrEqual(24);
  });

  it("beginners recover slower than advanced lifters (PRD science notes)", () => {
    expect(recoveryWindowHours(4, "beginner")).toBeGreaterThan(
      recoveryWindowHours(4, "advanced"),
    );
  });
});

describe("updateRecoveryAfterWorkout + fatigueLevelFor", () => {
  it("marks trained groups fatigued with a future recovery date", () => {
    const states = updateRecoveryAfterWorkout(
      [],
      [{ group: "chest", sets: 4 }],
      PROFILE,
      NOW,
    );
    expect(states).toHaveLength(1);
    const chest = states[0];
    expect(chest.muscleGroup).toBe("chest");
    expect(chest.fatigueLevel).toBe("fatigued");
    expect(chest.volumeLastSession).toBe(4);
    expect(Date.parse(chest.estimatedRecoveryDate)).toBeGreaterThan(NOW.getTime());
  });

  it("progresses fatigued → recovering → fresh across the window", () => {
    const [chest] = updateRecoveryAfterWorkout(
      [],
      [{ group: "chest", sets: 4 }],
      PROFILE,
      NOW,
    );
    const window = Date.parse(chest.estimatedRecoveryDate) - NOW.getTime();
    expect(fatigueLevelFor(chest, new Date(NOW.getTime() + 1 * HOUR))).toBe("fatigued");
    expect(fatigueLevelFor(chest, new Date(NOW.getTime() + window * 0.6))).toBe("recovering");
    expect(fatigueLevelFor(chest, new Date(NOW.getTime() + window + HOUR))).toBe("fresh");
  });

  it("refreshes untouched groups and merges new trained groups", () => {
    const initial = updateRecoveryAfterWorkout(
      [],
      [{ group: "quads", sets: 4 }],
      PROFILE,
      NOW,
    );
    const threeDaysLater = new Date(NOW.getTime() + 72 * HOUR);
    const next = updateRecoveryAfterWorkout(
      initial,
      [{ group: "chest", sets: 3 }],
      PROFILE,
      threeDaysLater,
    );
    const quads = next.find((s) => s.muscleGroup === "quads")!;
    const chest = next.find((s) => s.muscleGroup === "chest")!;
    expect(quads.fatigueLevel).toBe("fresh"); // recovered by now
    expect(quads.lastTrainedDate).toBe(NOW.toISOString()); // unchanged
    expect(chest.fatigueLevel).toBe("fatigued");
  });

  it("sums duplicate group volumes from multiple exercises", () => {
    const [chest] = updateRecoveryAfterWorkout(
      [],
      [
        { group: "chest", sets: 3 },
        { group: "chest", sets: 3 },
      ],
      PROFILE,
      NOW,
    );
    expect(chest.volumeLastSession).toBe(6);
  });
});

describe("groupsAvailableForTraining", () => {
  it("excludes currently fatigued groups", () => {
    const states = updateRecoveryAfterWorkout(
      [],
      [
        { group: "chest", sets: 4 },
        { group: "back", sets: 4 },
      ],
      PROFILE,
      NOW,
    );
    expect(groupsAvailableForTraining(states, new Date(NOW.getTime() + HOUR))).toEqual([]);
    const later = new Date(NOW.getTime() + 96 * HOUR);
    expect(groupsAvailableForTraining(states, later).sort()).toEqual(["back", "chest"]);
  });
});
