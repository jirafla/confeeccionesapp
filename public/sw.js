// Service Worker para PWA y Notificaciones Push nativas
const CACHE_NAME = "confeccion-pwa-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Passthrough de red para mantener datos de producción siempre en tiempo real
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Escuchar eventos push estándar
self.addEventListener("push", (event) => {
  let payload = {
    title: "Confección — Alerta de Producción",
    body: "Tienes entregas de talleres pendientes para revisar hoy.",
    url: "/",
    tag: "confeccion-push",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: payload.tag,
      vibrate: [200, 100, 200],
      data: { url: payload.url || "/" },
    })
  );
});

// Escuchar mensajes desde el cliente para disparar notificaciones nativas del sistema
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "SHOW_NOTIFICATION") return;

  const { title, body, url, tag } = event.data.payload || {};
  if (!title) return;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: tag || `confeccion-${Date.now()}`,
      vibrate: [200, 100, 200],
      data: { url: url || "/" },
    })
  );
});

// Al tocar la notificación nativa, enfocar la pestaña o abrir la orden correspondiente
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
            return client;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
