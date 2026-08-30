"use client";

// Score deep-dive: Credo hero, pillar deltas, trend chart, and the full
// Strength Score breakdown (8 subscores vs demographic percentiles).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/shared/section-header";
import { PercentileBar } from "@/components/shared/percentile-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendIndicator } from "@/components/shared/trend-indicator";
import { PILLARS, type PillarKey } from "@/lib/constants";
import { getTierLabel } from "@/lib/scoring";
import type {
  PillarScoresDTO,
  StrengthScoreResult,
  StrengthSubscore,
} from "@/lib/types";
import {
  ScoreTrendChart,
  type ScoreSnapshot,
} from "@/components/scores/score-trend-chart";
import {
  deltaColor,
  fetchData,
  ordinal,
  postJson,
  signed,
  UnauthorizedError,
} from "@/components/scores/utils";

// The legacy history route returns {data: snapshots[]} (an array directly);
// tolerate a {snapshots: [...]} wrapper too.
type HistoryPayload = ScoreSnapshot[] | { snapshots: ScoreSnapshot[] };

function normalizeHistory(payload: HistoryPayload): ScoreSnapshot[] {
  if (Array.isArray(payload)) return payload;
  return payload?.snapshots ?? [];
}

type SubscoreValueKind = "lb" | "sec" | "reps";

// Timed/rep-based subscores only exist in Core, Grip, and Muscular
// Endurance; everything else is an estimated 1RM in lbs. Within those
// three, infer seconds vs reps from the key lift's name.
function subscoreValueKind(s: StrengthSubscore): SubscoreValueKind {
  if (
    s.category !== "Core" &&
    s.category !== "Grip" &&
    s.category !== "Muscular Endurance"
  ) {
    return "lb";
  }
  const lift = s.keyLift.toLowerCase();
  if (/raise|push[\s-]?up|pull[\s-]?up|chin[\s-]?up|rep/.test(lift)) return "reps";
  if (/hang|plank|hold/.test(lift)) return "sec";
  return "lb";
}

function formatSubscoreValue(s: StrengthSubscore): string {
  const v = Math.round(s.estimated1RM);
  const kind = subscoreValueKind(s);
  if (kind === "sec") return `${v} sec`;
  if (kind === "reps") return `${v} reps`;
  return `${v} lb`;
}

export default function ScoresPage() {
  const router = useRouter();
  const [scores, setScores] = useState<PillarScoresDTO | null>(null);
  const [snapshots, setSnapshots] = useState<ScoreSnapshot[] | null>(null);
  const [strength, setStrength] = useState<StrengthScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [recalcError, setRecalcError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Flip after first paint so percentile bars animate from 0 on mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [current, history, strengthResult] = await Promise.all([
        fetchData<PillarScoresDTO>("/api/scores/current"),
        fetchData<HistoryPayload>("/api/scores/history"),
        fetchData<StrengthScoreResult>("/api/scores/strength"),
      ]);
      setScores(current);
      setSnapshots(normalizeHistory(history));
      setStrength(strengthResult);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        router.replace("/login");
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const recalculate = useCallback(async () => {
    setRecalculating(true);
    setRecalcError(null);
    try {
      const updated = await postJson<PillarScoresDTO>("/api/scores/recalculate");
      setScores(updated);
      const [history, strengthResult] = await Promise.all([
        fetchData<HistoryPayload>("/api/scores/history"),
        fetchData<StrengthScoreResult>("/api/scores/strength"),
      ]);
      setSnapshots(normalizeHistory(history));
      setStrength(strengthResult);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        router.replace("/login");
        return;
      }
      setRecalcError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setRecalculating(false);
    }
  }, [router]);

  if (loading) return <ScoresSkeleton />;

  if (error || !scores || !snapshots || !strength) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 pb-10">
        <div className="w-full rounded-[14px] border border-app bg-card-surface p-6 text-center">
          <div className="text-[14px] font-semibold text-text-primary">
            Couldn&apos;t load your scores
          </div>
          <div className="mt-1 text-[13px] text-text-secondary">
            {error ?? "Something went wrong"}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="focus-ring mt-4 rounded-[10px] bg-credo px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-credo/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const credoScore = Math.round(scores.credo.score);
  const trendDirection =
    strength.trend === "improving"
      ? "up"
      : strength.trend === "declining"
        ? "down"
        : "flat";

  return (
    <div className="flex-1 px-5 pb-6">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="pt-1 pb-6 text-center">
        <SectionHeader>{`Week ${scores.weekNumber} · Credo Score`}</SectionHeader>
        <div
          className="font-display leading-none text-text-primary"
          style={{ fontSize: 84, marginTop: 12 }}
        >
          {credoScore}
        </div>
        <div className="mt-2 text-[14px] font-medium text-text-secondary">
          {getTierLabel(credoScore, "credo")}
        </div>
        <div className={`mt-1 text-[12px] font-medium ${deltaColor(scores.credo.delta)}`}>
          {scores.credo.delta === 0
            ? "No change from last week"
            : `${signed(scores.credo.delta)} from last week`}
        </div>
      </div>

      {/* ── Pillar row ───────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(PILLARS) as PillarKey[]).map((key) => {
          const pillar = PILLARS[key];
          const s = scores[key];
          return (
            <div
              key={key}
              className="rounded-[14px] border border-app bg-card-surface px-1.5 py-3 text-center"
            >
              <div
                className="mx-auto mb-1.5 h-1 w-6 rounded-full"
                style={{ background: pillar.color }}
              />
              <div className="text-[11px] font-medium text-text-secondary">
                {pillar.label}
              </div>
              <div className="mt-0.5 font-mono text-[20px] font-bold leading-tight text-text-primary">
                {Math.round(s.score)}
              </div>
              <div className={`text-[11px] font-medium ${deltaColor(s.delta)}`}>
                {s.delta === 0 ? "±0" : signed(s.delta)}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Trend ────────────────────────────────────────── */}
      <div className="mt-7">
        <div className="mb-2.5">
          <SectionHeader>Trend</SectionHeader>
        </div>
        <ScoreTrendChart snapshots={snapshots} />
      </div>

      {/* ── Strength Score ───────────────────────────────── */}
      <div className="mt-7">
        <div className="mb-2.5">
          <SectionHeader>Strength Score</SectionHeader>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-app bg-card-surface">
          <div className="flex items-start justify-between px-4 pb-3 pt-4">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[32px] font-bold leading-none text-text-primary">
                  {Math.round(strength.overall)}
                </span>
                <TrendIndicator
                  delta={`${Math.abs(Math.round(strength.trendDelta))} pts`}
                  direction={trendDirection}
                  positive={strength.trend !== "declining"}
                />
              </div>
              <div className="mt-1 text-[13px] font-medium text-text-secondary">
                {getTierLabel(strength.overall, "strength")}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[16px] font-semibold text-text-primary">
                {ordinal(strength.percentile)}
              </div>
              <div className="text-[11px] text-text-tertiary">percentile</div>
            </div>
          </div>
          <div className="border-t border-app bg-surface px-4 py-2 text-[12px] text-text-secondary">
            vs {strength.demographicContext}
          </div>

          {/* 8 subscores */}
          <div className="border-t border-app">
            {strength.subscores.map((s) => {
              const hasData = s.estimated1RM > 0;
              const kind = subscoreValueKind(s);
              return (
                <div
                  key={s.category}
                  className="border-b border-app px-4 py-3 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-text-primary">
                        {s.category}
                      </div>
                      <div className="truncate text-[11px] text-text-tertiary">
                        {s.keyLift}
                      </div>
                    </div>
                    {hasData && (
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-[14px] font-semibold text-text-primary">
                          {formatSubscoreValue(s)}
                        </div>
                        {kind === "lb" && s.relativeStrength > 0 && (
                          <div className="text-[11px] text-text-tertiary">
                            {s.relativeStrength.toFixed(2)}×BW
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {hasData ? (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1">
                        <PercentileBar
                          value={mounted ? s.percentile : 0}
                          color={PILLARS.strength.color}
                        />
                      </div>
                      <span className="w-9 shrink-0 text-right text-[11px] font-medium text-text-secondary">
                        {ordinal(s.percentile)}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1.5 text-[12px] text-text-tertiary">
                      No data — log {s.keyLift} or test it in the{" "}
                      <Link
                        href="/app/credo-ten"
                        className="focus-ring rounded-sm font-medium text-credo hover:underline"
                      >
                        Credo Ten
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recalculate ──────────────────────────────────── */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => void recalculate()}
          disabled={recalculating}
          className="focus-ring w-full rounded-[12px] border border-app bg-transparent py-2.5 text-[13px] font-semibold text-text-secondary transition-colors hover:border-text-tertiary hover:text-text-primary disabled:opacity-50"
        >
          {recalculating ? "Recalculating…" : "Recalculate scores"}
        </button>
        {recalcError && (
          <div className="mt-2 text-center text-[12px] font-medium text-danger">
            {recalcError}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoresSkeleton() {
  return (
    <div className="flex-1 px-5 pb-6">
      <div className="flex flex-col items-center pt-4">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="mt-5 h-20 w-28 rounded-[14px]" />
        <Skeleton className="mt-4 h-3 w-24" />
      </div>
      <div className="mt-7 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[92px] rounded-[14px]" />
        ))}
      </div>
      <Skeleton className="mt-7 h-64 rounded-[14px]" />
      <Skeleton className="mt-7 h-80 rounded-[14px]" />
    </div>
  );
}
