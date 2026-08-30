"use client";

// Onboarding steps 9-10: optional benchmarks and the final "ready" screen.

import { Loader2 } from "lucide-react";
import type { WorkoutPlanDTO } from "@/lib/types";
import { CREDO_TEN } from "@/services/data/benchmarks";
import {
  BENCHMARK_SUBSET,
  type DraftAction,
  type OnboardingDraft,
} from "./draft";
import { FieldLabel, NumberInput, StepHeading } from "./fields";

const SUBSET_DEFINITIONS = BENCHMARK_SUBSET.map((name) => {
  const definition = CREDO_TEN.find((b) => b.name === name);
  return { name, unit: definition?.unit ?? "" };
});

export function BenchmarksStep({
  draft,
  dispatch,
  onSkip,
}: {
  draft: OnboardingDraft;
  dispatch: (action: DraftAction) => void;
  onSkip: () => void;
}) {
  const entering = draft.benchmarkMode === "enter";

  return (
    <div>
      <StepHeading
        title="Want to test your starting strength?"
        subtitle="The Credo Ten is our benchmark battery. Anything you already know seeds your baseline Strength Score and starting weights — skip it and we'll start with conservative estimates."
      />

      {!entering ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              dispatch({ type: "patch", patch: { benchmarkMode: "enter" } })
            }
            className="focus-ring h-11 w-full rounded-full bg-[var(--shell-accent)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)]"
          >
            Enter what you know
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="focus-ring h-11 w-full rounded-full border border-[var(--shell-border)] bg-card-surface text-[15px] font-semibold text-[var(--shell-text-primary)] transition-colors hover:border-[var(--shell-text-tertiary)]"
          >
            Skip for now
          </button>
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {SUBSET_DEFINITIONS.map(({ name, unit }) => (
              <div key={name}>
                <FieldLabel htmlFor={`ob-bm-${name}`}>{name}</FieldLabel>
                <NumberInput
                  id={`ob-bm-${name}`}
                  value={draft.benchmarkValues[name] ?? ""}
                  onChange={(value) =>
                    dispatch({ type: "setBenchmarkValue", name, value })
                  }
                  placeholder="—"
                  suffix={unit}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-[var(--shell-text-tertiary)]">
            Leave anything blank that you haven&apos;t tested — estimates fill the
            gaps.
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="focus-ring mt-3 rounded-sm text-[13px] font-medium text-[var(--shell-text-secondary)] underline-offset-2 transition-colors hover:text-[var(--shell-text-primary)] hover:underline"
          >
            Actually, skip for now
          </button>
        </div>
      )}
    </div>
  );
}

export type SubmitStatus = "submitting" | "success" | "error";

export function ReadyStep({
  status,
  plans,
  error,
  onRetry,
}: {
  status: SubmitStatus;
  plans: WorkoutPlanDTO[];
  error: string | null;
  onRetry: () => void;
}) {
  if (status === "submitting") {
    return (
      <div className="flex flex-col items-center py-14 text-center">
        <Loader2
          size={28}
          className="animate-spin text-[var(--shell-accent)]"
          aria-hidden
        />
        <h1 className="mt-5 font-display text-[24px] text-[var(--shell-text-primary)]">
          Building your first week…
        </h1>
        <p className="mt-2 max-w-[32ch] text-sm text-[var(--shell-text-secondary)]">
          Credo is matching exercises to your goal, schedule, and equipment.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="py-6 text-center">
        <h1 className="font-display text-[24px] text-[var(--shell-text-primary)]">
          We hit a snag
        </h1>
        <p
          role="alert"
          className="mx-auto mt-4 max-w-[40ch] rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
        >
          {error ?? "Something went wrong building your plan."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring mt-6 h-11 w-full rounded-full bg-[var(--shell-accent)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)]"
        >
          Try again
        </button>
      </div>
    );
  }

  const sorted = [...plans].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[2.5px] text-[var(--shell-accent)]">
          Week 1
        </p>
        <h1 className="mt-3 font-display text-[28px] leading-tight text-[var(--shell-text-primary)]">
          Your first workout is ready.
        </h1>
        <p className="mt-2 text-sm text-[var(--shell-text-secondary)]">
          Here&apos;s how your week lays out.
        </p>
      </div>

      <div className="mt-6 space-y-2.5">
        {sorted.map((plan) => (
          <div
            key={plan.id}
            className="flex items-center gap-3.5 rounded-[12px] border border-[var(--shell-border)] bg-card-surface p-3.5"
          >
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] bg-[var(--shell-accent-light)]">
              <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--shell-accent)]">
                Day
              </span>
              <span className="text-[15px] font-bold leading-none text-[var(--shell-accent)]">
                {plan.dayNumber}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[var(--shell-text-primary)]">
                {plan.focus}
              </p>
              <p className="text-[12px] text-[var(--shell-text-secondary)]">
                {plan.exercises.length}{" "}
                {plan.exercises.length === 1 ? "exercise" : "exercises"} · ~
                {plan.estimatedDuration} min
              </p>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/app/dashboard"
        className="focus-ring mt-7 flex h-11 w-full items-center justify-center rounded-full bg-[var(--shell-accent)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)]"
      >
        Go to my dashboard
      </a>
    </div>
  );
}
