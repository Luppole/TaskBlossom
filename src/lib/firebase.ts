
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
let messagingSupported = false;

// Initialize messaging only in browser environment and when not in an iframe (like Lovable preview)
if (typeof window !== 'undefined' && window.self === window.top) {
  try {
    messaging = getMessaging(app);
    messagingSupported = true;
    console.log("Firebase messaging initialized successfully");
  } catch (error) {
    console.error("Firebase messaging failed to initialize:", error);
    messagingSupported = false;
  }
}

export { messaging, messagingSupported };

// Track permission state to prevent repeated requests
let notificationPermissionChecked = false;
let notificationPermissionGranted = false;
let lastTokenRequestTime = 0;
const TOKEN_REQUEST_COOLDOWN = 60000; // 1 minute cooldown between token requests

// Function to request notification permission
export const requestNotificationPermission = async () => {
  // If messaging is not available or we've already checked permission, don't proceed
  if (!messaging || notificationPermissionChecked) {
    return notificationPermissionGranted;
  }
  
  try {
    console.log("Requesting notification permission...");
    const permission = await Notification.requestPermission();
    console.log("Permission status:", permission);
    
    notificationPermissionChecked = true;
    
    if (permission === 'granted') {
      // Check if we're within the cooldown period
      const now = Date.now();
      if (now - lastTokenRequestTime < TOKEN_REQUEST_COOLDOWN) {
        console.log('Skipping token request due to cooldown period');
        return notificationPermissionGranted;
      }
      
      lastTokenRequestTime = now;
      
      try {
        const token = await getToken(messaging, {
          vapidKey: 'BMkP2IlsKCXZJKLCKfmJSjnhKqQqB4x3QnOr54KtgXeYHx_FIlIkB2g_SyRXJD8otzB5ffY7r_9w4s8iWd7G8Xk'
        }).catch(error => {
          // Handle quota exceeded error (429)
          if (error.code === 'messaging/token-subscribe-failed') {
            if (error.message && error.message.includes('Quota exceeded')) {
              console.log('Firebase messaging token quota exceeded. Will retry later.');
            } else {
              console.log('Firebase messaging token acquisition failed, likely due to missing credentials. This is expected in development environments.');
            }
          } else {
            console.error("Error getting messaging token:", error);
          }
          return null;
        });
        
        notificationPermissionGranted = !!token;
        return notificationPermissionGranted;
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
