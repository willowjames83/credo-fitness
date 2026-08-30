"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import type { WorkoutHistoryItemDTO } from "@/lib/types";
import { getJSON, errorMessage } from "@/components/workout/api";
import { SectionHeader } from "@/components/shared/section-header";

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function formatDuration(seconds: number | null): string | null {
  if (seconds == null || seconds <= 0) return null;
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[14px] bg-[#EEEFF1] ${className}`} />;
}

export default function HistoryPage() {
  const [items, setItems] = useState<WorkoutHistoryItemDTO[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);

  const fetchPage = useCallback((offset: number) => {
    return getJSON<{ workouts: WorkoutHistoryItemDTO[]; total: number }>(
      `/api/workouts/history?limit=${PAGE_SIZE}&offset=${offset}`,
    );
  }, []);

  // Only sets state in async callbacks, so it is safe to call from an effect.
  const fetchInitial = useCallback(() => {
    fetchPage(0)
      .then(({ workouts, total: t }) => {
        setItems(workouts);
        setTotal(t);
        offsetRef.current = workouts.length;
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [fetchPage]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  function retryInitial() {
    setLoading(true);
    setError(null);
    fetchInitial();
  }

  function loadMore() {
    setLoadingMore(true);
    setError(null);
    fetchPage(offsetRef.current)
      .then(({ workouts, total: t }) => {
        setItems((prev) => [...prev, ...workouts]);
        setTotal(t);
        offsetRef.current += workouts.length;
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoadingMore(false));
  }

  const hasMore = total != null && items.length < total;

  return (
    <div className="flex-1 px-5 pb-6">
      <div className="pt-1 pb-3">
        <h1 className="text-lg font-semibold text-[#1A1A1E]">History</h1>
        {total != null && total > 0 && (
          <p className="mt-0.5 text-[13px] text-[#6B6B73]">
            {total} workout{total === 1 ? "" : "s"} logged
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-[88px]" />
          <Skeleton className="h-[88px]" />
          <Skeleton className="h-[88px]" />
          <Skeleton className="h-[88px]" />
        </div>
      ) : error && items.length === 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[#C43B3B]/25 bg-[#C43B3B]/5 px-4 py-3">
          <p className="text-sm text-[#C43B3B]">{error}</p>
          <button
            type="button"
            onClick={retryInitial}
            className="shrink-0 rounded-[8px] border border-[#C43B3B]/30 px-3 py-1.5 text-xs font-semibold text-[#C43B3B] transition-colors hover:bg-[#C43B3B]/10"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[14px] border border-[#E5E5E8] bg-white p-5 text-center">
          <p className="text-sm font-semibold text-[#1A1A1E]">No workouts yet</p>
          <p className="mx-auto mt-1 max-w-[300px] text-[13px] text-[#6B6B73]">
            Your completed sessions will show up here. Start with today&apos;s plan.
          </p>
          <Link
            href="/app/workout"
            className="mx-auto mt-4 flex h-11 max-w-[240px] items-center justify-center rounded-[10px] bg-[#E8501A] text-sm font-semibold text-white transition-colors hover:bg-[#D3480F]"
          >
            Go to today&apos;s workout
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-2.5">
            <SectionHeader>Completed sessions</SectionHeader>
          </div>
          <div className="flex flex-col gap-2.5">
            {items.map((w) => {
              const duration = formatDuration(w.durationSeconds);
              return (
                <div
                  key={w.id}
                  className="rounded-[14px] border border-[#E5E5E8] bg-white px-4 py-3.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#1A1A1E]">{w.focus}</p>
                    {w.prCount > 0 && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#FFF0E9] px-2 py-0.5 text-[11px] font-semibold text-[#E8501A]">
                        <Trophy size={10} />
                        {w.prCount} PR{w.prCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[#9E9EA3]">{formatDate(w.date)}</p>
                  <p className="mt-1.5 font-mono text-[13px] text-[#6B6B73]">
                    {Math.round(w.totalVolume).toLocaleString()} lb
                    <span className="text-[#9E9EA3]"> · </span>
                    {w.setCount} sets
                    <span className="text-[#9E9EA3]"> · </span>
                    {w.exerciseCount} exercises
                    {duration && (
                      <>
                        <span className="text-[#9E9EA3]"> · </span>
                        {duration}
                      </>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {error && (
            <p className="mt-3 text-center text-[13px] text-[#C43B3B]">{error}</p>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-[10px] border border-[#E5E5E8] bg-white text-sm font-semibold text-[#1A1A1E] transition-colors hover:bg-[#F7F7F8] disabled:opacity-60"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
