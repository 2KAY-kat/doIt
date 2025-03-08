// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPtoM1O5VpaAmjdNo8QTX5BLTgwtdXTY0",
  authDomain: "doit-2b4af.firebaseapp.com",
  projectId: "doit-2b4af",
  storageBucket: "doit-2b4af.appspot.com", // Make sure this is correct
  messagingSenderId: "672989037293",
  appId: "1:672989037293:web:3af2552677820a945382e4",
  measurementId: "G-BQ2BQ96JTF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);
const googleProvider = new GoogleAuthProvider();

// Configure persistence
auth.setPersistence('LOCAL');

export { auth, db, messaging, googleProvider };