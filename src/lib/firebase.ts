
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
  storageBucket: "taskblossom.firebasestorage.app",
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

// Initialize messaging only in browser environment
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase messaging failed to initialize:", error);
  }
}

export { messaging };

// Function to request notification permission
export const requestNotificationPermission = async () => {
  if (!messaging) return false;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BMkP2IlsKCXZJKLCKfmJSjnhKqQqB4x3QnOr54KtgXeYHx_FIlIkB2g_SyRXJD8otzB5ffY7r_9w4s8iWd7G8Xk' // This is a placeholder - you need to generate your own VAPID key
      });
      return !!token;
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
