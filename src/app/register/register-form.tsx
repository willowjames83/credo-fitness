"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      window.location.assign("/onboarding");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-[10px] border border-[var(--shell-border)] bg-white px-3.5 text-[15px] text-[var(--shell-text-primary)] outline-none transition-colors placeholder:text-[var(--shell-text-tertiary)] focus:border-[var(--shell-accent)] focus:ring-2 focus:ring-[var(--shell-accent-light)]";
  const labelClass =
    "mb-1.5 block text-[13px] font-medium text-[var(--shell-text-primary)]";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--shell-surface)] px-5 py-10 font-marketing">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-[2.5px] text-[var(--shell-accent)] transition-opacity hover:opacity-80"
          >
            Credo
          </Link>
          <h1 className="mt-4 font-display text-[32px] leading-tight text-[var(--shell-text-primary)]">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-[var(--shell-text-secondary)]">
            Train for the body you want today, and need at 80.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[14px] border border-[var(--shell-border)] bg-white p-6 shadow-[0_1px_2px_rgba(26,26,30,0.04)] sm:p-8"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-[10px] border border-[var(--shell-danger)]/25 bg-[#FDF1F1] px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 h-11 w-full rounded-full bg-[var(--shell-accent)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Start free"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--shell-text-secondary)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--shell-accent)] hover:underline"
          >
            Log in
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--shell-text-tertiary)] transition-colors hover:text-[var(--shell-text-secondary)]"
          >
            <ArrowLeft size={14} />
            Back to credo
          </Link>
        </p>
      </div>
    </div>
  );
}
