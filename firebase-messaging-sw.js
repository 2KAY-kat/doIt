// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Cache and assets configuration
const CACHE_NAME = 'doIt-v1';
const ASSETS_TO_CACHE = [
    '/doIt/',
    '/doIt/index.html',
    '/doIt/app.js',
    '/doIt/styles.css',
    '/doIt/icon-144x144.png',
    '/doIt/notification.wav'
];

// Firebase initialization
firebase.initializeApp({
    apiKey: "AIzaSyBPtoM1O5VpaAmjdNo8QTX5BLTgwtdXTY0",
    authDomain: "doit-2b4af.firebaseapp.com",
    projectId: "doit-2b4af",
    storageBucket: "doit-2b4af.appspot.com",
    messagingSenderId: "672989037293",
    appId: "1:672989037293:web:3af2552677820a945382e4",
    measurementId: "G-BQ2BQ96JTF"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = "doIt Reminder";
    const notificationOptions = {
        body: payload.data.text || "Time for your task!",
        icon: '/doIt/icon-144x144.png',
        badge: '/doIt/icon-144x144.png',
        tag: payload.data.id,
        requireInteraction: true,
        sound: '/doIt/notification.mp3',
        vibrate: [200, 100, 200],
        actions: [
            { action: 'complete', title: 'Mark Complete' },
            { action: 'snooze', title: 'Snooze 5m' },
            { action: 'edit', title: 'Edit Task' }
        ],
        renotify: true,
        data: payload.data,
        silent: false,
        timestamp: Date.now(),
        group: 'doIt-tasks'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Unified notification click handler
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const data = event.notification.data;
    
    switch(event.action) {
        case 'complete':
            event.waitUntil(markTaskComplete(data.id));
            break;
        case 'snooze':
            event.waitUntil(snoozeTask(data.id, 5));
            break;
        case 'edit':
            event.waitUntil(clients.openWindow(`/doIt/edit.html?id=${data.id}`));
            break;
        default:
            // Default click behavior
            event.waitUntil(
                clients.matchAll({ type: 'window', includeUncontrolled: true })
                    .then(clientList => {
                        for (const client of clientList) {
                            if (client.url.includes('/doIt') && 'focus' in client) {
                                return client.focus();
                            }
                        }
                        return clients.openWindow('/doIt');
                    })
            );
    }
});

// Service Worker lifecycle events
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    // Clean up old caches
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});

// Offline support
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(response => {
                    // Cache new resources
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                });
            })
            .catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/doIt/index.html');
                }
            })
    );
});

// Helper functions
async function markTaskComplete(taskId) {
    const reminders = await getReminders();
    const taskIndex = reminders.findIndex(r => r.id === taskId);
    
    if (taskIndex !== -1) {
        reminders[taskIndex].completed = true;
        reminders[taskIndex].notified = true;
        await saveReminders(reminders);
    }
}

async function snoozeTask(taskId, minutes) {
    const reminders = await getReminders();
    const taskIndex = reminders.findIndex(r => r.id === taskId);
    
    if (taskIndex !== -1) {
        const newTime = Date.now() + (minutes * 60 * 1000);
        reminders[taskIndex].time = newTime;
        reminders[taskIndex].notified = false;
        await saveReminders(reminders);
        
        return self.registration.showNotification("doIt Reminder", {
            body: `Snoozed: ${reminders[taskIndex].text}`,
            icon: '/doIt/icon-144x144.png',
            tag: taskId,
            requireInteraction: true,
            timestamp: newTime
        });
    }
}

async function getReminders() {
    return JSON.parse(await self.registration.storage.get('reminders') || '[]');
}

async function saveReminders(reminders) {
    await self.registration.storage.set('reminders', JSON.stringify(reminders));
}

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