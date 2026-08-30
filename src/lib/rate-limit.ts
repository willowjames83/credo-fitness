// rate-limit.ts
// A tiny in-memory fixed-window rate limiter.
//
// SCOPE / LIMITATIONS
// -------------------
// This limiter keeps counters in a process-local Map. That means:
//   • It is PER-INSTANCE. In a multi-instance / serverless deployment each
//     instance has its own counters, so the effective global limit is
//     (limit × instanceCount). It is a first line of defense against
//     brute-force and accidental floods, not a distributed guarantee.
//   • State is lost on restart / cold start.
//
// TODO(prod): back this with a shared store (Redis / Upstash) for a true
// cross-instance limit. The `RateLimiter` interface below is the seam: swap
// the in-memory implementation for a Redis-backed one without touching call
// sites. Keep `rateLimit()`'s signature identical when doing so.

export interface RateLimitOptions {
  /** Max number of allowed hits within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether this hit is allowed (i.e. under the limit). */
  ok: boolean;
  /** Remaining hits in the current window (never negative). */
  remaining: number;
  /** Seconds until the window resets — meaningful when `ok` is false. */
  retryAfterSec: number;
}

/** The seam a Redis/Upstash-backed implementation would satisfy. */
export interface RateLimiter {
  hit(key: string, options: RateLimitOptions): RateLimitResult;
}

interface WindowState {
  count: number;
  /** Epoch ms when the current window expires and the counter resets. */
  resetAt: number;
}

const store = new Map<string, WindowState>();

// Opportunistic cleanup so the Map cannot grow without bound under many
// distinct keys. We sweep expired entries at most once per interval.
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = 0;

function sweep(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, state] of store) {
    if (state.resetAt <= now) store.delete(key);
  }
}

/**
 * Record a hit against `key` and report whether it is allowed.
 *
 * Fixed-window semantics: the first hit for a key starts a window of
 * `windowMs`; subsequent hits within it increment the counter; once the
 * window elapses the counter resets on the next hit.
 */
export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();
  sweep(now);

  let state = store.get(key);
  if (!state || state.resetAt <= now) {
    state = { count: 0, resetAt: now + windowMs };
    store.set(key, state);
  }

  state.count += 1;

  const remaining = Math.max(0, limit - state.count);
  const ok = state.count <= limit;
  const retryAfterSec = ok ? 0 : Math.max(1, Math.ceil((state.resetAt - now) / 1000));

  return { ok, remaining, retryAfterSec };
}

/** Test/maintenance helper: clear all counters. */
export function __resetRateLimitStore(): void {
  store.clear();
  lastCleanup = 0;
}

/**
 * Best-effort client IP for rate-limit keying. Trusts `x-forwarded-for`
 * (first hop) as set by the deploy platform's proxy, falling back to
 * `x-real-ip` and finally a constant so keying still functions locally.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
