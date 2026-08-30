"use client";

import { ALL_MUSCLE_GROUPS, type MuscleRecoveryState } from "@/lib/types";

const LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  quads: "Quads",
  hamstrings: "Hams",
  glutes: "Glutes",
  calves: "Calves",
  core: "Core",
  forearms: "Forearms",
  traps: "Traps",
};

const CHIP_STYLES: Record<string, string> = {
  fresh: "bg-[#E8F5F3] text-[#1A7A6D] border-[#1A7A6D]/15",
  recovering: "bg-[#FFF3E0] text-[#C47A1A] border-[#C47A1A]/15",
  fatigued: "bg-[#C43B3B]/8 text-[#C43B3B] border-[#C43B3B]/15",
};

function readinessTitle(state: MuscleRecoveryState): string {
  const label = LABELS[state.muscleGroup] ?? state.muscleGroup;
  if (state.fatigueLevel === "fresh") return `${label}: ready to train`;
  const ms = new Date(state.estimatedRecoveryDate).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return `${label}: ready to train`;
  const hours = Math.ceil(ms / 3_600_000);
  return `${label}: ready in ~${hours}h`;
}

export function RecoveryStrip({ states }: { states: MuscleRecoveryState[] }) {
  const byGroup = new Map(states.map((s) => [s.muscleGroup, s]));

  return (
    <div className="flex flex-wrap gap-1.5">
      {ALL_MUSCLE_GROUPS.map((group) => {
        const state = byGroup.get(group);
        const level = state?.fatigueLevel ?? "fresh";
        return (
          <span
            key={group}
            title={state ? readinessTitle(state) : `${LABELS[group]}: ready to train`}
            className={`cursor-default rounded-full border px-2.5 py-1 text-xs font-medium ${CHIP_STYLES[level]}`}
          >
            {LABELS[group]}
          </span>
        );
      })}
    </div>
  );
}
