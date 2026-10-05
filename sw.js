const CACHE = 'sten-v1';
const ARCHIVOS = [
  '/ambulancias-sten/',
  '/ambulancias-sten/index.html',
  '/ambulancias-sten/hlf-solicitud.html',
  '/ambulancias-sten/manifest.json'
];

// Instalar — guarda todos los archivos en cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

// Activar — limpia caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — sirve desde cache si no hay internet
self.addEventListener('fetch', e => {
  // Firebase y WhatsApp siempre van a internet
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('firebasejs') ||
      e.request.url.includes('wa.me') ||
      e.request.url.includes('gstatic')) {
    e.respondWith(fetch(e.request).catch(() => new Response('')));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy));
        return response;
      }).catch(() => caches.match('/ambulancias-sten/index.html'));
    })
  );
});
