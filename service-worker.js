const CACHE_NAME = "interventions-cache-v1";
const FILES_TO_CACHE = [
  "/", // attention à adapter selon ton cas
  "/index.html",
  "/splash.html",
  "/profile.html",
  "/style.css",
  "/app.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/default-avatar.png",
  "/manifest.json"
];

// INSTALL
self.addEventListener("install", (event) => {
  console.log("Service Worker installé");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Mise en cache des fichiers...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  console.log("Service Worker activé");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Suppression du cache :", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// NOTIFICATIONS PUSH (inchangé)
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || "Notification", {
    body: data.body || "",
    icon: "icons/icon-192.png",
    vibrate: [200, 100, 200],
    data: { url: "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
