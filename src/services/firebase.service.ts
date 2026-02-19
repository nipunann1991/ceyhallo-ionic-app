
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
// This side-effect import is still a good safety measure to ensure the auth module is registered.
import 'firebase/auth';
import { Auth, initializeAuth, indexedDBLocalPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA9t9nkALn-Y8XobFFCX4YtpE3N8qSPO2Y",
  authDomain: "ceyhallo-89e40.firebaseapp.com",
  databaseURL: "https://ceyhallo-89e40-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ceyhallo-89e40",
  storageBucket: "ceyhallo-89e40.appspot.com",
  messagingSenderId: "253346274750",
  appId: "1:253346274750:web:f511016dfe4946392b2def",
  measurementId: "G-CJK43PN7F7"
};

// Initialize Firebase at the module level.
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use initializeAuth for better control in hybrid environments like Ionic.
// This allows specifying persistence, which is crucial for a good user experience,
// ensuring users stay logged in across app sessions.
export const auth: Auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence]
});

// Initialize and export the Firestore instance for use in services.
export const firestore = getFirestore(app);
