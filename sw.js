const CACHE_NAME = "jeda-owner-v45";
const ASSETS = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./logo-header.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// NETWORK-FIRST: selalu coba ambil versi terbaru dulu dari server (online),
// baru fallback ke cache kalau offline/gagal. Sebelumnya cache-first bikin
// app kadang jalan pakai versi LAMA sampai user refresh manual -- sekarang
// versi terbaru langsung kepakai begitu online, cache cuma jaring pengaman
// offline.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
