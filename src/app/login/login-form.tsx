"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      const user = json?.data?.user;
      const next = searchParams.get("next");
      const dest =
        user?.onboardingCompleted === false
          ? "/onboarding"
          : next && next.startsWith("/")
            ? next
            : "/app/dashboard";
      window.location.assign(dest);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--shell-surface)] px-5 py-10 font-marketing">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="focus-ring rounded-sm text-xs font-bold uppercase tracking-[2.5px] text-[var(--shell-accent)] transition-opacity hover:opacity-80"
          >
            Credo
          </Link>
          <h1 className="mt-4 font-display text-[32px] leading-tight text-[var(--shell-text-primary)]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[var(--shell-text-secondary)]">
            Log in to keep building your Credo Score.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[14px] border border-[var(--shell-border)] bg-card-surface p-6 shadow-[0_1px_2px_rgba(26,26,30,0.04)] sm:p-8"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-medium text-[var(--shell-text-primary)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-[10px] border border-[var(--shell-border)] bg-card-surface px-3.5 text-[15px] text-[var(--shell-text-primary)] outline-none transition-colors placeholder:text-[var(--shell-text-tertiary)] focus:border-[var(--shell-accent)] focus:ring-2 focus:ring-[var(--shell-accent-light)]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-medium text-[var(--shell-text-primary)]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-[10px] border border-[var(--shell-border)] bg-card-surface px-3.5 text-[15px] text-[var(--shell-text-primary)] outline-none transition-colors placeholder:text-[var(--shell-text-tertiary)] focus:border-[var(--shell-accent)] focus:ring-2 focus:ring-[var(--shell-accent-light)]"
                placeholder="Your password"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring mt-6 h-11 w-full rounded-full bg-[var(--shell-accent)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--shell-text-secondary)]">
          New to Credo?{" "}
          <Link
            href="/register"
            className="focus-ring rounded-sm font-semibold text-[var(--shell-accent)] hover:underline"
          >
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-[13px] text-[var(--shell-text-tertiary)] transition-colors hover:text-[var(--shell-text-secondary)]"
          >
            <ArrowLeft size={14} />
            Back to credo
          </Link>
        </p>
      </div>
    </div>
  );
}
