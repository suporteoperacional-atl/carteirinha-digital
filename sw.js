const CACHE_NAME = 'carteirinha-atl-v2';

// Faz cache APENAS dos assets estáticos, nunca da página HTML
const urlsToCache = [
  './logo_branco.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  // Nunca faz cache do index.html — sempre busca da rede para manter os parâmetros
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para assets estáticos: cache primeiro, rede como fallback
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
