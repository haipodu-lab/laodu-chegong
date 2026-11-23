const CACHE = "laodu-chegong-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/app.css",
  "./js/app.js",
  "./js/calc.js",
  "./data/cutting.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await cache.addAll(ASSETS.filter((item) => item !== "./"));
    const index = await cache.match("./index.html");
    if (index) await cache.put("./", index);
    await self.skipWaiting();
  }));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    if (event.request.mode === "navigate") {
      const index = await caches.match("./index.html");
      if (index) return index;
    }
    try {
      return await fetch(event.request);
    } catch (error) {
      const index = await caches.match("./index.html");
      if (index && event.request.mode === "navigate") return index;
      throw error;
    }
  })());
});
