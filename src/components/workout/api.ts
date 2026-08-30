// Client-side fetch helpers for the /app pages.
// All API routes are same-origin, cookie-authed, and wrap payloads in
// { data } on success or { error } on failure (see ApiSuccess/ApiError).

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);

  if (res.status === 401) {
    window.location.assign("/login");
    throw new ApiRequestError("Not signed in", 401);
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // fall through — handled below
  }

  if (body && typeof body === "object" && "error" in body) {
    throw new ApiRequestError(
      String((body as { error: unknown }).error),
      res.status,
    );
  }
  if (!res.ok || !body || typeof body !== "object" || !("data" in body)) {
    throw new ApiRequestError(`Request failed (${res.status})`, res.status);
  }
  return (body as { data: T }).data;
}

export function getJSON<T>(url: string): Promise<T> {
  return request<T>(url, { cache: "no-store" });
}

export function sendJSON<T>(
  url: string,
  method: "POST" | "PUT",
  bodyObj?: unknown,
): Promise<T> {
  return request<T>(url, {
    method,
    headers: bodyObj !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: bodyObj !== undefined ? JSON.stringify(bodyObj) : undefined,
  });
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
