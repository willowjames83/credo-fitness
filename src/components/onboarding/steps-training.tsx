"use client";

// Onboarding steps 5-8: schedule, equipment, location, split preference.

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { ALL_EQUIPMENT, type VarietyLevel } from "@/lib/types";
import {
  EQUIPMENT_LABELS,
  LOCATION_OPTIONS,
  SPLIT_OPTIONS,
  type DraftAction,
  type OnboardingDraft,
} from "./draft";
import {
  FieldLabel,
  OptionCard,
  PillGroup,
  SegmentedControl,
  StepHeading,
  Toggle,
} from "./fields";

const DAY_OPTIONS = [2, 3, 4, 5, 6] as const;
const DURATION_OPTIONS = [30, 45, 60, 75, 90] as const;

export function ScheduleStep({
  draft,
  dispatch,
}: {
  draft: OnboardingDraft;
  dispatch: (action: DraftAction) => void;
}) {
  return (
    <div>
      <StepHeading
        title="What does your week look like?"
        subtitle="Be honest — a plan you can keep beats a plan you admire."
      />
      <div className="space-y-6">
        <div>
          <FieldLabel>Days per week</FieldLabel>
          <PillGroup
            ariaLabel="Days per week"
            options={DAY_OPTIONS}
            value={draft.daysPerWeek}
            onChange={(daysPerWeek) =>
              dispatch({ type: "patch", patch: { daysPerWeek } })
            }
          />
        </div>
        <div>
          <FieldLabel>Session length</FieldLabel>
          <PillGroup
            ariaLabel="Session length in minutes"
            options={DURATION_OPTIONS}
            value={draft.sessionDuration}
            onChange={(sessionDuration) =>
              dispatch({ type: "patch", patch: { sessionDuration } })
            }
            format={(minutes) => `${minutes} min`}
          />
        </div>
      </div>
    </div>
  );
}

export function EquipmentStep({
  draft,
  dispatch,
}: {
  draft: OnboardingDraft;
  dispatch: (action: DraftAction) => void;
}) {
  const bodyweightOnly =
    draft.availableEquipment.length === 1 &&
    draft.availableEquipment[0] === "bodyweight";

  return (
    <div>
      <StepHeading
        title="What equipment do you have?"
        subtitle="Select everything you can train with. You can change this any time."
      />
      <div
        role="group"
        aria-label="Available equipment"
        className="grid grid-cols-2 gap-2.5"
      >
        {ALL_EQUIPMENT.map((equipment) => {
          const selected = draft.availableEquipment.includes(equipment);
          return (
            <button
              key={equipment}
              type="button"
              aria-pressed={selected}
              onClick={() => dispatch({ type: "toggleEquipment", equipment })}
              className={`focus-ring flex h-12 items-center justify-between gap-2 rounded-[10px] border px-3.5 text-left text-[14px] font-medium transition-colors ${
                selected
                  ? "border-[var(--shell-accent)] bg-[var(--shell-accent-light)] text-[var(--shell-text-primary)]"
                  : "border-[var(--shell-border)] bg-card-surface text-[var(--shell-text-primary)] hover:border-[var(--shell-text-tertiary)]"
              }`}
            >
              {EQUIPMENT_LABELS[equipment]}
              <span
                aria-hidden
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-colors ${
                  selected
                    ? "bg-[var(--shell-accent)] text-white"
                    : "border border-[var(--shell-border)] text-transparent"
                }`}
              >
                <Check size={11} strokeWidth={3} />
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-pressed={bodyweightOnly}
        onClick={() => dispatch({ type: "bodyweightOnly" })}
        className={`focus-ring mt-4 w-full rounded-[10px] border border-dashed px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
          bodyweightOnly
            ? "border-[var(--shell-accent)] text-[var(--shell-accent)]"
            : "border-[var(--shell-border)] text-[var(--shell-text-secondary)] hover:border-[var(--shell-text-tertiary)] hover:text-[var(--shell-text-primary)]"
        }`}
      >
        Bodyweight only — no equipment at all
      </button>
    </div>
  );
}

export function LocationStep({
  draft,
  dispatch,
}: {
  draft: OnboardingDraft;
  dispatch: (action: DraftAction) => void;
}) {
  return (
    <div>
      <StepHeading
        title="Where do you usually train?"
        subtitle="Credo favors exercises that fit your space."
      />
      <div role="radiogroup" aria-label="Training location" className="space-y-3">
        {LOCATION_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={draft.trainingLocation === option.value}
            onSelect={() => dispatch({ type: "setLocation", location: option.value })}
          />
        ))}
      </div>
      {draft.trainingLocation === "commercial_gym" &&
        !draft.equipmentCustomized && (
          <p className="mt-4 text-[12px] text-[var(--shell-text-tertiary)]">
            We selected the full equipment list for you — step back to adjust it.
          </p>
        )}
    </div>
  );
}

export function SplitStep({
  draft,
  dispatch,
}: {
  draft: OnboardingDraft;
  dispatch: (action: DraftAction) => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div>
      <StepHeading
        title="How should your week be split?"
        subtitle="Most people do best letting the engine decide."
      />
      <div role="radiogroup" aria-label="Split preference" className="space-y-3">
        {SPLIT_OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            badge={option.recommended ? "Recommended" : undefined}
            selected={draft.preferredSplit === option.value}
            onSelect={() =>
              dispatch({ type: "patch", patch: { preferredSplit: option.value } })
            }
          />
        ))}
      </div>

      <div className="mt-5 rounded-[12px] border border-[var(--shell-border)] bg-[var(--shell-surface)]">
        <button
          type="button"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((open) => !open)}
          className="focus-ring flex w-full items-center justify-between rounded-[12px] px-4 py-3 text-[13px] font-semibold text-[var(--shell-text-secondary)] transition-colors hover:text-[var(--shell-text-primary)]"
        >
          Advanced
          <ChevronDown
            size={16}
            className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`}
          />
        </button>
        {advancedOpen && (
          <div className="space-y-5 border-t border-[var(--shell-border)] px-4 py-4">
            <Toggle
              id="ob-supersets"
              checked={draft.enableSupersets}
              onChange={(enableSupersets) =>
                dispatch({ type: "patch", patch: { enableSupersets } })
              }
              label="Enable supersets"
              description="Pair exercises to save time on shorter sessions."
            />
            <div>
              <FieldLabel>Exercise variety</FieldLabel>
              <SegmentedControl<VarietyLevel>
                ariaLabel="Exercise variety"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
                value={draft.varietyLevel}
                onChange={(varietyLevel) =>
                  dispatch({ type: "patch", patch: { varietyLevel } })
                }
              />
              <p className="mt-1.5 text-[12px] text-[var(--shell-text-secondary)]">
                Low keeps the same core lifts week to week; high rotates more.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
