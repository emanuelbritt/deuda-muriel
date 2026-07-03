// Service Worker — Libreta de Préstamo
// Permite instalar la app como PWA y usarla sin conexión.
const CACHE = "prestamo-v2";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Estrategia: red primero y, si no hay internet, se sirve desde caché
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
