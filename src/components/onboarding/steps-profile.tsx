"use client";

// Onboarding steps 1-4: welcome, basic info, experience, goal.

import type { Sex } from "@/lib/types";
import {
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  type DraftAction,
  type OnboardingDraft,
} from "./draft";
import {
  FieldLabel,
  NumberInput,
  OptionCard,
  SegmentedControl,
  StepHeading,
} from "./fields";

const PILLAR_SUMMARY =
  "Four pillars, one score — Strength, Stability, Cardio, and Nutrition.";

export function WelcomeStep() {
  return (
    <div className="py-4 text-center">
      <p className="text-xs font-bold uppercase tracking-[2.5px] text-[var(--shell-accent)]">
        Credo
      </p>
      <h1 className="mx-auto mt-5 max-w-[24ch] font-display text-[30px] leading-[1.15] text-[var(--shell-text-primary)] sm:text-[34px]">
        Train for the body you want today, and need at 80.
      </h1>
      <p className="mx-auto mt-4 max-w-[36ch] text-sm leading-relaxed text-[var(--shell-text-secondary)]">
        {PILLAR_SUMMARY}
      </p>
      <p className="mt-6 text-[13px] text-[var(--shell-text-tertiary)]">
        A few questions and your first week is ready.
      </p>
    </div>
  );
}

export function BasicInfoStep({
  draft,
  dispatch,
  firstName,
}: {
  draft: OnboardingDraft;
  dispatch: (action: DraftAction) => void;
  firstName: string | null;
}) {
  return (
    <div>
      <StepHeading
        title={firstName ? `Nice to meet you, ${firstName}.` : "Nice to meet you."}
        subtitle="A few basics so Credo can calibrate your starting weights and benchmarks."
      />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="ob-age">Age</FieldLabel>
            <NumberInput
              id="ob-age"
              value={draft.age}
              onChange={(age) => dispatch({ type: "patch", patch: { age } })}
              placeholder="35"
            />
          </div>
          <div>
            <FieldLabel htmlFor="ob-weight">Weight</FieldLabel>
            <NumberInput
              id="ob-weight"
              value={draft.weight}
              onChange={(weight) => dispatch({ type: "patch", patch: { weight } })}
              placeholder="180"
              suffix="lb"
            />
          </div>
        </div>
        <div>
          <FieldLabel>Sex</FieldLabel>
          <SegmentedControl<Sex>
            ariaLabel="Sex"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
            value={draft.sex}
            onChange={(sex) => dispatch({ type: "patch", patch: { sex } })}
          />
        </div>
        <div>
          <FieldLabel htmlFor="ob-height-ft">Height</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              id="ob-height-ft"
              value={draft.heightFt}
              onChange={(heightFt) =>
                dispatch({ type: "patch", patch: { heightFt } })
              }
              placeholder="5"
              suffix="ft"
            />
            <NumberInput
              id="ob-height-in"
              value={draft.heightInches}
              onChange={(heightInches) =>
                dispatch({ type: "patch", patch: { heightInches } })
              }
              placeholder="10"
              suffix="in"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExperienceStep({
  draft,
  dispatch,
}: {
  draft: OnboardingDraft;
  dispatch: (action: DraftAction) => void;
}) {
  return (
    <div>
      <StepHeading
        title="How long have you been training?"
        subtitle="This sets your starting volume and how fast Credo progresses you."
      />
      <div role="radiogroup" aria-label="Experience level" className="space-y-3">
        {EXPERIENCE_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={draft.experienceLevel === option.value}
            onSelect={() =>
              dispatch({
                type: "patch",
                patch: { experienceLevel: option.value },
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

export function GoalStep({
  draft,
  dispatch,
}: {
  draft: OnboardingDraft;
  dispatch: (action: DraftAction) => void;
}) {
  return (
    <div>
      <StepHeading
        title="What are you training for?"
        subtitle="Your goal shapes exercise selection, rep ranges, and rest periods."
      />
      <div role="radiogroup" aria-label="Training goal" className="space-y-3">
        {GOAL_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            badge={option.recommended ? "Recommended" : undefined}
            selected={draft.goal === option.value}
            onSelect={() =>
              dispatch({ type: "patch", patch: { goal: option.value } })
            }
          />
        ))}
      </div>
    </div>
  );
}
