
const CACHE_NAME = 'agripay-v12';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // BYPASS TOTAL POUR SUPABASE ET L'AUTH
  if (url.hostname.includes('supabase.co') || url.pathname.includes('auth/v1') || event.request.method !== 'GET') {
    return;
  }

  // STRATÉGIE : NETWORK FIRST (POUR LE JS/HTML)
  // On tente de récupérer le contenu frais, si échec (offline), on prend le cache.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si c'est un fichier statique de notre app, on met à jour le cache
        if (networkResponse && networkResponse.status === 200 && url.origin === location.origin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Mode Hors-ligne
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // Si rien en cache pour une navigation, on renvoie index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
