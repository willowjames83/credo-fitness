// Shared fetch + formatting helpers for the score pages.
// All API routes speak the ApiSuccess/ApiError envelope from src/lib/types.ts.

import type { ApiError, ApiSuccess } from "@/lib/types";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** Same-origin cookie-authed fetch. Throws UnauthorizedError on 401. */
export async function fetchData<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (res.status === 401) throw new UnauthorizedError();

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof (payload as ApiError).error === "string"
        ? (payload as ApiError).error
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (typeof payload !== "object" || payload === null || !("data" in payload)) {
    throw new Error("Malformed response");
  }
  return (payload as ApiSuccess<T>).data;
}

export function postJson<T>(url: string, body: unknown = {}): Promise<T> {
  return fetchData<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** 72 → "72nd" */
export function ordinal(n: number): string {
  const v = Math.round(n);
  const mod100 = Math.abs(v) % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${v}th`;
  switch (Math.abs(v) % 10) {
    case 1:
      return `${v}st`;
    case 2:
      return `${v}nd`;
    case 3:
      return `${v}rd`;
    default:
      return `${v}th`;
  }
}

/** 198 → "3:18" */
export function formatMmss(totalSeconds: number): string {
  const secs = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** ISO date → "3 wks ago" style label (lowercase, for inline use). */
export function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "recently";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const wks = Math.floor(days / 7);
  if (wks < 9) return `${wks} wk${wks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(days / 365);
  return `${years} yr${years === 1 ? "" : "s"} ago`;
}

/** +3 / -2, rounded to at most one decimal. */
export function signed(n: number): string {
  const r = Math.round(n * 10) / 10;
  return r > 0 ? `+${r}` : `${r}`;
}

export function deltaColor(d: number): string {
  return d > 0 ? "#2D8A4E" : d < 0 ? "#C43B3B" : "#9E9EA3";
}
