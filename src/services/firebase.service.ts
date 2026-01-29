import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
// Ensure Auth module is loaded for side-effects
import 'firebase/auth';
import { Auth, initializeAuth, getAuth, indexedDBLocalPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

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

// Robust Auth Initialization
let authInstance: Auth;

try {
  // Try to initialize with persistence (Preferred for Hybrid/Mobile)
  authInstance = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence]
  });
} catch (e: any) {
  // If already initialized, or if persistence is blocked (e.g. Incognito/Iframes), use getAuth
  if (e.code === 'auth/already-initialized') {
    authInstance = getAuth(app);
  } else {
    // Fallback for environment restriction errors
    try {
        authInstance = getAuth(app);
    } catch (finalError) {
        console.error('Firebase Auth Init Error:', finalError);
        throw finalError;
    }
  }
}

export const auth = authInstance;

// Initialize and export the Firestore instance for use in services.
export const firestore: Firestore = getFirestore(app);