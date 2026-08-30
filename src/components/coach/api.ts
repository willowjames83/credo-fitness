// Client-side types + fetch helpers for /app/coach.
// Same-origin, cookie-authed; every route speaks the { data } / { error }
// envelope from src/lib/types.ts.

import type { ApiError, ApiSuccess } from "@/lib/types";

export type SenderType = "user" | "coach";

export interface CoachMessageDTO {
  id: string;
  senderType: string;
  content: string;
  createdAt: string;
}

export interface CoachThreadPreview {
  content: string;
  senderType: string;
  createdAt: string;
}

export interface CoachThreadDTO {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage: CoachThreadPreview | null;
}

export interface SendMessageResult {
  threadId: string;
  message: CoachMessageDTO;
  reply: CoachMessageDTO;
}

export class CoachApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CoachApiError";
    this.status = status;
  }
}

export class CoachUnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "CoachUnauthorizedError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (res.status === 401) throw new CoachUnauthorizedError();

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
    throw new CoachApiError(message, res.status);
  }

  if (typeof payload !== "object" || payload === null || !("data" in payload)) {
    throw new CoachApiError("Malformed response", res.status);
  }
  return (payload as ApiSuccess<T>).data;
}

export function listThreads(): Promise<{ threads: CoachThreadDTO[] }> {
  return request<{ threads: CoachThreadDTO[] }>("/api/coach/threads", {
    cache: "no-store",
  });
}

export function createThread(title?: string): Promise<{ thread: CoachThreadDTO }> {
  return request<{ thread: CoachThreadDTO }>("/api/coach/threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(title ? { title } : {}),
  });
}

export function getThread(
  id: string,
): Promise<{ thread: CoachThreadDTO; messages: CoachMessageDTO[] }> {
  return request<{ thread: CoachThreadDTO; messages: CoachMessageDTO[] }>(
    `/api/coach/threads/${encodeURIComponent(id)}`,
    { cache: "no-store" },
  );
}

export function sendMessage(args: {
  threadId?: string;
  content: string;
}): Promise<SendMessageResult> {
  return request<SendMessageResult>("/api/coach/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
}

export const SUGGESTED_PROMPTS: string[] = [
  "Why this workout today?",
  "How do I fix my squat depth?",
  "Am I ready to add weight to bench?",
  "How much protein do I actually need?",
];

export const MAX_MESSAGE_LENGTH = 2000;

/** "2:41 PM" — used under coach replies and in the thread list. */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** "Today", "Yesterday", "Mar 4" — thread-list timestamps. */
export function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(d)) / 86_400_000);
  if (days <= 0) return formatTime(iso);
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
