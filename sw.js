/*
====================================================
    SERVICE WORKER
====================================================

Caches the static "app shell" (HTML, CSS, JS, icons)
so the app loads instantly on repeat visits and has
basic offline resilience for the shell itself.

Supabase requests are NEVER cached — this app is
data-driven, and stale weight/profile data would be
actively misleading. Those always go straight to the
network.

====================================================
*/

const CACHE_NAME = "deficit-shell-v1";

const SHELL_FILES = [
  "/",
  "/index.html",
  "/signup.html",
  "/profile.html",
  "/weight.html",
  "/workouts.html",
  "/calories.html",
  "/settings.html",
  "/css/styles.css",
  "/js/supabase.js",
  "/js/auth.js",
  "/js/login.js",
  "/js/signup.js",
  "/js/profile.js",
  "/js/weight.js",
  "/js/settings.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

/*
====================================================
    Install — pre-cache the shell
====================================================
*/

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

/*
====================================================
    Activate — clean up old cache versions
====================================================
*/

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/*
====================================================
    Fetch — network-first for the shell,
    always-network for Supabase and other APIs
====================================================
*/

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never intercept Supabase (or any non-GET) requests.
  // Auth, profile, and weight data must always be live.
  if (url.hostname.endsWith(".supabase.co") || event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Keep the cache fresh with whatever we just fetched
        const responseClone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Offline (or request failed) — fall back to the cached shell
        return caches.match(event.request);
      }),
  );
});
