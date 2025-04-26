
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

// Initialize messaging only in browser environment and when not in an iframe (like Lovable preview)
if (typeof window !== 'undefined' && window.self === window.top) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase messaging initialization failed silently");
  }
}

export { messaging };

// Function to request notification permission - with better error handling
export const requestNotificationPermission = async () => {
  // Early return if messaging not available
  if (!messaging) {
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      try {
        // Don't repeatedly try to get a token if there was an auth error
        const tokenKey = 'fcm_token_last_attempt';
        const lastAttempt = localStorage.getItem(tokenKey);
        
        // Only attempt once every hour to avoid constant auth errors
        if (lastAttempt && (Date.now() - parseInt(lastAttempt, 10)) < 3600000) {
          return false;
        }
        
        localStorage.setItem(tokenKey, Date.now().toString());
        
        const token = await getToken(messaging, {
          vapidKey: 'BMkP2IlsKCXZJKLCKfmJSjnhKqQqB4x3QnOr54KtgXeYHx_FIlIkB2g_SyRXJD8otzB5ffY7r_9w4s8iWd7G8Xk'
        });
        return !!token;
      } catch (tokenError) {
        // Don't log auth errors to avoid console spam
        if ((tokenError as Error).message.includes('missing required authentication credential')) {
          return false;
        }
        console.error("Failed to get FCM token:", tokenError);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("Permission request error:", error);
    return false;
  }
};

// Listen for incoming messages with error handling
export const onMessageListener = () => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    if (Notification.permission === 'granted') {
      const { title, body } = payload.notification || { title: 'New notification', body: 'You have a new notification' };
      // Only show notification if we have permission to do so
      try {
        new Notification(title as string, { body: body as string });
      } catch (error) {
        console.error("Failed to display notification:", error);
      }
    }
  });
};

// Check if service worker is supported
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};
