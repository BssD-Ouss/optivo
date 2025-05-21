// service-worker.js
self.addEventListener("install", () => {
  console.log("Service Worker installé");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("Service Worker activé");
  return self.clients.claim();
});

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
