// Service Worker — Carteirinha Digital Atlântico Shopping
const CACHE_NAME = 'carteirinha-v1';

// Arquivos estáticos que ficam em cache (shell do app)
const STATIC_FILES = [
  '/carteirinha-digital/',
  '/carteirinha-digital/index.html',
  '/carteirinha-digital/logo_branco.png'
];

// ── INSTALL: faz cache dos arquivos estáticos ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

// ── ACTIVATE: limpa caches antigos ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH: estratégia por tipo de recurso ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Requisições para Google Sheets (dados da carteirinha) → sempre rede, nunca cache
  if (url.hostname.includes('google.com') || url.hostname.includes('googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Fontes, QR code, foto do Drive → rede com fallback para cache
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('quickchart.io') ||
    url.hostname.includes('qrserver.com') ||
    url.hostname.includes('drive.google.com') ||
    url.hostname.includes('googleusercontent.com')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Arquivos estáticos do próprio app → cache primeiro, rede como fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Salva no cache se for uma resposta válida
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
