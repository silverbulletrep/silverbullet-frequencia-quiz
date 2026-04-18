importScripts("https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyCFBctjzOxAXtZewJruT5lOmUS208i3OLA",
    authDomain: "silver-bullet-funil.firebaseapp.com",
    projectId: "silver-bullet-funil",
    storageBucket: "silver-bullet-funil.firebasestorage.app",
    messagingSenderId: "303108824842",
    appId: "1:303108824842:web:66d84e676306553036a4f3",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image || "/favicon.ico",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
