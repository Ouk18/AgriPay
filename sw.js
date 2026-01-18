
const CACHE_NAME = 'agripay-v14';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
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

  // NE PAS CACHER SUPABASE OU L'AUTH
  if (url.hostname.includes('supabase.co') || url.pathname.includes('auth/v1')) {
    return;
  }

  // STRATÉGIE : NETWORK ONLY POUR LES SCRIPTS TSX/JS EN DEV/VERCEL
  if (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts')) {
    return;
  }

  // POUR LE RESTE : NETWORK FIRST
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && event.request.method === 'GET') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
