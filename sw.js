const CACHE_NAME = 'scripthub-v4-modular';
const APP_SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  // HTML always prefers the live version so site fixes appear immediately.
  if(req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }

  // Static assets use cache-first with a network fallback.
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
    if(res.ok && (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.json'))) {
      const copy=res.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
    }
    return res;
  })));
});
