const CACHE_NAME = 'carteirinha-atl-v1';
const urlsToCache = [
  '.',
  './index.html',
  './logo_branco.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// Instala e faz cache dos arquivos principais
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// Serve do cache quando offline, busca na rede quando online
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      return fetch(event.request).catch(function() {
        return caches.match('./index.html');
      });
    })
  );
});

// Atualiza cache quando há nova versão
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
});
