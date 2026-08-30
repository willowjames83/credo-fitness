"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { WorkoutPlanDTO } from "@/lib/types";
import {
  buildRequest,
  draftReducer,
  initialDraft,
  TOTAL_STEPS,
  validateStep,
  type DraftAction,
} from "./draft";
import { ErrorNote } from "./fields";
import { BasicInfoStep, ExperienceStep, GoalStep, WelcomeStep } from "./steps-profile";
import {
  EquipmentStep,
  LocationStep,
  ScheduleStep,
  SplitStep,
} from "./steps-training";
import { BenchmarksStep, ReadyStep } from "./steps-final";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; plans: WorkoutPlanDTO[] }
  | { status: "error"; message: string };

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [draft, rawDispatch] = useReducer(draftReducer, initialDraft);
  const [stepError, setStepError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });
  const cardRef = useRef<HTMLDivElement>(null);

  // Prefill the greeting from the signed-in user.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        const name: unknown = json?.data?.name ?? json?.data?.user?.name;
        if (typeof name === "string" && name.trim() !== "") {
          setFirstName(name.trim().split(/\s+/)[0]);
        }
      })
      .catch(() => {
        // Greeting is a nicety; ignore failures.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dispatch = useCallback((action: DraftAction) => {
    setStepError(null);
    rawDispatch(action);
  }, []);

  const goTo = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setStepError(null);
    setStep(next);
    cardRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, []);

  function handleContinue() {
    const error = validateStep(step, draft);
    if (error) {
      setStepError(error);
      return;
    }
    goTo(step + 1, 1);
    if (step === 9) void submitOnboarding();
  }

  function handleBack() {
    if (step <= 1) return;
    if (step === 10) setSubmit({ status: "idle" });
    goTo(step - 1, -1);
  }

  function handleSkipBenchmarks() {
    dispatch({ type: "patch", patch: { benchmarkMode: "skip" } });
    goTo(10, 1);
    void submitOnboarding({ ...draft, benchmarkMode: "skip" });
  }

  const submitOnboarding = useCallback(async (finalDraft = draft) => {
    setSubmit({ status: "submitting" });
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequest(finalDraft)),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.error) {
        setSubmit({
          status: "error",
          message:
            typeof json?.error === "string"
              ? json.error
              : "Something went wrong building your plan.",
        });
        return;
      }
      const plans: WorkoutPlanDTO[] = Array.isArray(json?.data?.plans)
        ? json.data.plans
        : [];
      setSubmit({ status: "success", plans });
    } catch {
      setSubmit({ status: "error", message: "Network error. Please try again." });
    }
  }, [draft]);

  const showFooterContinue =
    step < 9 || (step === 9 && draft.benchmarkMode === "enter");
  const showBack =
    (step > 1 && step < 10) || (step === 10 && submit.status === "error");

  return (
    <div className="flex min-h-dvh flex-col items-center bg-[var(--shell-surface)] px-5 py-8 font-marketing sm:py-12">
      <div ref={cardRef} className="w-full max-w-lg scroll-mt-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            {showBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-[var(--shell-text-secondary)] transition-colors hover:text-[var(--shell-text-primary)]"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : (
              <span aria-hidden />
            )}
            <span className="text-[12px] font-medium tabular-nums text-[var(--shell-text-tertiary)]">
              {step} of {TOTAL_STEPS}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step}
            aria-label="Onboarding progress"
            className="h-1 w-full overflow-hidden rounded-full bg-[var(--shell-surface-elevated)]"
          >
            <div
              className="h-full rounded-full bg-[var(--shell-accent)] transition-[width] duration-300 ease-out"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-[14px] border border-[var(--shell-border)] bg-card-surface p-6 shadow-[0_1px_2px_rgba(26,26,30,0.04)] sm:p-8">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
                center: { opacity: 1, x: 0 },
                exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {step === 1 && <WelcomeStep />}
              {step === 2 && (
                <BasicInfoStep
                  draft={draft}
                  dispatch={dispatch}
                  firstName={firstName}
                />
              )}
              {step === 3 && <ExperienceStep draft={draft} dispatch={dispatch} />}
              {step === 4 && <GoalStep draft={draft} dispatch={dispatch} />}
              {step === 5 && <ScheduleStep draft={draft} dispatch={dispatch} />}
              {step === 6 && <EquipmentStep draft={draft} dispatch={dispatch} />}
              {step === 7 && <LocationStep draft={draft} dispatch={dispatch} />}
              {step === 8 && <SplitStep draft={draft} dispatch={dispatch} />}
              {step === 9 && (
                <BenchmarksStep
                  draft={draft}
                  dispatch={dispatch}
                  onSkip={handleSkipBenchmarks}
                />
              )}
              {step === 10 &&
                (submit.status === "success" ? (
                  <ReadyStep
                    status="success"
                    plans={submit.plans}
                    error={null}
                    onRetry={() => void submitOnboarding()}
                  />
                ) : submit.status === "error" ? (
                  <ReadyStep
                    status="error"
                    plans={[]}
                    error={submit.message}
                    onRetry={() => void submitOnboarding()}
                  />
                ) : (
                  <ReadyStep
                    status="submitting"
                    plans={[]}
                    error={null}
                    onRetry={() => void submitOnboarding()}
                  />
                ))}

              {stepError && <ErrorNote message={stepError} />}

              {showFooterContinue && (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="focus-ring mt-6 h-11 w-full rounded-full bg-[var(--shell-accent)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)]"
                >
                  {step === 9 ? "Finish" : "Continue"}
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
