
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: "AIzaSyDsF-cFll3pF77xzFTgcxBh8r5SRhBesmo",
  authDomain: "taskblossom.firebaseapp.com",
  projectId: "taskblossom",
  storageBucket: "taskblossom.firebasestorage.app",
  messagingSenderId: "503245445228",
  appId: "1:503245445228:web:5f3ab41fbda3893a906049",
  measurementId: "G-J5RBPEQT0P"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
let messaging;

try {
  messaging = firebase.messaging();

  // Optional background message handler
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/favicon.ico'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  // Handle quota exceeded errors specially
  if (error.code === 'messaging/token-subscribe-failed' && 
      error.message && 
      error.message.includes('Quota exceeded')) {
    console.warn('[firebase-messaging-sw.js] Firebase messaging quota exceeded. Notifications may be delayed.');
  } else {
    console.error('[firebase-messaging-sw.js] Error initializing messaging:', error);
  }
}

// Add event listener to handle fetch errors
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // Only intercept Firebase messaging requests
  if (url.includes('fcmregistrations.googleapis.com')) {
    event.respondWith(
      fetch(event.request).catch(error => {
        console.warn('[firebase-messaging-sw.js] FCM fetch error:', error);
        return new Response(JSON.stringify({
          error: 'Failed to communicate with FCM',
          status: 'error',
          message: error.message
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  }
});
