// Service Worker ligero para habilitar la instalación como PWA (Add to Home Screen)
const CACHE_NAME = "confeccion-pwa-v1";

self.addEventListener("install", (event) => {
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
