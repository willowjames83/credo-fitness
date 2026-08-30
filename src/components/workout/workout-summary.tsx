"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { CompleteWorkoutResponse, ScoreWithDelta } from "@/lib/types";
import { PILLARS, type PillarKey } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";

interface WorkoutSummaryProps {
  focus: string;
  result: CompleteWorkoutResponse;
}

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function formatVolume(volume: number): string {
  return `${Math.round(volume).toLocaleString()} lb`;
}

function DeltaText({ delta }: { delta: number }) {
  const color = delta > 0 ? "text-[#2D8A4E]" : delta < 0 ? "text-[#C43B3B]" : "text-[#9E9EA3]";
  const sign = delta > 0 ? "+" : "";
  return (
    <span className={`font-mono text-xs font-medium ${color}`}>
      {sign}
      {delta}
    </span>
  );
}

export function WorkoutSummary({ focus, result }: WorkoutSummaryProps) {
  const { summary, personalRecords, scores } = result;
  const pillarKeys: PillarKey[] = ["strength", "stability", "cardio", "nutrition"];

  const stats = [
    { label: "Volume", value: formatVolume(summary.totalVolume) },
    { label: "Duration", value: formatDuration(summary.durationSeconds) },
    { label: "Sets", value: String(summary.setCount) },
  ];

  return (
    <div className="flex flex-col gap-5 px-5 pb-6">
      <div className="pt-2 text-center">
        <p className="text-[11px] font-semibold tracking-[1.5px] text-[#9E9EA3] uppercase">
          Workout complete
        </p>
        <h1 className="mt-1 text-xl font-semibold text-[#1A1A1E]">{focus}</h1>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[14px] border border-[#E5E5E8] bg-white px-3 py-3 text-center"
          >
            <p className="font-mono text-lg font-semibold text-[#1A1A1E]">{s.value}</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#6B6B73] uppercase">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {personalRecords.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <SectionHeader>Personal records</SectionHeader>
          {personalRecords.map((pr, i) => (
            <motion.div
              key={pr.exerciseId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-[14px] border-2 border-[#E8501A] bg-[#FFF0E9] px-4 py-3.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8501A] text-white">
                <Trophy size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1A1A1E]">
                  New 1RM: {Math.round(pr.new1RM)} lb {pr.name}
                </p>
                <p className="text-xs text-[#6B6B73]">
                  {pr.previous1RM != null
                    ? `Up from ${Math.round(pr.previous1RM)} lb`
                    : "First recorded max"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <SectionHeader>Score impact</SectionHeader>
        <div className="rounded-[14px] border border-[#E5E5E8] bg-white px-4 py-1">
          <div className="flex items-center justify-between border-b border-[#EEEFF1] py-3">
            <span className="text-sm font-semibold text-[#1A1A1E]">Credo score</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-[#1A1A1E]">
                {scores.credo.score}
              </span>
              <DeltaText delta={scores.credo.delta} />
            </div>
          </div>
          {pillarKeys.map((key, i) => {
            const s: ScoreWithDelta = scores[key];
            return (
              <div
                key={key}
                className={`flex items-center justify-between py-3 ${
                  i < pillarKeys.length - 1 ? "border-b border-[#EEEFF1]" : ""
                }`}
              >
                <span className="text-sm text-[#6B6B73]">{PILLARS[key].label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-[#1A1A1E]">
                    {s.score}
                  </span>
                  <DeltaText delta={s.delta} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Link
        href="/app/dashboard"
        className="flex h-12 items-center justify-center rounded-[12px] bg-[#E8501A] text-[15px] font-semibold text-white transition-colors hover:bg-[#D3480F]"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
