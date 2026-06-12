// ⬇️ Ganti versi ini setiap kali ada update index.html
const CACHE_NAME = 'rapor-pwa-v4';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Install: simpan ke cache
self.addEventListener('install', event => {
  // skipWaiting = langsung aktif tanpa menunggu tab ditutup
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate: hapus cache lama, ambil alih semua klien
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim()) // langsung kontrol semua tab
  );
});

// Fetch: network-first untuk index.html, cache-first untuk aset lain
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // index.html selalu ambil dari network dulu (biar selalu fresh)
  if (url.pathname.endsWith('index.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Aset lain: cache-first
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
