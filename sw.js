/* Munshi Agro — service worker
   Network-first for same-origin files (so uploads show up right away),
   with an offline fallback from the cache. Firebase / Google Fonts
   (cross-origin) are never touched. */
const CACHE = "munshi-agro-v1";
const SHELL = [
  "./", "./index.html", "./style.css", "./script.js",
  "./munshi_agro_tracker.html",
  "./munshi-agro-logo.png", "./favicon.png", "./apple-touch-icon.png",
  "./icon-192.png", "./icon-512.png",
  "./manifest.webmanifest", "./manifest-tracker.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(SHELL.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => {
          if (hit) return hit;
          if (req.mode === "navigate") return caches.match("./index.html");
          return Response.error();
        })
      )
  );
});
