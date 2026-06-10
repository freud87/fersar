
const VERSION = "3.0.0";
const CACHE = `sarra-ferid-${VERSION}`;

const ASSETS = [
  "/fersar/",
  "/fersar/index.html",
  "/fersar/index.css",
  "/fersar/manifest.json",
  "/fersar/fersar2.png",
  "/fersar/photos/photo1.jpg",
  "/fersar/photos/photo2.jpg",
  "/fersar/photos/photo3.jpg",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
];

// Installation
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

// Activation
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch : réseau d'abord, cache en secours
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {

        const copy = response.clone();

        caches.open(CACHE).then(cache => {
          cache.put(event.request, copy);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );

});