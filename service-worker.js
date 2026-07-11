self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    await self.registration.unregister();
    const clientsList = await self.clients.matchAll({ type: 'window' });
    for (const client of clientsList) {
      client.navigate(client.url);
    }
  })());
});

self.addEventListener('fetch', () => {
  // Intentionally no fetch interception. The service worker removes itself
  // to prevent stale cached HTML/CSS/JS from hiding the published website.
});
