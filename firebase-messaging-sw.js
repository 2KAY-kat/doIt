// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Ensure firebase is available globally
const firebase = self.firebase;
// Initialize Firebase in the Service Worker
firebase.initializeApp({
    apiKey: "AIzaSyBPtoM1O5VpaAmjdNo8QTX5BLTgwtdXTY0",
    authDomain: "doit-2b4af.firebaseapp.com", // Use Firebase domain, not GitHub
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
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = "doIt Reminder";
    const notificationOptions = {
        body: payload.data.text || "Time for your task!",
        icon: '/doIt/icon-144x144.png',
        badge: '/doIt/icon-144x144.png',
        tag: payload.data.id,
        requireInteraction: true // Keep notification until user interacts
    };

    // Show Notification
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle Notification Clicks
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const data = event.notification.data;

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes('/doIt') && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow('/doIt');
            })
    );
});

// Handle periodic sync for checking reminders
self.addEventListener('periodicsync', async (event) => {
    if (event.tag === 'check-reminders') {
        const reminders = JSON.parse(await self.registration.storage.get('reminders') || '[]');
        const now = new Date().getTime();

        reminders.forEach((reminder, index) => {
            if (reminder.time <= now && !reminder.notified) {
                self.registration.showNotification("doIt Reminder", {
                    body: `It's time to: ${reminder.text}`,
                    icon: '/doIt/icon-144x144.png',
                    tag: reminder.id,
                    requireInteraction: true
                });
                reminder.notified = true;
            }
        });

        await self.registration.storage.set('reminders', JSON.stringify(reminders));
    }
});

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
});