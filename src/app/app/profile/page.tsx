"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  age: number | null;
  sex: string | null;
  weight: number | null;
  experienceLevel: string | null;
  trainingGoal: string | null;
}

interface FormState {
  name: string;
  age: string;
  sex: string;
  weight: string;
  experienceLevel: string;
  trainingGoal: string;
}

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const TRAINING_GOALS = [
  { value: "build_muscle", label: "Build muscle" },
  { value: "increase_strength", label: "Increase strength" },
  { value: "get_lean", label: "Get lean" },
  { value: "general_fitness", label: "General fitness" },
  { value: "longevity", label: "Longevity" },
];

const TRAINING_LINKS = [
  { label: "Training preferences", href: "/app/profile/preferences" },
  { label: "Gym profiles", href: "/app/profile/gyms" },
  { label: "My splits", href: "/app/profile/splits" },
];

const inputClass =
  "h-11 w-full rounded-[10px] border border-[var(--shell-border)] bg-card-surface px-3.5 text-[15px] text-[var(--shell-text-primary)] outline-none transition-colors placeholder:text-[var(--shell-text-tertiary)] focus:border-[var(--shell-accent)] focus:ring-2 focus:ring-[var(--shell-accent-light)]";
const labelClass =
  "mb-1.5 block text-[13px] font-medium text-[var(--shell-text-primary)]";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase() || "C";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? "Failed to load profile");
        return json.data as ProfileData;
      })
      .then((user) => {
        if (cancelled) return;
        setProfile(user);
        setForm({
          name: user.name ?? "",
          age: user.age != null ? String(user.age) : "",
          sex: user.sex ?? "",
          weight: user.weight != null ? String(user.weight) : "",
          experienceLevel: user.experienceLevel ?? "",
          trainingGoal: user.trainingGoal ?? "",
        });
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function update(field: keyof FormState, value: string) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaveError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim() || undefined,
          age: form.age ? Number.parseInt(form.age, 10) : null,
          sex: form.sex || null,
          weight: form.weight ? Number.parseInt(form.weight, 10) : null,
          experienceLevel: form.experienceLevel || null,
          trainingGoal: form.trainingGoal || null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setSaveError(json?.error ?? "Could not save changes.");
      } else {
        setProfile(json.data as ProfileData);
        setSaved(true);
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Cookie clearing failed or network error — still send the user home.
    }
    window.location.assign("/");
  }

  const displayName = profile?.name || "Athlete";

  return (
    <div className="flex flex-col gap-6 px-5 pb-10 pt-2 lg:px-0">
      {/* Identity */}
      <div className="flex items-center gap-4">
        {profile ? (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--shell-surface-elevated)] text-lg font-semibold text-[var(--shell-text-secondary)]">
            {initialsOf(displayName)}
          </span>
        ) : (
          <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold text-[var(--shell-text-primary)]">
            {displayName}
          </h1>
          <p className="truncate text-sm text-[var(--shell-text-secondary)]">
            {profile?.email ?? " "}
          </p>
        </div>
      </div>

      {loadError && (
        <p
          role="alert"
          className="rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
        >
          {loadError}
        </p>
      )}

      {/* Profile form */}
      <section className="rounded-[14px] border border-[var(--shell-border)] bg-card-surface p-5 sm:p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-text-tertiary)]">
          Profile
        </h2>
        <form onSubmit={handleSave} className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input
                id="name"
                type="text"
                value={form?.name ?? ""}
                onChange={(e) => update("name", e.target.value)}
                disabled={!form}
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="age" className={labelClass}>
                Age
              </label>
              <input
                id="age"
                type="number"
                min={1}
                value={form?.age ?? ""}
                onChange={(e) => update("age", e.target.value)}
                disabled={!form}
                className={inputClass}
                placeholder="—"
              />
            </div>
            <div>
              <label htmlFor="sex" className={labelClass}>
                Sex
              </label>
              <select
                id="sex"
                value={form?.sex ?? ""}
                onChange={(e) => update("sex", e.target.value)}
                disabled={!form}
                className={inputClass}
              >
                <option value="">Not set</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="weight" className={labelClass}>
                Weight (lbs)
              </label>
              <input
                id="weight"
                type="number"
                min={1}
                value={form?.weight ?? ""}
                onChange={(e) => update("weight", e.target.value)}
                disabled={!form}
                className={inputClass}
                placeholder="—"
              />
            </div>
            <div>
              <label htmlFor="experienceLevel" className={labelClass}>
                Experience level
              </label>
              <select
                id="experienceLevel"
                value={form?.experienceLevel ?? ""}
                onChange={(e) => update("experienceLevel", e.target.value)}
                disabled={!form}
                className={inputClass}
              >
                <option value="">Not set</option>
                {EXPERIENCE_LEVELS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="trainingGoal" className={labelClass}>
                Training goal
              </label>
              <select
                id="trainingGoal"
                value={form?.trainingGoal ?? ""}
                onChange={(e) => update("trainingGoal", e.target.value)}
                disabled={!form}
                className={inputClass}
              >
                <option value="">Not set</option>
                {TRAINING_GOALS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {saveError && (
            <p
              role="alert"
              className="mt-4 rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
            >
              {saveError}
            </p>
          )}

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={!form || saving}
              className="focus-ring h-10 rounded-full bg-[var(--shell-accent)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saved && (
              <span className="text-[13px] font-medium text-[var(--shell-success)]">
                Saved
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Training settings */}
      <section className="overflow-hidden rounded-[14px] border border-[var(--shell-border)] bg-card-surface">
        <h2 className="px-5 pt-5 text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-text-tertiary)] sm:px-6">
          Training
        </h2>
        <div className="mt-2">
          {TRAINING_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`focus-ring flex items-center justify-between px-5 py-3.5 text-[15px] text-[var(--shell-text-primary)] transition-colors hover:bg-[var(--shell-surface)] sm:px-6 ${
                i < TRAINING_LINKS.length - 1
                  ? "border-b border-[var(--shell-surface-elevated)]"
                  : ""
              }`}
            >
              {link.label}
              <ChevronRight size={16} className="text-[var(--shell-text-tertiary)]" />
            </Link>
          ))}
        </div>
      </section>

      {/* Sign out */}
      <section className="rounded-[14px] border border-[var(--shell-border)] bg-card-surface p-5 sm:p-6">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="focus-ring inline-flex items-center gap-2 rounded-sm text-[15px] font-medium text-[var(--shell-danger)] transition-opacity hover:opacity-80 disabled:opacity-60"
        >
          <LogOut size={16} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </section>
    </div>
  );
}
