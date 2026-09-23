const CACHE = "kasir-umkm-v1";
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(["./", "index.html", "kasir.html", "admin.html", "struk.html", "js/config.js", "js/auth.js", "js/offline.js"]))));
self.addEventListener("fetch", (event) => event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; }).catch(() => cached))));
