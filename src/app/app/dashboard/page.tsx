"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { CredoScoreRing } from "@/components/shared/credo-score-ring";
import { PillarCard } from "@/components/shared/pillar-card";
import { SectionHeader } from "@/components/shared/section-header";
import { RecoveryStrip } from "@/components/workout/recovery-strip";
import { getJSON, errorMessage } from "@/components/workout/api";
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

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[14px] bg-[#EEEFF1] ${className}`} />;
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[#C43B3B]/25 bg-[#C43B3B]/5 px-4 py-3">
      <p className="text-sm text-[#C43B3B]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-[8px] border border-[#C43B3B]/30 px-3 py-1.5 text-xs font-semibold text-[#C43B3B] transition-colors hover:bg-[#C43B3B]/10"
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
            <p className="mb-4 text-[11px] font-medium tracking-[1.5px] text-[#9E9EA3] uppercase">
              Week {scores.weekNumber}
            </p>
            <div className="inline-block">
              <CredoScoreRing score={scores.credo.score} />
            </div>
            <p
              className={`mt-2 text-xs font-medium ${
                scores.credo.delta > 0
                  ? "text-[#2D8A4E]"
                  : scores.credo.delta < 0
                    ? "text-[#C43B3B]"
                    : "text-[#9E9EA3]"
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
        <div className="rounded-[14px] border border-[#E5E5E8] bg-white p-4">
          <p className="text-sm font-medium text-[#1A1A1E]">
            No training plan yet
          </p>
          <p className="mt-0.5 text-[13px] text-[#6B6B73]">
            Tell us your goals and equipment and we&apos;ll build your first week.
          </p>
          <Link
            href="/onboarding"
            className="mt-3 flex h-11 items-center justify-center rounded-[10px] bg-[#E8501A] text-[15px] font-semibold text-white transition-colors hover:bg-[#D3480F]"
          >
            Set up my plan
          </Link>
        </div>
      ) : plan.status === "completed" ? (
        <div className="rounded-[14px] border border-[#2D8A4E]/25 bg-[#E8F5ED] p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#2D8A4E]" />
            <p className="text-sm font-semibold text-[#1A1A1E]">Done today</p>
          </div>
          <p className="mt-1 text-[13px] text-[#6B6B73]">
            {plan.focus}
            {doneToday
              ? ` · ${Math.round(doneToday.totalVolume).toLocaleString()} lb moved · ${doneToday.setCount} sets`
              : ""}
          </p>
          <Link
            href="/app/history"
            className="mt-2 inline-block text-[13px] font-medium text-[#2D8A4E] hover:underline"
          >
            View in history
          </Link>
        </div>
      ) : (
        <div className="rounded-[14px] border border-[#E5E5E8] bg-white p-4">
          <p className="text-sm font-medium text-[#1A1A1E]">{plan.focus}</p>
          <p className="mt-0.5 text-[13px] text-[#6B6B73]">
            {plan.exercises.filter((e) => !e.isWarmup).length} exercises · ~
            {plan.estimatedDuration} min
          </p>
          {plan.warmup.length > 0 && (
            <p className="mt-0.5 text-xs text-[#1A7A6D]">
              {plan.warmup.length}-move warmup included
            </p>
          )}
          <Link
            href="/app/workout"
            className="mt-3 flex h-11 items-center justify-center rounded-[10px] bg-[#E8501A] text-[15px] font-semibold text-white transition-colors hover:bg-[#D3480F]"
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
            className="flex items-center gap-1 text-xs font-medium text-[#C43B3B] hover:underline"
          >
            <RefreshCw size={12} /> Retry
          </button>
        )}
      </div>
      {recoveryError ? (
        <p className="text-[13px] text-[#6B6B73]">Couldn&apos;t load recovery data.</p>
      ) : !recovery ? (
        <Skeleton className="h-[68px]" />
      ) : (
        <RecoveryStrip states={recovery} />
      )}
    </div>
  );
}
