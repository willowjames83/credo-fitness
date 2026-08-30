// env.ts
// Centralized environment-variable validation and typed getters.
//
// The goal is fail-fast: in a real production runtime a missing or weak
// JWT_SECRET would silently mis-sign tokens, so we throw at import time
// rather than let the app boot in an unsafe state. Everywhere else we only
// warn, so local dev and — importantly — `next build` never hard-fail.
//
// IMPORTANT (build safety): `next build` sets placeholder envs and executes
// module code while collecting pages. Throwing there would break the build
// even though no request is ever served. We therefore gate the hard failure
// on being a genuine production *runtime* (NODE_ENV === 'production' AND not
// the production build phase). In every other context a problem is a warning.

/** True only when we are a running production server, not `next build`. */
function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === 'production' &&
    // Next sets NEXT_PHASE to 'phase-production-build' during `next build`.
    process.env.NEXT_PHASE !== 'phase-production-build'
  );
}

/** Minimum acceptable JWT secret length in production (bytes/chars). */
const MIN_JWT_SECRET_LENGTH = 32;

/**
 * Fail-fast in production runtime; warn otherwise. Keeps a single decision
 * point so build/dev never throw but a real prod boot does.
 */
function fail(message: string): void {
  const full = `[env] ${message}`;
  if (isProductionRuntime()) {
    throw new Error(full);
  }
  console.warn(`${full} (continuing: non-production or build phase)`);
}

function requireString(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    fail(`${name} is required but missing or empty.`);
    return value ?? '';
  }
  return value;
}

// ── DATABASE_URL ─────────────────────────────────────────────────────────────

let cachedDatabaseUrl: string | undefined;

export function getDatabaseUrl(): string {
  if (cachedDatabaseUrl === undefined) {
    cachedDatabaseUrl = requireString('DATABASE_URL');
  }
  return cachedDatabaseUrl;
}

// ── JWT_SECRET ───────────────────────────────────────────────────────────────

let cachedJwtSecret: string | undefined;

export function getJwtSecret(): string {
  if (cachedJwtSecret === undefined) {
    const value = process.env.JWT_SECRET;
    if (!value || value.trim() === '') {
      fail('JWT_SECRET is required but missing or empty.');
    } else if (value.length < MIN_JWT_SECRET_LENGTH) {
      fail(
        `JWT_SECRET is too weak: it must be at least ${MIN_JWT_SECRET_LENGTH} characters (got ${value.length}).`,
      );
    }
    cachedJwtSecret = value ?? '';
  }
  return cachedJwtSecret;
}

// ── ANTHROPIC_API_KEY (optional — coach feature degrades gracefully) ─────────

export function getAnthropicApiKey(): string | undefined {
  const value = process.env.ANTHROPIC_API_KEY;
  return value && value.trim() !== '' ? value : undefined;
}

// ── Eager validation ─────────────────────────────────────────────────────────
//
// Run the required-var checks once at import so a misconfigured production
// server fails fast at boot. `getAnthropicApiKey` stays optional but warns
// so operators notice the coach will be disabled.

getDatabaseUrl();
getJwtSecret();

if (!getAnthropicApiKey()) {
  console.warn(
    '[env] ANTHROPIC_API_KEY is not set — the AI coach feature will be disabled.',
  );
}
