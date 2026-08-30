// Fetch + formatting helpers shared by the cardio / nutrition / stability
// pages. All pillar routes speak the ApiSuccess/ApiError envelope.

import type { ApiError, ApiSuccess } from "@/lib/types";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** Same-origin cookie-authed fetch. Throws UnauthorizedError on 401. */
export async function apiGet<T>(url: string, init?: RequestInit): Promise<T> {
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

export function apiPost<T>(url: string, body: unknown = {}): Promise<T> {
  return apiGet<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function apiDelete<T>(url: string): Promise<T> {
  return apiGet<T>(url, { method: "DELETE" });
}

/** Send an unauthenticated visitor to the login screen. */
export function redirectToLogin(): void {
  window.location.href = "/login";
}

// ── Formatting ──────────────────────────────────────────────────────────────

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** ISO day → "Aug 4" (UTC, so it matches the server's day boundaries). */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** ISO day → "M" / "T" / "W" … single letter, UTC. */
export function weekdayInitial(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return WEEKDAYS[d.getUTCDay()].slice(0, 1);
}

/** ISO day → "Mon", UTC. */
export function weekdayShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return WEEKDAYS[d.getUTCDay()].slice(0, 3);
}

/** ISO instant → "Today", "Yesterday", or "Aug 4". */
export function dayLabel(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";
  const startOf = (d: Date) =>
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const days = Math.round((startOf(new Date()) - startOf(then)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return shortDate(iso);
}

/** ISO instant → "7:15 AM" in the viewer's local zone. */
export function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

/** 3200 → "3.2 km"; smaller distances stay in metres. */
export function distanceLabel(metres: number): string {
  if (metres >= 1000) {
    const km = metres / 1000;
    return `${km >= 10 ? km.toFixed(0) : km.toFixed(1)} km`;
  }
  return `${metres} m`;
}

/** 95 → "1h 35m"; under an hour stays in minutes. */
export function minutesLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Join a list into readable prose: ["Wed","Fri"] → "Wed and Fri". */
export function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
