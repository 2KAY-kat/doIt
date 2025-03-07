// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging.js');

// Ensure firebase is available globally
const firebase = self.firebase;
// Initialize Firebase in the Service Worker
firebase.initializeApp({
    apiKey: "AIzaSyBPtoM1O5VpaAmjdNo8QTX5BLTgwtdXTY0",
    authDomain: "doit-2b4af.firebaseapp.com",
    projectId: "doit-2b4af",
    storageBucket: "doit-2b4af.appspot.com",
    messagingSenderId: "672989037293",
    appId: "1:672989037293:web:3af2552677820a945382e4",
    measurementId: "G-BQ2BQ96JTF"
});

// Get Firebase Messaging Instance
const messaging = firebase.messaging();

// Handle Background Messages
messaging.onBackgroundMessage(function(payload) {
    console.log("📩 Received background message: ", payload);

    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
        body: payload.notification?.body || "You have a new message.",
        icon: payload.notification?.icon || "/icon-144x144.png",
        badge: "/icon-144x144.png",
        vibrate: [200, 100, 200],
        actions: [
            { action: "open", title: "View" }
        ]
    };

    // Show Notification
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle Notification Clicks
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                if (clientList.length > 0) {
                    clientList[0].focus();
                } else {
                    self.clients.openWindow("/"); // Adjust this if your app URL is different
                }
            })
    );
});