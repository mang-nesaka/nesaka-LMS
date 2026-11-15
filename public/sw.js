self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : '' };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'LMS Nesaka', {
      body: payload.body || 'Ada informasi baru di LMS Nesaka.',
      icon: '/nesaka-app-icon-192.png',
      badge: '/nesaka-app-icon-192.png',
      data: { url: payload.url || '/dashboard' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const requestedUrl = new URL(event.notification.data?.url || '/dashboard', self.location.origin);
  const targetUrl = requestedUrl.origin === self.location.origin
    ? `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`
    : '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => new URL(client.url).origin === self.location.origin);
      if (existingClient) {
        return existingClient.navigate(targetUrl).then(() => existingClient.focus());
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});