
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsF-cFll3pF77xzFTgcxBh8r5SRhBesmo",
  authDomain: "taskblossom.firebaseapp.com",
  projectId: "taskblossom",
  storageBucket: "taskblossom.appspot.com",
  messagingSenderId: "503245445228",
  appId: "1:503245445228:web:5f3ab41fbda3893a906049",
  measurementId: "G-J5RBPEQT0P"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Messaging setup (for notifications)
let messaging: any = null;

// Initialize messaging only in browser environment and when not in an iframe (like Lovable preview)
if (typeof window !== 'undefined' && window.self === window.top) {
  try {
    messaging = getMessaging(app);
    console.log("Firebase messaging initialized successfully");
  } catch (error) {
    console.error("Firebase messaging failed to initialize:", error);
  }
}

export { messaging };

// Function to request notification permission
export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.log("Messaging is not available");
    return false;
  }
  
  try {
    console.log("Requesting notification permission...");
    const permission = await Notification.requestPermission();
    console.log("Permission status:", permission);
    
    if (permission === 'granted') {
      try {
        const token = await getToken(messaging, {
          vapidKey: 'BMkP2IlsKCXZJKLCKfmJSjnhKqQqB4x3QnOr54KtgXeYHx_FIlIkB2g_SyRXJD8otzB5ffY7r_9w4s8iWd7G8Xk'
        });
        console.log("Notification token received:", token ? "Success" : "Failed");
        return !!token;
      } catch (tokenError) {
        console.error("Error getting token:", tokenError);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

// Listen for incoming messages
export const onMessageListener = () => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log('Received message:', payload);
    
    // Display notification even when app is in foreground
    if (Notification.permission === 'granted') {
      const { title, body } = payload.notification || { title: 'New notification', body: 'You have a new notification' };
      new Notification(title as string, { body: body as string });
    }
  });
};

// Check if service worker is supported
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};
