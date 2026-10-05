// MedSafe service worker - offline app shell + installable PWA
const VERSION = 'medsafe-v2.1';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const PRECACHE_URLS = ['/', '/index.html', '/manifest.json', '/pwa-192x192.png', '/pwa-512x512.png'];

// The only cross-origin hosts we may cache. Everything else (Supabase auth
// and REST above all) is passed straight through to the network: caching an
// authenticated response would replay stale data to a signed-in user and
// write health information into Cache Storage on a shared device.
const CACHEABLE_CROSS_ORIGIN = new Set(['fonts.gstatic.com', 'fonts.googleapis.com']);

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigations: network first, fall back to the cached shell so the app
  // opens with no connection.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html').then(cached => cached || caches.match('/')))
    );
    return;
  }

  // Hashed build assets and icons: cache first (immutable filenames).
  const isCacheableAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/assets/') ||
      /\.(png|svg|jpg|jpeg|webp|ico|woff2?|css|js)$/.test(url.pathname));

  if (isCacheableAsset) {
    event.respondWith(
      caches.match(request).then(
        cached =>
          cached ||
          fetch(request).then(response => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Anything else cross-origin: never cached, straight to the network.
  if (url.origin !== self.location.origin) {
    if (!CACHEABLE_CROSS_ORIGIN.has(url.hostname)) return;

    // Allow-listed hosts (remote fonts): cache first, fall back to network.
    event.respondWith(
      caches.match(request).then(
        cached =>
          cached ||
          fetch(request)
            .then(response => {
              if (response.ok) {
                const copy = response.clone();
                caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
              }
              return response;
            })
            .catch(() => cached)
      )
    );
  }
});

// Dose reminder push (used if a push subscription is ever registered)
self.addEventListener('push', event => {
  let data = { title: 'MedSafe dose reminder', body: 'Time to take your scheduled medication.' };
  try {
    if (event.data) data = event.data.json();
  } catch (err) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: data.tag || 'medsafe-dose',
      requireInteraction: true
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
