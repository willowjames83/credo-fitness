"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, RefreshCw } from "lucide-react";
import { CredoScoreRing } from "@/components/shared/credo-score-ring";
import { PillarCard } from "@/components/shared/pillar-card";
import { SectionHeader } from "@/components/shared/section-header";
import { RecoveryStrip } from "@/components/workout/recovery-strip";
import { getJSON, errorMessage } from "@/components/workout/api";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  MuscleRecoveryState,
  PillarScoresDTO,
  WorkoutHistoryItemDTO,
  WorkoutPlanDTO,
} from "@/lib/types";
import type { PillarKey } from "@/lib/constants";

const PILLAR_KEYS: PillarKey[] = ["strength", "stability", "cardio", "nutrition"];

function deltaLine(delta: number): string {
  if (delta > 0) return `+${delta} vs last week`;
  if (delta < 0) return `${delta} vs last week`;
  return "Even with last week";
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-danger/25 bg-danger-light px-4 py-3">
      <p className="text-sm text-danger">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="focus-ring shrink-0 rounded-[8px] border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/10"
      >
        Retry
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const [scores, setScores] = useState<PillarScoresDTO | null>(null);
  const [plan, setPlan] = useState<WorkoutPlanDTO | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [recovery, setRecovery] = useState<MuscleRecoveryState[] | null>(null);
  const [doneToday, setDoneToday] = useState<WorkoutHistoryItemDTO | null>(null);
  const [scoresError, setScoresError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  // Fetchers only set state in async callbacks, so they are safe to call
  // from the mount effect; retry handlers reset state before re-fetching.
  const fetchScores = useCallback(() => {
    getJSON<PillarScoresDTO>("/api/scores/current")
      .then(setScores)
      .catch((err) => setScoresError(errorMessage(err)));
  }, []);

  const fetchPlan = useCallback(() => {
    getJSON<{ plan: WorkoutPlanDTO | null }>("/api/workouts/today")
      .then(({ plan: p }) => {
        setPlan(p);
        setPlanLoaded(true);
        if (p?.status === "completed") {
          // The plan DTO carries no completed volume — pull today's entry
          // from history for the "Done today" card. Best-effort.
          getJSON<{ workouts: WorkoutHistoryItemDTO[]; total: number }>(
            "/api/workouts/history?limit=1&offset=0",
          )
            .then(({ workouts }) => setDoneToday(workouts[0] ?? null))
            .catch(() => setDoneToday(null));
        }
      })
      .catch((err) => setPlanError(errorMessage(err)));
  }, []);

  const fetchRecovery = useCallback(() => {
    getJSON<{ states: MuscleRecoveryState[] }>("/api/recovery")
      .then(({ states }) => setRecovery(states))
      .catch((err) => setRecoveryError(errorMessage(err)));
  }, []);

  useEffect(() => {
    fetchScores();
    fetchPlan();
    fetchRecovery();
  }, [fetchScores, fetchPlan, fetchRecovery]);

  function retryScores() {
    setScoresError(null);
    setScores(null);
    fetchScores();
  }

  function retryPlan() {
    setPlanError(null);
    setPlanLoaded(false);
    setDoneToday(null);
    fetchPlan();
  }

  function retryRecovery() {
    setRecoveryError(null);
    setRecovery(null);
    fetchRecovery();
  }

  const weakest =
    scores &&
    PILLAR_KEYS.reduce((min, key) =>
      scores[key].score < scores[min].score ? key : min,
    );

  return (
    <div className="flex-1 px-5 pb-5">
      {/* Credo score ring */}
      <div className="pt-2 pb-4 text-center">
        {scoresError ? (
          <div className="pt-4">
            <ErrorCard message={scoresError} onRetry={retryScores} />
          </div>
        ) : !scores ? (
          <div className="flex flex-col items-center gap-3 pt-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-40 w-40 !rounded-full" />
            <Skeleton className="h-3 w-28" />
          </div>
        ) : (
          <>
            <p className="mb-4 text-[11px] font-medium tracking-[1.5px] text-text-tertiary uppercase">
              Week {scores.weekNumber}
            </p>
            <div className="inline-block">
              <CredoScoreRing score={scores.credo.score} />
            </div>
            <p
              className={`mt-2 text-xs font-medium ${
                scores.credo.delta > 0
                  ? "text-success"
                  : scores.credo.delta < 0
                    ? "text-danger"
                    : "text-text-tertiary"
              }`}
            >
              {deltaLine(scores.credo.delta)}
            </p>
          </>
        )}
      </div>

      {/* Pillars */}
      <div className="mb-2.5">
        <SectionHeader>This week</SectionHeader>
      </div>
      {scoresError ? null : !scores ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-[74px]" />
          <Skeleton className="h-[74px]" />
          <Skeleton className="h-[74px]" />
          <Skeleton className="h-[74px]" />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {PILLAR_KEYS.map((key) => (
            <PillarCard
              key={key}
              pillar={key}
              score={scores[key].score}
              metrics={[deltaLine(scores[key].delta)]}
              isWeakest={key === weakest}
            />
          ))}
        </div>
      )}

      {/* Today's workout */}
      <div className="mt-5 mb-2.5">
        <SectionHeader>Today&apos;s workout</SectionHeader>
      </div>
      {planError ? (
        <ErrorCard message={planError} onRetry={retryPlan} />
      ) : !planLoaded ? (
        <Skeleton className="h-[132px]" />
      ) : plan === null ? (
        <EmptyState
          icon={ClipboardList}
          title="No training plan yet"
          description="Tell us your goals and equipment and we'll build your first week."
          action={
            <Link
              href="/onboarding"
              className="focus-ring flex h-11 items-center justify-center rounded-[10px] bg-credo px-4 text-[15px] font-semibold text-white transition-colors hover:bg-credo/90"
            >
              Set up my plan
            </Link>
          }
        />
      ) : plan.status === "completed" ? (
        <div className="rounded-[14px] border border-success/25 bg-success-light p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-success" />
            <p className="text-sm font-semibold text-text-primary">Done today</p>
          </div>
          <p className="mt-1 text-[13px] text-text-secondary">
            {plan.focus}
            {doneToday
              ? ` · ${Math.round(doneToday.totalVolume).toLocaleString()} lb moved · ${doneToday.setCount} sets`
              : ""}
          </p>
          <Link
            href="/app/history"
            className="focus-ring mt-2 inline-block rounded-sm text-[13px] font-medium text-success hover:underline"
          >
            View in history
          </Link>
        </div>
      ) : (
        <div className="rounded-[14px] border border-app bg-card-surface p-4">
          <p className="text-sm font-medium text-text-primary">{plan.focus}</p>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            {plan.exercises.filter((e) => !e.isWarmup).length} exercises · ~
            {plan.estimatedDuration} min
          </p>
          {plan.warmup.length > 0 && (
            <p className="mt-0.5 text-xs text-teal">
              {plan.warmup.length}-move warmup included
            </p>
          )}
          <Link
            href="/app/workout"
            className="focus-ring mt-3 flex h-11 items-center justify-center rounded-[10px] bg-credo text-[15px] font-semibold text-white transition-colors hover:bg-credo/90"
          >
            {plan.status === "in_progress" ? "Resume workout" : "Start workout"}
          </Link>
        </div>
      )}

      {/* Muscle recovery */}
      <div className="mt-5 mb-2.5 flex items-center justify-between">
        <SectionHeader>Muscle recovery</SectionHeader>
        {recoveryError && (
          <button
            type="button"
            onClick={retryRecovery}
            className="focus-ring flex items-center gap-1 rounded-sm text-xs font-medium text-danger hover:underline"
          >
            <RefreshCw size={12} /> Retry
          </button>
        )}
      </div>
      {recoveryError ? (
        <p className="text-[13px] text-text-secondary">Couldn&apos;t load recovery data.</p>
      ) : !recovery ? (
        <Skeleton className="h-[68px]" />
      ) : (
        <RecoveryStrip states={recovery} />
      )}
    </div>
  );
}
