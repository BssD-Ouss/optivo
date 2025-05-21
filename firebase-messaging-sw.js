// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDx9SRIC3MaylaBfOgDziQ6Sq05VxppitY",
  authDomain: "optivonotif.firebaseapp.com",
  projectId: "optivonotif",
  storageBucket: "optivonotif.firebasestorage.app",
  messagingSenderId: "1061061842114",
  appId: "1:1061061842114:web:1117f6272c260ef9ee575b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log("[Service Worker] Notification reçue en arrière-plan :", payload);
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192x192.png", // change si besoin
  });
});
