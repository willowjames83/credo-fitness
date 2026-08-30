// Onboarding wizard state: a draft of OnboardingCompleteRequest held in one
// reducer, with per-step validation. Numeric fields are kept as raw strings
// while the user types and only converted on submit.

import {
  ALL_EQUIPMENT,
  type Difficulty,
  type Equipment,
  type OnboardingCompleteRequest,
  type Sex,
  type SplitType,
  type TrainingGoal,
  type TrainingLocation,
  type VarietyLevel,
} from "@/lib/types";

export const TOTAL_STEPS = 10;

export type SplitChoice = SplitType | "ai_optimized";

export interface OnboardingDraft {
  // Step 2 — basic info
  age: string;
  sex: Sex | null;
  weight: string;
  heightFt: string;
  heightInches: string;
  // Step 3 — experience
  experienceLevel: Difficulty | null;
  // Step 4 — goal
  goal: TrainingGoal | null;
  // Step 5 — schedule
  daysPerWeek: number;
  sessionDuration: number;
  // Step 6 — equipment
  availableEquipment: Equipment[];
  /** True once the user has manually changed the equipment selection. */
  equipmentCustomized: boolean;
  // Step 7 — location
  trainingLocation: TrainingLocation | null;
  // Step 8 — split
  preferredSplit: SplitChoice;
  enableSupersets: boolean;
  varietyLevel: VarietyLevel;
  // Step 9 — benchmarks
  benchmarkMode: "enter" | "skip" | null;
  /** Keyed by exact CREDO_TEN benchmark name; raw input strings. */
  benchmarkValues: Record<string, string>;
}

export const initialDraft: OnboardingDraft = {
  age: "",
  sex: null,
  weight: "",
  heightFt: "",
  heightInches: "",
  experienceLevel: null,
  goal: null,
  daysPerWeek: 4,
  sessionDuration: 60,
  availableEquipment: ["bodyweight"],
  equipmentCustomized: false,
  trainingLocation: null,
  preferredSplit: "ai_optimized",
  enableSupersets: true,
  varietyLevel: "medium",
  benchmarkMode: null,
  benchmarkValues: {},
};

export type DraftAction =
  | { type: "patch"; patch: Partial<OnboardingDraft> }
  | { type: "toggleEquipment"; equipment: Equipment }
  | { type: "bodyweightOnly" }
  | { type: "setLocation"; location: TrainingLocation }
  | { type: "setBenchmarkValue"; name: string; value: string };

export function draftReducer(
  draft: OnboardingDraft,
  action: DraftAction,
): OnboardingDraft {
  switch (action.type) {
    case "patch":
      return { ...draft, ...action.patch };
    case "toggleEquipment": {
      const selected = draft.availableEquipment.includes(action.equipment);
      return {
        ...draft,
        equipmentCustomized: true,
        availableEquipment: selected
          ? draft.availableEquipment.filter((e) => e !== action.equipment)
          : [...draft.availableEquipment, action.equipment],
      };
    }
    case "bodyweightOnly":
      return {
        ...draft,
        equipmentCustomized: true,
        availableEquipment: ["bodyweight"],
      };
    case "setLocation": {
      // Choosing a commercial gym pre-selects the full equipment list on
      // step 6's state, unless the user already customized their selection.
      const next: OnboardingDraft = {
        ...draft,
        trainingLocation: action.location,
      };
      if (action.location === "commercial_gym" && !draft.equipmentCustomized) {
        next.availableEquipment = [...ALL_EQUIPMENT];
      }
      return next;
    }
    case "setBenchmarkValue":
      return {
        ...draft,
        benchmarkValues: {
          ...draft.benchmarkValues,
          [action.name]: action.value,
        },
      };
  }
}

// ── Validation ──────────────────────────────────────────────────────────

export const AGE_MIN = 13;
export const AGE_MAX = 100;
export const WEIGHT_MIN = 60;
export const WEIGHT_MAX = 500;

function toNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function validateBasicInfo(draft: OnboardingDraft): string | null {
  const age = toNumber(draft.age);
  if (age === null || !Number.isInteger(age) || age < AGE_MIN || age > AGE_MAX) {
    return `Enter an age between ${AGE_MIN} and ${AGE_MAX}.`;
  }
  if (!draft.sex) return "Select male or female.";
  const weight = toNumber(draft.weight);
  if (weight === null || weight < WEIGHT_MIN || weight > WEIGHT_MAX) {
    return `Enter a weight between ${WEIGHT_MIN} and ${WEIGHT_MAX} lb.`;
  }
  const ft = toNumber(draft.heightFt);
  const inches = draft.heightInches.trim() === "" ? 0 : toNumber(draft.heightInches);
  if (ft === null || !Number.isInteger(ft) || ft < 3 || ft > 8) {
    return "Enter a height between 3 and 8 feet.";
  }
  if (inches === null || !Number.isInteger(inches) || inches < 0 || inches > 11) {
    return "Inches must be between 0 and 11.";
  }
  return null;
}

export function validateBenchmarks(draft: OnboardingDraft): string | null {
  if (draft.benchmarkMode !== "enter") return null;
  for (const [name, raw] of Object.entries(draft.benchmarkValues)) {
    if (raw.trim() === "") continue;
    const n = toNumber(raw);
    if (n === null || n <= 0) {
      return `${name} must be a number greater than 0.`;
    }
  }
  return null;
}

/** Returns an error message when the given step cannot advance, else null. */
export function validateStep(step: number, draft: OnboardingDraft): string | null {
  switch (step) {
    case 2:
      return validateBasicInfo(draft);
    case 3:
      return draft.experienceLevel ? null : "Select your experience level.";
    case 4:
      return draft.goal ? null : "Select a training goal.";
    case 5:
      return draft.daysPerWeek >= 2 &&
        draft.daysPerWeek <= 6 &&
        [30, 45, 60, 75, 90].includes(draft.sessionDuration)
        ? null
        : "Pick your schedule.";
    case 6:
      return draft.availableEquipment.length > 0
        ? null
        : "Select at least one option — bodyweight counts.";
    case 7:
      return draft.trainingLocation ? null : "Select where you train.";
    case 9:
      return validateBenchmarks(draft);
    default:
      return null;
  }
}

// ── Submission payload ──────────────────────────────────────────────────

export function buildRequest(draft: OnboardingDraft): OnboardingCompleteRequest {
  const ft = toNumber(draft.heightFt) ?? 0;
  const inches = toNumber(draft.heightInches) ?? 0;
  const heightIn = ft * 12 + inches;

  const benchmarks =
    draft.benchmarkMode === "enter"
      ? Object.entries(draft.benchmarkValues)
          .map(([name, raw]) => ({ name, value: Number(raw) }))
          .filter((b) => Number.isFinite(b.value) && b.value > 0)
      : [];

  return {
    profile: {
      age: Number(draft.age),
      sex: draft.sex ?? "male",
      weight: Number(draft.weight),
      heightIn: heightIn > 0 ? heightIn : undefined,
      experienceLevel: draft.experienceLevel ?? "beginner",
    },
    preferences: {
      goal: draft.goal ?? "longevity",
      daysPerWeek: draft.daysPerWeek,
      sessionDuration: draft.sessionDuration,
      preferredSplit: draft.preferredSplit,
      availableEquipment: draft.availableEquipment,
      trainingLocation: draft.trainingLocation ?? "mixed",
      enableSupersets: draft.enableSupersets,
      varietyLevel: draft.varietyLevel,
    },
    ...(benchmarks.length > 0 ? { benchmarks } : {}),
  };
}

// ── Display copy ────────────────────────────────────────────────────────

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbells",
  kettlebell: "Kettlebell",
  cable: "Cable machine",
  machine: "Machines",
  bodyweight: "Bodyweight",
  bands: "Resistance bands",
  pull_up_bar: "Pull-up bar",
  bench: "Bench",
  rack: "Squat rack",
};

export const EXPERIENCE_OPTIONS: {
  value: Difficulty;
  label: string;
  description: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to lifting, or returning after a year+ off",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Consistent training for 1-3 years",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "3+ years of structured programming",
  },
];

export const GOAL_OPTIONS: {
  value: TrainingGoal;
  label: string;
  description: string;
  recommended?: boolean;
}[] = [
  {
    value: "longevity",
    label: "Longevity",
    description: "Train for the body you'll need at 80.",
    recommended: true,
  },
  {
    value: "build_muscle",
    label: "Build muscle",
    description: "Add size with hypertrophy-focused volume.",
  },
  {
    value: "increase_strength",
    label: "Increase strength",
    description: "Chase heavier numbers on the big lifts.",
  },
  {
    value: "get_lean",
    label: "Get lean",
    description: "Drop fat while holding on to muscle.",
  },
  {
    value: "general_fitness",
    label: "General fitness",
    description: "Balanced training that keeps you capable.",
  },
];

export const LOCATION_OPTIONS: {
  value: TrainingLocation;
  label: string;
  description: string;
}[] = [
  {
    value: "home",
    label: "Home",
    description: "Train with whatever you keep at home.",
  },
  {
    value: "commercial_gym",
    label: "Commercial gym",
    description: "Full access to racks, machines, and free weights.",
  },
  {
    value: "outdoor",
    label: "Outdoor",
    description: "Parks, pull-up bars, and open space.",
  },
  {
    value: "mixed",
    label: "Mixed",
    description: "A bit of everything, depending on the day.",
  },
];

export const SPLIT_OPTIONS: {
  value: SplitChoice;
  label: string;
  description: string;
  recommended?: boolean;
}[] = [
  {
    value: "ai_optimized",
    label: "Let Credo decide",
    description: "The engine picks the split that fits your schedule and recovery.",
    recommended: true,
  },
  {
    value: "push_pull_legs",
    label: "Push / Pull / Legs",
    description: "Classic three-way split built around movement patterns.",
  },
  {
    value: "upper_lower",
    label: "Upper / Lower",
    description: "Alternate upper- and lower-body days.",
  },
  {
    value: "full_body",
    label: "Full body",
    description: "Hit everything each session — great at lower frequencies.",
  },
];

/** Exact CREDO_TEN names for the curated onboarding subset. */
export const BENCHMARK_SUBSET = [
  "Back Squat",
  "Bench Press",
  "Hex Bar Deadlift",
  "Pull-Ups",
  "Push-Ups",
  "Plank Hold",
] as const;
