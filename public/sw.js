// Waraira — Service Worker. Objetivo: que la app abra y funcione SIN señal.
// Estrategia: network-first con respaldo en caché. Los datos viven en IndexedDB
// (no aquí); este SW solo cachea el "app shell" y assets ya visitados.

const CACHE = "waraira-v1";
const ESENCIALES = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ESENCIALES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // no interferir con terceros

  e.respondWith(
    fetch(req)
      .then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
        return res;
      })
      .catch(async () => {
        const cacheado = await caches.match(req);
        if (cacheado) return cacheado;
        // Fallback de navegación: servir la raíz cacheada (SPA-like).
        if (req.mode === "navigate") {
          const raiz = await caches.match("/");
          if (raiz) return raiz;
        }
        return new Response("Sin conexión y sin copia en caché.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }),
  );
});
