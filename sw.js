// Service worker mínimo: primero red, y si no hay conexión, la última copia guardada de la app.
// Los datos de Supabase nunca se guardan aquí.
const CACHE = 'rumbo-20261020223431';
const SHELL = ['./', 'index.html', 'styles.css?v=20261020223431', 'app.js?v=20261020223431', 'plantillas.js?v=20261020223431', 'config.js?v=20261020223431', 'manifest.json', 'icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }) // siempre pregunta al servidor si hay versión nueva
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request))
  );
});
