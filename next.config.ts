import type { NextConfig } from "next";

/**
 * Content-Security-Policy — shipped REPORT-ONLY (non-enforcing).
 *
 * WHY report-only: a strict enforced CSP can silently break a page (blocked
 * scripts/styles/images) and this policy cannot be fully browser-verified in
 * the current environment. Shipping it as `Content-Security-Policy-Report-Only`
 * lets the policy ride along and surface violations (via reporting, once a
 * report endpoint is wired) WITHOUT risking a broken app. Nothing is blocked.
 *
 * The policy below intentionally allows `'unsafe-inline'` for scripts and
 * styles because Next.js injects inline bootstrap/hydration scripts and the
 * app uses inline styles (Tailwind + runtime styles).
 *
 * HOW TO PROMOTE TO ENFORCED (follow-up):
 *   1. Adopt a per-request nonce for Next's inline scripts (middleware sets a
 *      `nonce`, layout reads it) and replace `script-src 'self' 'unsafe-inline'`
 *      with `script-src 'self' 'nonce-<nonce>' 'strict-dynamic'`.
 *   2. Add a `report-uri` / `report-to` endpoint and watch the report-only
 *      stream for a clean period under real traffic.
 *   3. Rename the header key from `Content-Security-Policy-Report-Only` to
 *      `Content-Security-Policy` to begin enforcing.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' required until a nonce-based enforced policy lands (see above).
  "script-src 'self' 'unsafe-inline'",
  // Inline styles + Tailwind-generated styles.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

// Security headers applied to every route. CORS for /api is handled by
// middleware / route handlers and is deliberately not duplicated here.
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Report-only: rides along without enforcing. See comment block above.
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
