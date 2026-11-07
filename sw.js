// Modo offline: guarda o app no iPad. Os DADOS ficam no banco do app (IndexedDB), não aqui.
const V = 'caixa-acai-v1';
const ARQ = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ARQ)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (pega atualizações quando há internet); sem internet usa a cópia guardada.
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const net = await Promise.race([fetch(r), new Promise((_, rej) => setTimeout(() => rej(new Error('t')), 3500))]);
      if (net && net.ok) { const c = await caches.open(V); c.put(r, net.clone()); }
      return net;
    } catch (_) {
      return (await caches.match(r, { ignoreSearch: true })) || (await caches.match('./index.html'));
    }
  })());
});
