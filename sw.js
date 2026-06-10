const CACHE = 'sarra-ferid-v1';

const ASSETS = [
  '/fersar/',
  '/fersar/index.html',
  '/fersar/index.css',
  '/fersar/manifest.json',
  '/fersar/fersar2.png',
  '/fersar/photos/photo1.jpg',
  '/fersar/photos/photo2.jpg',
  '/fersar/photos/photo3.jpg',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css'
];

// Installation : mise en cache des assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : cache first, fallback réseau
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});