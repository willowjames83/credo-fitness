// Shared fetch helper for the splits/gyms/preferences/share client pages.
// All API routes speak the ApiSuccess/ApiError envelope from src/lib/types.ts.

import type { ApiError, ApiSuccess } from "@/lib/types";

/** Same-origin cookie-authed fetch. Throws with the server's error message on failure. */
export async function fetchData<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);

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

export function putJson<T>(url: string, body: unknown): Promise<T> {
  return fetchData<T>(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function deleteJson<T>(url: string): Promise<T> {
  return fetchData<T>(url, { method: "DELETE" });
}

/** Copies text to the clipboard, falling back silently if unavailable. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
