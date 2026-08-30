"use client";

// The "Build custom split" editor: 7 day rows, each a rest toggle + label +
// multi-select muscle chips, plus a split name field.

import { useState } from "react";
import { ALL_MUSCLE_GROUPS, type MuscleGroup, type SplitDay } from "@/lib/types";
import { Toggle } from "@/components/onboarding/fields";
import { ChipMultiSelect } from "./chip-multi-select";
import { MUSCLE_GROUP_LABELS, dayShortName } from "./labels";

const MUSCLE_OPTIONS = ALL_MUSCLE_GROUPS.map((g) => ({
  value: g,
  label: MUSCLE_GROUP_LABELS[g],
}));

function blankDays(): SplitDay[] {
  return Array.from({ length: 7 }, (_, i) => ({
    dayNumber: i + 1,
    label: "Rest",
    muscleGroups: [],
    isRestDay: true,
  }));
}

export function SplitEditor({
  initialName = "",
  initialDays,
  onSave,
  onCancel,
}: {
  initialName?: string;
  initialDays?: SplitDay[];
  onSave: (name: string, days: SplitDay[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [days, setDays] = useState<SplitDay[]>(initialDays ?? blankDays());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateDay(dayNumber: number, patch: Partial<SplitDay>) {
    setDays((prev) =>
      prev.map((d) => (d.dayNumber === dayNumber ? { ...d, ...patch } : d)),
    );
  }

  function toggleRest(dayNumber: number, isRestDay: boolean) {
    updateDay(dayNumber, {
      isRestDay,
      label: isRestDay ? "Rest" : "Training",
      muscleGroups: isRestDay ? [] : days.find((d) => d.dayNumber === dayNumber)?.muscleGroups ?? [],
    });
  }

  function toggleMuscle(dayNumber: number, group: MuscleGroup) {
    const day = days.find((d) => d.dayNumber === dayNumber);
    if (!day) return;
    const has = day.muscleGroups.includes(group);
    updateDay(dayNumber, {
      muscleGroups: has
        ? day.muscleGroups.filter((g) => g !== group)
        : [...day.muscleGroups, group],
    });
  }

  async function handleSave() {
    setError(null);
    if (name.trim().length === 0) {
      setError("Give your split a name.");
      return;
    }
    if (days.every((d) => d.isRestDay)) {
      setError("At least one day needs to be a training day.");
      return;
    }
    for (const d of days) {
      if (!d.isRestDay && d.muscleGroups.length === 0) {
        setError(`Select at least one muscle group for ${dayShortName(d.dayNumber)}.`);
        return;
      }
      if (!d.isRestDay && d.label.trim().length === 0) {
        setError(`Give ${dayShortName(d.dayNumber)} a label.`);
        return;
      }
    }
    setSaving(true);
    try {
      await onSave(name.trim(), days);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save split.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[14px] border border-[var(--shell-border)] bg-card-surface p-4 sm:p-5">
      <div className="mb-4">
        <label
          htmlFor="split-name"
          className="mb-1.5 block text-[13px] font-medium text-[var(--shell-text-primary)]"
        >
          Split name
        </label>
        <input
          id="split-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My Push Pull Legs"
          maxLength={60}
          className="h-11 w-full rounded-[10px] border border-[var(--shell-border)] bg-card-surface px-3.5 text-[15px] text-[var(--shell-text-primary)] outline-none transition-colors placeholder:text-[var(--shell-text-tertiary)] focus:border-[var(--shell-accent)] focus:ring-2 focus:ring-[var(--shell-accent-light)]"
        />
      </div>

      <div className="flex flex-col divide-y divide-[var(--shell-surface-elevated)]">
        {days.map((d) => (
          <div key={d.dayNumber} className="py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <span className="w-10 shrink-0 text-[13px] font-semibold text-[var(--shell-text-tertiary)]">
                {dayShortName(d.dayNumber)}
              </span>
              <div className="flex-1">
                <Toggle
                  id={`rest-${d.dayNumber}`}
                  checked={d.isRestDay}
                  onChange={(checked) => toggleRest(d.dayNumber, checked)}
                  label="Rest day"
                />
              </div>
            </div>
            {!d.isRestDay && (
              <div className="mt-3 pl-[52px]">
                <input
                  type="text"
                  value={d.label}
                  onChange={(e) => updateDay(d.dayNumber, { label: e.target.value })}
                  placeholder="Day label, e.g. Push"
                  maxLength={30}
                  className="mb-2.5 h-9 w-full max-w-xs rounded-[8px] border border-[var(--shell-border)] bg-card-surface px-3 text-[13.5px] text-[var(--shell-text-primary)] outline-none transition-colors placeholder:text-[var(--shell-text-tertiary)] focus:border-[var(--shell-accent)] focus:ring-2 focus:ring-[var(--shell-accent-light)]"
                />
                <ChipMultiSelect
                  ariaLabel={`Muscle groups for ${dayShortName(d.dayNumber)}`}
                  options={MUSCLE_OPTIONS}
                  selected={d.muscleGroups}
                  onToggle={(group) => toggleMuscle(d.dayNumber, group)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
        >
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="focus-ring h-10 rounded-full bg-[var(--shell-accent)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save split"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="focus-ring h-10 rounded-full border border-[var(--shell-border)] px-5 text-sm font-medium text-[var(--shell-text-secondary)] transition-colors hover:border-[var(--shell-text-tertiary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
