
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
  console.error('[firebase-messaging-sw.js] Error initializing messaging:', error);
}
