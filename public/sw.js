// Credo service worker — plain JS, no build step.
//
// Strategy:
//   - HTML navigations:        network-first -> cached copy of that page -> "/offline"
//   - same-origin static assets (/_next/static/, /icons/, fonts): cache-first,
//     stale-while-revalidate (serve cache immediately, refresh in the background)
//   - /api/*:                  never intercepted — network-only, no caching.
//     Auth cookies and mutations must always hit the real server.
//
// Bump CACHE_VERSION whenever precached assets or strategy change; old caches
// are removed on activate.

const CACHE_VERSION = "credo-v1";
const PRECACHE = `${CACHE_VERSION}-precache`;
const RUNTIME = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/icons/icon-192-maskable.svg",
  "/icons/icon-512-maskable.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== PRECACHE && key !== RUNTIME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/fonts/") ||
    /\.(?:woff2?|ttf|otf)$/.test(url.pathname)
  );
}

/** Network-first navigation: try the network, fall back to a cached copy of
 *  this exact page, then to the offline shell. Successful responses are
 *  cached so the fallback stays reasonably fresh. */
async function handleNavigation(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await caches.match("/offline");
    return offline || Response.error();
  }
}

/** Cache-first with stale-while-revalidate: serve the cached asset instantly
 *  if we have one, and always kick off a background fetch to refresh it. */
async function handleStaticAsset(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);

  const revalidate = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    // Fire and forget — refresh the cache for next time.
    revalidate;
    return cached;
  }

  const fresh = await revalidate;
  return fresh || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never touch the API — auth + mutations must always be live.
  if (isApiRequest(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
});
