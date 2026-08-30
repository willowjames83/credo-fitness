"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { ALL_EQUIPMENT, type Equipment, type TrainingLocation } from "@/lib/types";
import { EQUIPMENT_LABELS, LOCATION_OPTIONS } from "@/components/onboarding/draft";
import { Toggle } from "@/components/onboarding/fields";
import { deleteJson, fetchData, postJson, putJson } from "@/components/share/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface GymProfileRow {
  id: string;
  name: string;
  location: TrainingLocation;
  equipment: Equipment[];
  isDefault: boolean;
}

interface FormState {
  name: string;
  location: TrainingLocation;
  equipment: Equipment[];
  isDefault: boolean;
}

const BLANK_FORM: FormState = {
  name: "",
  location: "commercial_gym",
  equipment: [],
  isDefault: false,
};

function locationLabel(location: TrainingLocation): string {
  return LOCATION_OPTIONS.find((o) => o.value === location)?.label ?? location;
}

export default function GymsPage() {
  const [profiles, setProfiles] = useState<GymProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await fetchData<{ profiles: GymProfileRow[] }>("/api/user/gym-profiles");
      setProfiles(data.profiles);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load gym profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(BLANK_FORM);
    setFormError(null);
    setSheetOpen(true);
  }

  function openEdit(profile: GymProfileRow) {
    setEditingId(profile.id);
    setForm({
      name: profile.name,
      location: profile.location,
      equipment: profile.equipment,
      isDefault: profile.isDefault,
    });
    setFormError(null);
    setSheetOpen(true);
  }

  function toggleEquipment(equipment: Equipment) {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter((e) => e !== equipment)
        : [...prev.equipment, equipment],
    }));
  }

  async function handleSubmit() {
    setFormError(null);
    if (form.name.trim().length === 0) {
      setFormError("Give this gym a name.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        location: form.location,
        equipment: form.equipment,
        isDefault: form.isDefault,
      };
      if (editingId) {
        await putJson(`/api/user/gym-profiles/${editingId}`, body);
      } else {
        await postJson("/api/user/gym-profiles", body);
      }
      setSheetOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save gym profile.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProfile(id: string) {
    setActionError(null);
    setBusyId(id);
    try {
      await deleteJson(`/api/user/gym-profiles/${id}`);
      setConfirmDeleteId(null);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not delete gym profile.");
    } finally {
      setBusyId(null);
    }
  }

  async function makeDefault(id: string) {
    setActionError(null);
    setBusyId(id);
    try {
      await putJson(`/api/user/gym-profiles/${id}`, { isDefault: true });
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not set default gym.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-2 lg:px-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href="/app/profile"
            className="focus-ring inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-[var(--shell-text-secondary)] transition-colors hover:text-[var(--shell-text-primary)]"
          >
            <ChevronLeft size={15} />
            Profile
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-[var(--shell-text-primary)]">
            Gym profiles
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="focus-ring mt-1 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[var(--shell-accent)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)]"
        >
          <Plus size={15} />
          New gym
        </button>
      </div>

      {loadError && (
        <p
          role="alert"
          className="rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
        >
          {loadError}
        </p>
      )}
      {actionError && (
        <p
          role="alert"
          className="rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
        >
          {actionError}
        </p>
      )}

      {loading && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading gym profiles">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[14px] border border-[var(--shell-border)] bg-card-surface p-4 sm:p-5"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3.5 w-48" />
              <div className="mt-3.5 flex gap-2">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && profiles.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="No gym profiles yet"
          description="Add one so Credo only programs exercises you can actually do."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--shell-accent)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)]"
            >
              <Plus size={15} />
              New gym
            </button>
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="rounded-[14px] border border-[var(--shell-border)] bg-card-surface p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--shell-text-primary)]">
                  {profile.name}
                  {profile.isDefault && (
                    <span className="rounded-full bg-[var(--shell-accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Default
                    </span>
                  )}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--shell-text-secondary)]">
                  <MapPin size={13} />
                  {locationLabel(profile.location)} · {profile.equipment.length} equipment
                </p>
              </div>
            </div>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {!profile.isDefault && (
                <button
                  type="button"
                  onClick={() => makeDefault(profile.id)}
                  disabled={busyId === profile.id}
                  className="focus-ring h-9 rounded-full border border-[var(--shell-border)] bg-card-surface px-3.5 text-[13px] font-semibold text-[var(--shell-text-primary)] transition-colors hover:border-[var(--shell-text-tertiary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Set default
                </button>
              )}
              <button
                type="button"
                onClick={() => openEdit(profile)}
                className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--shell-border)] bg-card-surface px-3.5 text-[13px] font-semibold text-[var(--shell-text-primary)] transition-colors hover:border-[var(--shell-text-tertiary)]"
              >
                <Pencil size={14} />
                Edit
              </button>
              {confirmDeleteId === profile.id ? (
                <span className="inline-flex items-center gap-2 text-[13px]">
                  <span className="text-[var(--shell-text-secondary)]">Delete?</span>
                  <button
                    type="button"
                    onClick={() => deleteProfile(profile.id)}
                    disabled={busyId === profile.id}
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
                  onClick={() => setConfirmDeleteId(profile.id)}
                  className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-transparent px-2 text-[13px] font-medium text-[var(--shell-danger)] transition-colors hover:bg-danger-light"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit gym profile" : "New gym profile"}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 px-4 pb-4">
            <div>
              <label
                htmlFor="gym-name"
                className="mb-1.5 block text-[13px] font-medium text-[var(--shell-text-primary)]"
              >
                Name
              </label>
              <input
                id="gym-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Home Gym"
                maxLength={100}
                className="h-11 w-full rounded-[10px] border border-[var(--shell-border)] bg-card-surface px-3.5 text-[15px] text-[var(--shell-text-primary)] outline-none transition-colors placeholder:text-[var(--shell-text-tertiary)] focus:border-[var(--shell-accent)] focus:ring-2 focus:ring-[var(--shell-accent-light)]"
              />
            </div>

            <div>
              <label
                htmlFor="gym-location"
                className="mb-1.5 block text-[13px] font-medium text-[var(--shell-text-primary)]"
              >
                Location
              </label>
              <select
                id="gym-location"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    location: e.target.value as TrainingLocation,
                  }))
                }
                className="h-11 w-full rounded-[10px] border border-[var(--shell-border)] bg-card-surface px-3.5 text-[15px] text-[var(--shell-text-primary)] outline-none transition-colors focus:border-[var(--shell-accent)] focus:ring-2 focus:ring-[var(--shell-accent-light)]"
              >
                {LOCATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-1.5 text-[13px] font-medium text-[var(--shell-text-primary)]">
                Equipment
              </p>
              <div role="group" aria-label="Equipment at this gym" className="grid grid-cols-2 gap-2">
                {ALL_EQUIPMENT.map((equipment) => {
                  const selected = form.equipment.includes(equipment);
                  return (
                    <button
                      key={equipment}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleEquipment(equipment)}
                      className={`focus-ring flex h-11 items-center justify-between gap-2 rounded-[10px] border px-3 text-left text-[13px] font-medium transition-colors ${
                        selected
                          ? "border-[var(--shell-accent)] bg-[var(--shell-accent-light)] text-[var(--shell-text-primary)]"
                          : "border-[var(--shell-border)] bg-card-surface text-[var(--shell-text-primary)] hover:border-[var(--shell-text-tertiary)]"
                      }`}
                    >
                      {EQUIPMENT_LABELS[equipment]}
                      <span
                        aria-hidden
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                          selected
                            ? "bg-[var(--shell-accent)] text-white"
                            : "border border-[var(--shell-border)] text-transparent"
                        }`}
                      >
                        <Check size={10} strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Toggle
              id="gym-default"
              checked={form.isDefault}
              onChange={(isDefault) => setForm((prev) => ({ ...prev, isDefault }))}
              label="Set as default gym"
              description="Its equipment takes priority when generating workouts."
            />

            {formError && (
              <p
                role="alert"
                className="rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
              >
                {formError}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="focus-ring h-11 rounded-full bg-[var(--shell-accent)] text-sm font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Create gym profile"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
