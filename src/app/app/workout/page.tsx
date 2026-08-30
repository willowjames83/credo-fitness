"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Info,
  RefreshCw,
  Repeat,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { adjustAfterSet } from "@/services/ai";
import type {
  CompleteWorkoutRequest,
  CompleteWorkoutResponse,
  PlannedExerciseDTO,
  PlannedExerciseSpec,
  SetAdjustment,
  WorkoutPlanDTO,
} from "@/lib/types";
import { getJSON, sendJSON, errorMessage } from "@/components/workout/api";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { RestTimer } from "@/components/workout/rest-timer";
import { RpeSheet } from "@/components/workout/rpe-sheet";
import { WorkoutSummary } from "@/components/workout/workout-summary";
import type { SetRowState } from "@/components/workout/set-row";
import { nowMs } from "@/components/workout/time";
import { SectionHeader } from "@/components/shared/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

// ── localStorage persistence ────────────────────────────────────

interface StoredProgress {
  v: 1;
  activeIndex: number;
  sets: Record<string, SetRowState[]>;
  rpe: Record<string, number>;
}

function storageKey(planId: string): string {
  return `credo-workout-${planId}`;
}

function readProgress(planId: string): StoredProgress | null {
  try {
    const raw = localStorage.getItem(storageKey(planId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredProgress;
    if (parsed?.v !== 1 || typeof parsed.sets !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeProgress(planId: string, progress: StoredProgress): void {
  try {
    localStorage.setItem(storageKey(planId), JSON.stringify(progress));
  } catch {
    // storage unavailable — in-memory state still works
  }
}

function clearProgress(planId: string): void {
  try {
    localStorage.removeItem(storageKey(planId));
  } catch {
    // ignore
  }
}

// ── helpers ─────────────────────────────────────────────────────

function mainExercisesOf(plan: WorkoutPlanDTO): PlannedExerciseDTO[] {
  return plan.exercises
    .filter((e) => !e.isWarmup)
    .slice()
    .sort((a, b) => a.order - b.order);
}

function initSets(plan: WorkoutPlanDTO): Record<string, SetRowState[]> {
  const out: Record<string, SetRowState[]> = {};
  for (const ex of mainExercisesOf(plan)) {
    out[ex.id] = Array.from({ length: ex.targetSets }, () => ({
      weight: ex.recommendedWeight > 0 ? String(ex.recommendedWeight) : "0",
      reps: String(ex.targetRepMax),
      completed: false,
    }));
  }
  return out;
}

function toSpec(ex: PlannedExerciseDTO): PlannedExerciseSpec {
  return {
    exerciseId: ex.exerciseId,
    order: ex.order,
    targetSets: ex.targetSets,
    targetReps: [ex.targetRepMin, ex.targetRepMax],
    recommendedWeight: ex.recommendedWeight,
    restPeriod: ex.restPeriod,
  };
}

function toNum(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(r).padStart(2, "0")}`;
}

/** Ticks once a second; elapsed is always derived from the timestamp. */
function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [, tick] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const seconds = Math.floor((nowMs() - new Date(startedAt).getTime()) / 1000);
  return (
    <span className="font-mono text-[17px] font-medium text-credo tabular-nums">
      {formatElapsed(seconds)}
    </span>
  );
}

// ── page ────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [plan, setPlan] = useState<WorkoutPlanDTO | null>(null);

  const [sets, setSets] = useState<Record<string, SetRowState[]>>({});
  const [rpe, setRpe] = useState<Record<string, number>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [adjustment, setAdjustment] = useState<SetAdjustment | null>(null);
  const [rpePendingFor, setRpePendingFor] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [result, setResult] = useState<CompleteWorkoutResponse | null>(null);

  const [warmupOpen, setWarmupOpen] = useState(false);
  const [infoOpenFor, setInfoOpenFor] = useState<string | null>(null);
  const [swapOpenFor, setSwapOpenFor] = useState<string | null>(null);
  const [busy, setBusy] = useState<"start" | "complete" | "swap" | "regen" | null>(null);

  const applyLoadedPlan = useCallback((p: WorkoutPlanDTO | null) => {
    setPlan(p);
    if (!p) return;
    const base = initSets(p);
    let index = 0;
    let storedRpe: Record<string, number> = {};
    if (p.status === "in_progress") {
      const stored = readProgress(p.id);
      if (stored) {
        for (const key of Object.keys(base)) {
          const saved = stored.sets[key];
          if (Array.isArray(saved) && saved.length === base[key].length) {
            base[key] = saved;
          }
        }
        const count = mainExercisesOf(p).length;
        index = Math.min(Math.max(stored.activeIndex, 0), Math.max(count - 1, 0));
        storedRpe = stored.rpe ?? {};
      }
    }
    setSets(base);
    setRpe(storedRpe);
    setActiveIndex(index);
    setAdjustment(null);
    setRestEndsAt(null);
    setRpePendingFor(null);
  }, []);

  // Only sets state in async callbacks, so it is safe to call from an effect.
  const fetchToday = useCallback(() => {
    getJSON<{ plan: WorkoutPlanDTO | null }>("/api/workouts/today")
      .then(({ plan: p }) => applyLoadedPlan(p))
      .catch((err) => setLoadError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [applyLoadedPlan]);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  function retryLoad() {
    setLoading(true);
    setLoadError(null);
    fetchToday();
  }

  // Mirror in-progress inputs to localStorage.
  useEffect(() => {
    if (!plan || plan.status !== "in_progress" || result) return;
    writeProgress(plan.id, { v: 1, activeIndex, sets, rpe });
  }, [plan, sets, rpe, activeIndex, result]);

  const mainExercises = plan ? mainExercisesOf(plan) : [];
  const activeExercise: PlannedExerciseDTO | undefined = mainExercises[activeIndex];

  // ── actions ───────────────────────────────────────────────────

  function startWorkout() {
    if (!plan) return;
    setBusy("start");
    setActionError(null);
    sendJSON<{ plan: WorkoutPlanDTO }>(`/api/workouts/${plan.id}/start`, "POST")
      .then(({ plan: p }) => {
        setPlan(p);
        setSets(initSets(p));
        setRpe({});
        setActiveIndex(0);
        setAdjustment(null);
        setRestEndsAt(null);
      })
      .catch((err) => setActionError(errorMessage(err)))
      .finally(() => setBusy(null));
  }

  function regenerate() {
    setBusy("regen");
    setActionError(null);
    sendJSON<{ plan: WorkoutPlanDTO }>("/api/workouts/generate", "POST", { force: true })
      .then(({ plan: p }) => applyLoadedPlan(p))
      .catch((err) => setActionError(errorMessage(err)))
      .finally(() => setBusy(null));
  }

  function swapExercise(plannedExerciseId: string, newExerciseId: string) {
    if (!plan) return;
    setBusy("swap");
    setActionError(null);
    sendJSON<{ plan: WorkoutPlanDTO }>(`/api/workouts/${plan.id}/customize`, "PUT", {
      swaps: [{ plannedExerciseId, newExerciseId }],
    })
      .then(({ plan: p }) => {
        applyLoadedPlan(p);
        setSwapOpenFor(null);
      })
      .catch((err) => setActionError(errorMessage(err)))
      .finally(() => setBusy(null));
  }

  function updateSet(setIndex: number, patch: Partial<SetRowState>) {
    if (!activeExercise) return;
    const id = activeExercise.id;
    setSets((prev) => {
      const rows = prev[id]?.slice() ?? [];
      if (!rows[setIndex]) return prev;
      rows[setIndex] = { ...rows[setIndex], ...patch };
      return { ...prev, [id]: rows };
    });
  }

  function completeSet(setIndex: number) {
    if (!activeExercise) return;
    const id = activeExercise.id;
    const rows = (sets[id] ?? []).slice();
    const row = rows[setIndex];
    if (!row) return;
    rows[setIndex] = { ...row, completed: true };
    setSets((prev) => ({ ...prev, [id]: rows }));

    const completedInputs = rows
      .map((r, idx) => ({
        setNumber: idx + 1,
        weight: toNum(r.weight),
        reps: toNum(r.reps),
        completed: r.completed,
      }))
      .filter((r) => r.completed)
      .map(({ setNumber, weight, reps }) => ({ setNumber, weight, reps }));
    const justCompleted = {
      setNumber: setIndex + 1,
      weight: toNum(row.weight),
      reps: toNum(row.reps),
    };
    const adj = adjustAfterSet({
      plannedExercise: toSpec(activeExercise),
      completedSets: completedInputs,
      justCompleted,
    });
    setAdjustment(adj.action !== "none" ? adj : null);

    const allDone = rows.every((r) => r.completed);
    if (allDone) {
      setRestEndsAt(null);
      setRpePendingFor(id);
    } else {
      setRestEndsAt(nowMs() + activeExercise.restPeriod * 1000);
    }
  }

  function uncompleteSet(setIndex: number) {
    updateSet(setIndex, { completed: false });
  }

  function applyAdjustment() {
    if (!activeExercise || !adjustment || adjustment.nextSetWeight == null) return;
    const rows = sets[activeExercise.id] ?? [];
    const nextIdx = rows.findIndex((r) => !r.completed);
    if (nextIdx >= 0) {
      updateSet(nextIdx, { weight: String(adjustment.nextSetWeight) });
    }
    setAdjustment(null);
  }

  function advanceExercise() {
    setRpePendingFor(null);
    setAdjustment(null);
    setRestEndsAt(null);
    if (activeIndex < mainExercises.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      setReviewOpen(true);
    }
  }

  function handleRpe(rating: number | null) {
    if (rpePendingFor && rating != null) {
      setRpe((prev) => ({ ...prev, [rpePendingFor]: rating }));
    }
    advanceExercise();
  }

  function submitWorkout() {
    if (!plan) return;
    setBusy("complete");
    setActionError(null);
    const startedMs = plan.startedAt ? new Date(plan.startedAt).getTime() : nowMs();
    const body: CompleteWorkoutRequest = {
      durationSeconds: Math.max(0, Math.floor((nowMs() - startedMs) / 1000)),
      exercises: mainExercises
        .map((ex) => {
          const rows = sets[ex.id] ?? [];
          const done = rows
            .map((r, idx) => ({
              setNumber: idx + 1,
              weight: toNum(r.weight),
              reps: Math.round(toNum(r.reps)),
              completed: r.completed,
            }))
            .filter((r) => r.completed && r.reps > 0)
            .map(({ setNumber, weight, reps }) => ({ setNumber, weight, reps }));
          return {
            exerciseId: ex.exerciseId,
            exertionRating: rpe[ex.id],
            sets: done,
          };
        })
        .filter((ex) => ex.sets.length > 0),
    };
    sendJSON<CompleteWorkoutResponse>(`/api/workouts/${plan.id}/complete`, "POST", body)
      .then((res) => {
        clearProgress(plan.id);
        setReviewOpen(false);
        setResult(res);
      })
      .catch((err) => setActionError(errorMessage(err)))
      .finally(() => setBusy(null));
  }

  // ── render ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-2">
        <Skeleton className="h-16 rounded-[14px]" />
        <Skeleton className="h-40 rounded-[14px]" />
        <Skeleton className="h-24 rounded-[14px]" />
        <Skeleton className="h-24 rounded-[14px]" />
        <Skeleton className="h-12 rounded-[14px]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between gap-3 rounded-[14px] border border-danger/25 bg-danger/5 px-4 py-3">
          <p className="text-sm text-danger">{loadError}</p>
          <button
            type="button"
            onClick={retryLoad}
            className="focus-ring shrink-0 rounded-[8px] border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/10"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (result && plan) {
    return <WorkoutSummary focus={plan.focus} result={result} planId={plan.id} />;
  }

  if (!plan) {
    return (
      <div className="px-5 pt-6">
        <EmptyState
          icon={ClipboardList}
          title="No training plan yet"
          description="Answer a few questions about your goals and equipment and we'll build today's workout."
          action={
            <Link
              href="/onboarding"
              className="focus-ring mx-auto flex h-12 w-[200px] items-center justify-center rounded-[12px] bg-credo text-[15px] font-semibold text-white transition-colors hover:bg-credo/90"
            >
              Set up my plan
            </Link>
          }
        />
      </div>
    );
  }

  if (plan.status === "completed" || plan.status === "skipped") {
    return (
      <div className="px-5 pt-6 text-center">
        <CheckCircle2 size={28} className="mx-auto text-success" />
        <p className="mt-2 text-base font-semibold text-text-primary">
          {plan.status === "completed" ? "Today's workout is done" : "Today's workout was skipped"}
        </p>
        <p className="mt-1 text-[13px] text-text-secondary">{plan.focus}</p>
        <div className="mx-auto mt-4 flex max-w-[280px] flex-col gap-2">
          <Link
            href="/app/history"
            className="flex h-11 items-center justify-center rounded-[10px] bg-credo text-sm font-semibold text-white transition-colors hover:bg-credo/90"
          >
            View history
          </Link>
          <Link
            href="/app/dashboard"
            className="flex h-11 items-center justify-center rounded-[10px] border border-app bg-card-surface text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const actionErrorBanner = actionError && (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-danger/25 bg-danger/5 px-4 py-2.5">
      <p className="text-[13px] text-danger">{actionError}</p>
      <button
        type="button"
        aria-label="Dismiss error"
        onClick={() => setActionError(null)}
        className="focus-ring rounded-sm text-danger"
      >
        <X size={14} />
      </button>
    </div>
  );

  // ── planned: overview ─────────────────────────────────────────

  if (plan.status === "planned") {
    return (
      <div className="flex flex-1 flex-col gap-3 px-5 pb-6">
        <div className="flex items-start justify-between gap-3 pt-1">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{plan.focus}</h1>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              Week {plan.weekNumber} · Day {plan.dayNumber} of {plan.totalDays} ·{" "}
              {mainExercises.length} exercises · ~{plan.estimatedDuration} min
            </p>
          </div>
          <button
            type="button"
            onClick={regenerate}
            disabled={busy !== null}
            className="focus-ring flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] border border-app bg-card-surface px-3 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface disabled:opacity-50"
          >
            <RefreshCw size={12} className={busy === "regen" ? "animate-spin" : ""} />
            Regenerate
          </button>
        </div>

        {actionErrorBanner}

        {plan.warmup.length > 0 && (
          <div className="rounded-[14px] border border-app bg-card-surface">
            <button
              type="button"
              onClick={() => setWarmupOpen((v) => !v)}
              aria-expanded={warmupOpen}
              className="focus-ring flex min-h-[44px] w-full items-center justify-between rounded-[14px] px-4 py-3"
            >
              <span className="text-sm font-semibold text-text-primary">
                Warmup{" "}
                <span className="font-normal text-text-secondary">
                  · {plan.warmup.length} moves
                </span>
              </span>
              <ChevronDown
                size={16}
                className={`text-text-tertiary transition-transform ${warmupOpen ? "rotate-180" : ""}`}
              />
            </button>
            {warmupOpen && (
              <div className="border-t border-app px-4 py-2">
                {plan.warmup.map((move, i) => (
                  <div
                    key={`${move.exerciseId}-${i}`}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-[13px] text-text-primary">{move.name}</span>
                    <span className="font-mono text-xs text-text-secondary">
                      {move.prescription}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {mainExercises.map((ex, i) => (
            <div key={ex.id} className="rounded-[14px] border border-app bg-card-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    <span className="mr-1.5 font-mono text-xs text-text-tertiary">
                      {i + 1}
                    </span>
                    {ex.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[13px] text-text-secondary">
                    {ex.targetSets} × {ex.targetRepMin}-{ex.targetRepMax}
                    {ex.recommendedWeight > 0 ? ` @ ${ex.recommendedWeight} lb` : ""}
                  </p>
                  {ex.rationale && (
                    <p className="mt-1 text-xs text-teal">{ex.rationale}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {ex.formCues.length > 0 && (
                    <button
                      type="button"
                      aria-label={`Form cues for ${ex.name}`}
                      aria-expanded={infoOpenFor === ex.id}
                      onClick={() =>
                        setInfoOpenFor((v) => (v === ex.id ? null : ex.id))
                      }
                      className={`focus-ring flex h-9 w-9 items-center justify-center rounded-[8px] border transition-colors ${
                        infoOpenFor === ex.id
                          ? "border-credo bg-credo-light text-credo"
                          : "border-app bg-card-surface text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      <Info size={14} />
                    </button>
                  )}
                  {ex.alternatives.length > 0 && (
                    <button
                      type="button"
                      aria-label={`Swap ${ex.name}`}
                      aria-expanded={swapOpenFor === ex.id}
                      onClick={() =>
                        setSwapOpenFor((v) => (v === ex.id ? null : ex.id))
                      }
                      className={`focus-ring flex h-9 w-9 items-center justify-center rounded-[8px] border transition-colors ${
                        swapOpenFor === ex.id
                          ? "border-credo bg-credo-light text-credo"
                          : "border-app bg-card-surface text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      <Repeat size={14} />
                    </button>
                  )}
                </div>
              </div>

              {infoOpenFor === ex.id && (
                <ul className="mt-3 flex flex-col gap-1 rounded-[10px] bg-surface p-3">
                  {ex.formCues.map((cue, ci) => (
                    <li key={ci} className="flex gap-2 text-xs text-text-secondary">
                      <span className="text-teal">·</span>
                      {cue}
                    </li>
                  ))}
                </ul>
              )}

              {swapOpenFor === ex.id && (
                <div className="mt-3 flex flex-col gap-1.5 rounded-[10px] bg-surface p-3">
                  <p className="text-[11px] font-semibold text-text-tertiary uppercase">
                    Swap for
                  </p>
                  {ex.alternatives.map((alt) => (
                    <button
                      key={alt.exerciseId}
                      type="button"
                      disabled={busy !== null}
                      onClick={() => swapExercise(ex.id, alt.exerciseId)}
                      className="focus-ring flex min-h-[44px] items-center justify-between rounded-[8px] border border-app bg-card-surface px-3 text-left text-[13px] font-medium text-text-primary transition-colors hover:border-credo disabled:opacity-50"
                    >
                      {alt.name}
                      <Repeat size={12} className="text-text-tertiary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={startWorkout}
          disabled={busy !== null}
          className="focus-ring mt-1 flex h-13 min-h-[52px] items-center justify-center rounded-[12px] bg-credo text-base font-semibold text-white transition-colors hover:bg-credo/90 disabled:opacity-60"
        >
          {busy === "start" ? "Starting…" : "Start workout"}
        </button>
      </div>
    );
  }

  // ── in_progress: player ───────────────────────────────────────

  const doneCount = mainExercises.filter((ex) =>
    (sets[ex.id] ?? []).every((r) => r.completed),
  ).length;
  const skippedTotal = mainExercises.reduce((acc, ex) => {
    const rows = sets[ex.id] ?? [];
    return acc + rows.filter((r) => !r.completed || Math.round(toNum(r.reps)) <= 0).length;
  }, 0);

  return (
    <div className="flex flex-1 flex-col gap-3 px-5 pb-6">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{plan.focus}</h1>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            Exercise {Math.min(activeIndex + 1, mainExercises.length)} of{" "}
            {mainExercises.length}
          </p>
        </div>
        {plan.startedAt && <ElapsedTimer startedAt={plan.startedAt} />}
      </div>

      {/* progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
        <motion.div
          className="h-full rounded-full bg-credo"
          initial={false}
          animate={{
            width: `${mainExercises.length > 0 ? (doneCount / mainExercises.length) * 100 : 0}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {actionErrorBanner}

      {restEndsAt != null && (
        <RestTimer
          endsAt={restEndsAt}
          onSkip={() => setRestEndsAt(null)}
          onExtend={(s) => setRestEndsAt((v) => (v != null ? v + s * 1000 : v))}
        />
      )}

      {activeExercise && (
        <ExerciseCard
          exercise={activeExercise}
          sets={sets[activeExercise.id] ?? []}
          adjustment={adjustment}
          onWeightChange={(i, v) => updateSet(i, { weight: v })}
          onRepsChange={(i, v) => updateSet(i, { reps: v })}
          onCompleteSet={completeSet}
          onUncompleteSet={uncompleteSet}
          onApplyAdjustment={applyAdjustment}
          onDismissAdjustment={() => setAdjustment(null)}
        />
      )}

      {activeExercise && (sets[activeExercise.id] ?? []).every((r) => r.completed) && (
        <button
          type="button"
          onClick={advanceExercise}
          className="focus-ring flex h-11 items-center justify-center rounded-[10px] border border-success/30 bg-success-light text-sm font-semibold text-success transition-colors hover:bg-success/15"
        >
          {activeIndex < mainExercises.length - 1 ? "Next exercise" : "Review and finish"}
        </button>
      )}

      {/* queue */}
      {mainExercises.length > 1 && (
        <div className="mt-1 flex flex-col gap-1.5">
          <SectionHeader>Session</SectionHeader>
          {mainExercises.map((ex, i) => {
            const rows = sets[ex.id] ?? [];
            const complete = rows.length > 0 && rows.every((r) => r.completed);
            const isActive = i === activeIndex;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  setActiveIndex(i);
                  setAdjustment(null);
                  setRpePendingFor(null);
                }}
                className={`focus-ring flex min-h-[44px] items-center justify-between rounded-[12px] border px-3.5 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-credo bg-credo-light"
                    : "border-app bg-card-surface hover:bg-surface"
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    complete ? "text-text-tertiary line-through" : "text-text-primary"
                  }`}
                >
                  {ex.name}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-tertiary">
                    {rows.filter((r) => r.completed).length}/{ex.targetSets}
                  </span>
                  {complete && <Check size={14} className="text-success" />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setReviewOpen(true)}
        className="focus-ring mt-2 flex h-12 items-center justify-center rounded-[12px] border border-app bg-card-surface text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
      >
        Finish workout
      </button>

      {rpePendingFor && activeExercise && (
        <RpeSheet
          exerciseName={activeExercise.name}
          onSelect={(rating) => handleRpe(rating)}
          onSkip={() => handleRpe(null)}
        />
      )}

      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setReviewOpen(false)}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-label="Review workout"
            className="relative flex max-h-[85dvh] w-full max-w-[640px] flex-col rounded-t-[20px] border border-app bg-card-surface lg:max-w-[440px] lg:rounded-[20px]"
          >
            <div className="border-b border-app px-5 py-4">
              <p className="text-base font-semibold text-text-primary">Finish workout?</p>
              <p className="mt-0.5 text-[13px] text-text-secondary">
                Only completed sets with reps count toward your scores.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {mainExercises.map((ex) => {
                const rows = sets[ex.id] ?? [];
                const counted = rows.filter(
                  (r) => r.completed && Math.round(toNum(r.reps)) > 0,
                ).length;
                const skipped = rows.length - counted;
                return (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between border-b border-app py-3 last:border-b-0"
                  >
                    <span className="text-sm text-text-primary">{ex.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-secondary">
                        {counted}/{rows.length} sets
                      </span>
                      {skipped > 0 && (
                        <span className="flex items-center gap-1 rounded-[6px] bg-warning-light px-1.5 py-0.5 text-[11px] font-medium text-warning">
                          <AlertTriangle size={10} />
                          {skipped} skipped
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-2 border-t border-app p-5 pb-[calc(20px+env(safe-area-inset-bottom))] lg:pb-5">
              {skippedTotal > 0 && (
                <p className="text-xs text-warning">
                  {skippedTotal} set{skippedTotal === 1 ? "" : "s"} will be logged as
                  skipped.
                </p>
              )}
              <button
                type="button"
                onClick={submitWorkout}
                disabled={busy !== null}
                className="focus-ring flex h-12 items-center justify-center rounded-[12px] bg-credo text-[15px] font-semibold text-white transition-colors hover:bg-credo/90 disabled:opacity-60"
              >
                {busy === "complete" ? "Saving…" : "Complete workout"}
              </button>
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="focus-ring flex h-11 items-center justify-center rounded-[10px] text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
              >
                Keep training
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
