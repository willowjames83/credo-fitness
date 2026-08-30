"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js in production only, so local dev never has to think about
 * a stale worker caching hot-reloaded pages. Renders nothing.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures (e.g. unsupported context) shouldn't break the app.
    });
  }, []);

  return null;
}
