const CACHE_NAME = 'budgeting-cache-v2';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => (name === CACHE_NAME ? undefined : caches.delete(name)))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const resp = await fetch(event.request);
        if (!resp || resp.status !== 200) return resp;
        const respToCache = resp.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, respToCache);
        return resp;
      } catch {
        return cached;
      }
    })()
  );
});
