"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";
import {
  ALL_EQUIPMENT,
  type Equipment,
  type TrainingGoal,
  type TrainingLocation,
  type TrainingPreferencesInput,
  type VarietyLevel,
} from "@/lib/types";
import { EQUIPMENT_LABELS, GOAL_OPTIONS, LOCATION_OPTIONS } from "@/components/onboarding/draft";
import {
  FieldLabel,
  OptionCard,
  PillGroup,
  SegmentedControl,
  Toggle,
} from "@/components/onboarding/fields";
import { fetchData, putJson } from "@/components/share/api";

const DAY_OPTIONS = [2, 3, 4, 5, 6] as const;
const DURATION_OPTIONS = [30, 45, 60, 75, 90] as const;

interface FormState {
  goal: TrainingGoal;
  daysPerWeek: number;
  sessionDuration: number;
  availableEquipment: Equipment[];
  trainingLocation: TrainingLocation;
  enableSupersets: boolean;
  varietyLevel: VarietyLevel;
}

const DEFAULT_FORM: FormState = {
  goal: "longevity",
  daysPerWeek: 4,
  sessionDuration: 60,
  availableEquipment: ["bodyweight"],
  trainingLocation: "commercial_gym",
  enableSupersets: true,
  varietyLevel: "medium",
};

function toFormState(p: TrainingPreferencesInput | null): FormState {
  if (!p) return DEFAULT_FORM;
  return {
    goal: p.goal,
    daysPerWeek: p.daysPerWeek,
    sessionDuration: p.sessionDuration,
    availableEquipment: p.availableEquipment,
    trainingLocation: p.trainingLocation,
    enableSupersets: p.enableSupersets,
    varietyLevel: p.varietyLevel,
  };
}

export default function PreferencesPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchData<{ preferences: TrainingPreferencesInput | null }>("/api/user/preferences")
      .then((data) => {
        if (!cancelled) setForm(toFormState(data.preferences));
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function patch(next: Partial<FormState>) {
    setForm((prev) => (prev ? { ...prev, ...next } : prev));
    setSaved(false);
  }

  function toggleEquipment(equipment: Equipment) {
    if (!form) return;
    const has = form.availableEquipment.includes(equipment);
    patch({
      availableEquipment: has
        ? form.availableEquipment.filter((e) => e !== equipment)
        : [...form.availableEquipment, equipment],
    });
  }

  async function handleSave() {
    if (!form) return;
    setSaveError(null);
    setSaving(true);
    try {
      await putJson("/api/user/preferences", form);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-2 lg:px-0">
      <div>
        <Link
          href="/app/profile"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--shell-text-secondary)] transition-colors hover:text-[var(--shell-text-primary)]"
        >
          <ChevronLeft size={15} />
          Profile
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-[var(--shell-text-primary)]">
          Training preferences
        </h1>
      </div>

      {loadError && (
        <p
          role="alert"
          className="rounded-[10px] border border-[var(--shell-danger)]/25 bg-[#FDF1F1] px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
        >
          {loadError}
        </p>
      )}

      {form && (
        <div className="flex flex-col gap-6">
          {/* Goal */}
          <section className="rounded-[14px] border border-[var(--shell-border)] bg-white p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-text-tertiary)]">
              Goal
            </h2>
            <div role="radiogroup" aria-label="Training goal" className="space-y-2.5">
              {GOAL_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={form.goal === option.value}
                  onSelect={() => patch({ goal: option.value })}
                />
              ))}
            </div>
          </section>

          {/* Schedule */}
          <section className="rounded-[14px] border border-[var(--shell-border)] bg-white p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-text-tertiary)]">
              Schedule
            </h2>
            <div className="space-y-5">
              <div>
                <FieldLabel>Days per week</FieldLabel>
                <PillGroup
                  ariaLabel="Days per week"
                  options={DAY_OPTIONS}
                  value={form.daysPerWeek as (typeof DAY_OPTIONS)[number]}
                  onChange={(daysPerWeek) => patch({ daysPerWeek })}
                />
              </div>
              <div>
                <FieldLabel>Session length</FieldLabel>
                <PillGroup
                  ariaLabel="Session length in minutes"
                  options={DURATION_OPTIONS}
                  value={form.sessionDuration as (typeof DURATION_OPTIONS)[number]}
                  onChange={(sessionDuration) => patch({ sessionDuration })}
                  format={(minutes) => `${minutes} min`}
                />
              </div>
            </div>
          </section>

          {/* Equipment */}
          <section className="rounded-[14px] border border-[var(--shell-border)] bg-white p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-text-tertiary)]">
              Equipment
            </h2>
            <div role="group" aria-label="Available equipment" className="grid grid-cols-2 gap-2.5">
              {ALL_EQUIPMENT.map((equipment) => {
                const selected = form.availableEquipment.includes(equipment);
                return (
                  <button
                    key={equipment}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleEquipment(equipment)}
                    className={`flex h-12 items-center justify-between gap-2 rounded-[10px] border px-3.5 text-left text-[14px] font-medium transition-colors ${
                      selected
                        ? "border-[var(--shell-accent)] bg-[var(--shell-accent-light)] text-[var(--shell-text-primary)]"
                        : "border-[var(--shell-border)] bg-white text-[var(--shell-text-primary)] hover:border-[var(--shell-text-tertiary)]"
                    }`}
                  >
                    {EQUIPMENT_LABELS[equipment]}
                    <span
                      aria-hidden
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-colors ${
                        selected
                          ? "bg-[var(--shell-accent)] text-white"
                          : "border border-[var(--shell-border)] text-transparent"
                      }`}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[12px] text-[var(--shell-text-tertiary)]">
              Your default gym&apos;s equipment takes priority —{" "}
              <Link href="/app/profile/gyms" className="text-[var(--shell-accent)] hover:underline">
                manage in Gym profiles
              </Link>
              .
            </p>
          </section>

          {/* Location */}
          <section className="rounded-[14px] border border-[var(--shell-border)] bg-white p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-text-tertiary)]">
              Location
            </h2>
            <div role="radiogroup" aria-label="Training location" className="space-y-2.5">
              {LOCATION_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={form.trainingLocation === option.value}
                  onSelect={() => patch({ trainingLocation: option.value })}
                />
              ))}
            </div>
          </section>

          {/* Variety + supersets */}
          <section className="rounded-[14px] border border-[var(--shell-border)] bg-white p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-text-tertiary)]">
              Workout style
            </h2>
            <div className="space-y-5">
              <Toggle
                id="pref-supersets"
                checked={form.enableSupersets}
                onChange={(enableSupersets) => patch({ enableSupersets })}
                label="Enable supersets"
                description="Pair exercises to save time on shorter sessions."
              />
              <div>
                <FieldLabel>Exercise variety</FieldLabel>
                <SegmentedControl<VarietyLevel>
                  ariaLabel="Exercise variety"
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                  ]}
                  value={form.varietyLevel}
                  onChange={(varietyLevel) => patch({ varietyLevel })}
                />
                <p className="mt-1.5 text-[12px] text-[var(--shell-text-secondary)]">
                  Low keeps the same core lifts week to week; high rotates more.
                </p>
              </div>
            </div>
          </section>

          {saveError && (
            <p
              role="alert"
              className="rounded-[10px] border border-[var(--shell-danger)]/25 bg-[#FDF1F1] px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
            >
              {saveError}
            </p>
          )}

          <div className="flex items-center gap-3 pb-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-10 rounded-full bg-[var(--shell-accent)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saved && (
              <span className="text-[13px] font-medium text-[var(--shell-success)]">Saved</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
