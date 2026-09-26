const CACHE_NAME = "bus-board-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./icon-192.png",
    "./icon-512.png",
    "./fonts/JetBrainsMonoNerdFontMono-Regular.ttf",
    "./schedule-119.csv",
    "./schedule-127.csv"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});
self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);

    if (url.pathname.endsWith(".csv")) {
        event.respondWith(
            fetch(event.request, { cache: "no-store" })
                .then(response => {
                    const responseClone = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseClone));

                    return response;
                })
                .catch(() => caches.match(event.request))
        );

        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => cachedResponse || fetch(event.request))
    );
});

