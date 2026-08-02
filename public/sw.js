/*
 * International Sacred Calendar service worker.
 *
 * The site is a single statically exported page whose calendar mathematics run
 * entirely in the browser, so caching the shell and its assets makes the whole
 * converter usable offline. Bump CACHE_VERSION whenever the caching rules or
 * the precache list change; older versions are deleted on activation.
 */

const CACHE_VERSION = "isc-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const SHELL_URL = "/";

const PRECACHE_URLS = [
  SHELL_URL,
  "/site.webmanifest",
  "/favicon.svg",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/isc-logo-web.png",
];

// Paths that must always reach the network: development tooling and the
// image-optimization endpoint's own error states are not worth storing.
const BYPASS_PREFIXES = ["/__debug", "/@vite", "/@id", "/@fs", "/node_modules"];

function isCacheableResponse(response) {
  return Boolean(
    response &&
      response.ok &&
      (response.type === "basic" || response.type === "default"),
  );
}

async function precache() {
  const cache = await caches.open(SHELL_CACHE);
  await Promise.allSettled(
    PRECACHE_URLS.map((url) =>
      cache.add(new Request(url, { cache: "reload" })),
    ),
  );
}

async function dropOldCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith("isc-") && !key.startsWith(CACHE_VERSION))
      .map((key) => caches.delete(key)),
  );
}

async function handleNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      await cache.put(SHELL_URL, response.clone());
    }
    return response;
  } catch (error) {
    const cached =
      (await cache.match(request, { ignoreSearch: true })) ??
      (await cache.match(SHELL_URL));
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheableResponse(response)) {
    await cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const update = fetch(request)
    .then(async (response) => {
      if (isCacheableResponse(response)) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(update);
    return cached;
  }

  const response = await update;
  if (response) return response;
  throw new Error(`Unable to fetch ${request.url}`);
}

// Warms the asset cache with everything the page already loaded. The first
// visit runs before this worker controls the page, so without this the site
// would only become offline-ready on the second visit.
async function cacheReportedUrls(urls) {
  const cache = await caches.open(ASSET_CACHE);
  const wanted = urls
    .filter((url) => typeof url === "string")
    .map((url) => {
      try {
        return new URL(url, self.location.origin);
      } catch {
        return null;
      }
    })
    .filter(
      (url) =>
        url &&
        url.origin === self.location.origin &&
        !BYPASS_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)),
    )
    .slice(0, 200);

  await Promise.allSettled(
    wanted.map(async (url) => {
      if (await cache.match(url.href)) return;
      await cache.add(new Request(url.href, { cache: "no-cache" }));
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await dropOldCaches();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.headers.has("range")) return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (BYPASS_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Build output carries a content hash, so those files never change in place.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, event));
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (data.type === "CACHE_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(cacheReportedUrls(data.urls));
  }
});
