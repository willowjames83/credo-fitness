"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Pencil, Plus, Trash2 } from "lucide-react";
import type { SplitDay, TrainingPreferencesInput } from "@/lib/types";
import type { PresetSplit } from "@/services/data/program-templates";
import { deleteJson, fetchData, postJson, putJson } from "@/components/share/api";
import { DayChips } from "@/components/share/day-chips";
import { SPLIT_TYPE_LABELS } from "@/components/share/labels";
import { ShareLinkButton } from "@/components/share/share-link-button";
import { SplitEditor } from "@/components/share/split-editor";
import { EmptyState } from "@/components/ui/empty-state";

interface SplitRow {
  id: string;
  name: string;
  type: string;
  days: SplitDay[];
  isShareable: boolean;
  isActive: boolean;
  createdAt: string;
}

function currentSplitLabel(
  preferences: TrainingPreferencesInput | null,
  splits: SplitRow[],
): string {
  if (!preferences) return "Not set yet";
  if (preferences.preferredSplit === "custom") {
    const active = splits.find((s) => s.isActive);
    return active ? active.name : "Custom (unsaved)";
  }
  return SPLIT_TYPE_LABELS[preferences.preferredSplit] ?? preferences.preferredSplit;
}

export default function SplitsPage() {
  const [presets, setPresets] = useState<PresetSplit[]>([]);
  const [splits, setSplits] = useState<SplitRow[]>([]);
  const [preferences, setPreferences] = useState<TrainingPreferencesInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSplit, setEditingSplit] = useState<SplitRow | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [splitsData, prefsData] = await Promise.all([
        fetchData<{ splits: SplitRow[]; presets: PresetSplit[] }>("/api/splits"),
        fetchData<{ preferences: TrainingPreferencesInput | null }>("/api/user/preferences"),
      ]);
      setSplits(splitsData.splits);
      setPresets(splitsData.presets);
      setPreferences(prefsData.preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load splits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function activatePreset(presetId: string) {
    setActionError(null);
    setBusyId(presetId);
    try {
      await postJson("/api/splits/activate-preset", { presetId });
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not activate split.");
    } finally {
      setBusyId(null);
    }
  }

  async function activateCustom(id: string) {
    setActionError(null);
    setBusyId(id);
    try {
      await postJson(`/api/splits/${id}/activate`);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not activate split.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteSplit(id: string) {
    setActionError(null);
    setBusyId(id);
    try {
      await deleteJson(`/api/splits/${id}`);
      setConfirmDeleteId(null);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not delete split.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveSplit(name: string, days: SplitDay[]) {
    if (editingSplit) {
      await putJson(`/api/splits/${editingSplit.id}`, { name, days });
    } else {
      await postJson("/api/splits", { name, days });
    }
    setEditorOpen(false);
    setEditingSplit(null);
    await load();
  }

  const customSplits = splits.filter((s) => s.type === "custom");

  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-2 lg:px-0">
      <div>
        <Link
          href="/app/profile"
          className="focus-ring inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-[var(--shell-text-secondary)] transition-colors hover:text-[var(--shell-text-primary)]"
        >
          <ChevronLeft size={15} />
          Profile
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-[var(--shell-text-primary)]">
          Splits
        </h1>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
        >
          {error}
        </p>
      )}

      {/* Current split banner */}
      <div className="rounded-[14px] border border-[var(--shell-accent)]/25 bg-[var(--shell-accent-light)] px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-accent)]">
          Current split
        </p>
        <p className="mt-1 text-lg font-semibold text-[var(--shell-text-primary)]">
          {loading ? "Loading…" : currentSplitLabel(preferences, splits)}
        </p>
      </div>

      {actionError && (
        <p
          role="alert"
          className="rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
        >
          {actionError}
        </p>
      )}

      {/* Presets */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-text-tertiary)]">
          Preset splits
        </h2>
        <div className="flex flex-col gap-3">
          {presets.map((preset) => {
            const isCurrent =
              preferences?.preferredSplit === preset.type &&
              !customSplits.some((s) => s.isActive);
            return (
              <div
                key={preset.id}
                className="rounded-[14px] border border-[var(--shell-border)] bg-card-surface p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[var(--shell-text-primary)]">
                      {preset.name}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[var(--shell-text-secondary)]">
                      {preset.daysPerWeek} days/week
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => activatePreset(preset.id)}
                    disabled={busyId === preset.id || isCurrent}
                    className="focus-ring h-9 shrink-0 rounded-full bg-[var(--shell-accent)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCurrent ? "Active" : busyId === preset.id ? "…" : "Activate"}
                  </button>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--shell-text-secondary)]">
                  {preset.description}
                </p>
                <DayChips days={preset.days} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Custom splits */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-text-tertiary)]">
            My custom splits
          </h2>
          {!editorOpen && (
            <button
              type="button"
              onClick={() => {
                setEditingSplit(null);
                setEditorOpen(true);
              }}
              className="focus-ring inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold text-[var(--shell-accent)] transition-opacity hover:opacity-80"
            >
              <Plus size={15} />
              Build custom split
            </button>
          )}
        </div>

        {editorOpen && (
          <SplitEditor
            initialName={editingSplit?.name}
            initialDays={editingSplit?.days}
            onSave={handleSaveSplit}
            onCancel={() => {
              setEditorOpen(false);
              setEditingSplit(null);
            }}
          />
        )}

        {!loading && customSplits.length === 0 && !editorOpen && (
          <EmptyState
            icon={Plus}
            title="No custom splits yet"
            description="Build one to pick exactly which muscle groups train on which days."
            action={
              <button
                type="button"
                onClick={() => {
                  setEditingSplit(null);
                  setEditorOpen(true);
                }}
                className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--shell-accent)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)]"
              >
                <Plus size={15} />
                Build custom split
              </button>
            }
          />
        )}

        <div className="flex flex-col gap-3">
          {customSplits.map((split) => (
            <div
              key={split.id}
              className="rounded-[14px] border border-[var(--shell-border)] bg-card-surface p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--shell-text-primary)]">
                    {split.name}
                    {split.isActive && (
                      <span className="rounded-full bg-[var(--shell-accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Active
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <DayChips days={split.days} />
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => activateCustom(split.id)}
                  disabled={busyId === split.id || split.isActive}
                  className="focus-ring h-9 rounded-full bg-[var(--shell-accent)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {split.isActive ? "Active" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSplit(split);
                    setEditorOpen(true);
                  }}
                  className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--shell-border)] bg-card-surface px-3.5 text-[13px] font-semibold text-[var(--shell-text-primary)] transition-colors hover:border-[var(--shell-text-tertiary)]"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <ShareLinkButton
                  onShare={async () => {
                    if (!split.isShareable) {
                      await putJson(`/api/splits/${split.id}`, { isShareable: true });
                      setSplits((prev) =>
                        prev.map((s) => (s.id === split.id ? { ...s, isShareable: true } : s)),
                      );
                    }
                    return postJson<{ shareCode: string; url: string }>("/api/share", {
                      type: "split",
                      splitId: split.id,
                    });
                  }}
                />
                {confirmDeleteId === split.id ? (
                  <span className="inline-flex items-center gap-2 text-[13px]">
                    <span className="text-[var(--shell-text-secondary)]">Delete?</span>
                    <button
                      type="button"
                      onClick={() => deleteSplit(split.id)}
                      disabled={busyId === split.id}
                      className="focus-ring rounded-sm font-semibold text-[var(--shell-danger)] hover:opacity-80"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="focus-ring rounded-sm font-medium text-[var(--shell-text-secondary)] hover:opacity-80"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(split.id)}
                    className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-transparent px-2 text-[13px] font-medium text-[var(--shell-danger)] transition-colors hover:bg-danger-light"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
