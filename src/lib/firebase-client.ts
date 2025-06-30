import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
    // Check if all config values are present
    if (Object.values(firebaseConfig).every(value => value)) {
        app = initializeApp(firebaseConfig);
        console.log("Firebase client initialized successfully.");
    } else {
        console.warn("Firebase client config is incomplete. Firebase client features will be disabled. Please add all NEXT_PUBLIC_FIREBASE_* variables to your .env file.");
    }
} else {
    app = getApp();
}

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;


export { app, auth, db };
