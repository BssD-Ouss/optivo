// firebase-config.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDx9SRIC3MaylaBfOgDziQ6Sq05VxppitY",
  authDomain: "optivonotif.firebaseapp.com",
  projectId: "optivonotif",
  storageBucket: "optivonotif.firebasestorage.app",
  messagingSenderId: "1061061842114",
  appId: "1:1061061842114:web:1117f6272c260ef9ee575b"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
