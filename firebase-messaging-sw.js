importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "THE_API_KEY_#",
    authDomain: "THE_DOIT_DOMAIN.firebaseapp.com",
    projectId: "THE_DOIT_ID",
    storageBucket: "THE_DOIT_ID.appspot.com",
    messagingSenderId: "THE_SENDER_ID",
    appId: "THE_DOIT_ID",
    measurementId: "THE_DOIT_MEASUREMENT_ID" 
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    const title = payload.notification.title;
    const options = {
        body: payload.notification.body,
        icon: payload.notification.icon
    };

    self.registration.showNotification(title, options);
});