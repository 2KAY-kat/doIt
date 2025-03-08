// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPtoM1O5VpaAmjdNo8QTX5BLTgwtdXTY0",
  authDomain: "doit-2b4af.firebaseapp.com",
  projectId: "doit-2b4af",
  storageBucket: "doit-2b4af.appspot.com",
  messagingSenderId: "672989037293",
  appId: "1:672989037293:web:3af2552677820a945382e4",
  measurementId: "G-BQ2BQ96JTF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, messaging, getToken, auth, googleProvider, signInWithPopup, onAuthStateChanged };