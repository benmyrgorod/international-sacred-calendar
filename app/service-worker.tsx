"use client";

import { useEffect } from "react";

const SERVICE_WORKER_URL = "/sw.js";
const MAX_WARM_URLS = 200;

function warmCache(worker: ServiceWorker | null) {
  if (!worker) return;

  const urls = performance
    .getEntriesByType("resource")
    .map((entry) => entry.name)
    .filter((name) => name.startsWith(`${window.location.origin}/`))
    .slice(0, MAX_WARM_URLS);
  if (urls.length === 0) return;

  const send = () => worker.postMessage({ type: "CACHE_URLS", urls });
  if (worker.state === "activated") {
    send();
    return;
  }
  worker.addEventListener("statechange", () => {
    if (worker.state === "activated") send();
  });
}

/**
 * Registers the offline service worker. Rendering nothing keeps the static
 * export unchanged; the worker only exists in production builds so local
 * development never serves cached output.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          SERVICE_WORKER_URL,
          { scope: "/", updateViaCache: "none" },
        );
        if (cancelled) return;
        // On a first visit the page loaded before any worker controlled it, so
        // hand the new worker the assets this page already used.
        if (!navigator.serviceWorker.controller) {
          warmCache(
            registration.installing ??
              registration.waiting ??
              registration.active,
          );
        }
      } catch {
        // Offline support is an enhancement; a failed registration is not fatal.
      }
    };

    void register();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
