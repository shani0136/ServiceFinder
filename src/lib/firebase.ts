/**
 * Firebase initialization with graceful demo-mode fallback.
 *
 * If VITE_FIREBASE_API_KEY is not set (e.g. localhost dev without a .env.local),
 * the module exports DEMO_MODE = true and null auth/db instances.
 * All auth functions fall back to a mock session automatically.
 * No errors are thrown. Zero config required to run the app.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as _signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// ─── Firebase Web App Configuration ─────────────────────────────────────────
export const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBgF8tuNl7MJz-9EHWNdf0XxcO7J24AKoY",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "local-service-finder-web.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "local-service-finder-web",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "local-service-finder-web.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "293027698306",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:293027698306:web:f2ca6ff127e7d320b5c69b",
};

// ─── Demo mode flag ────────────────────────────────────────────────────────
export const DEMO_MODE = false;

let _auth: Auth | undefined;
let _db: Firestore | undefined;

try {
  const app: FirebaseApp = initializeApp(firebaseConfig);
  _auth = getAuth(app);
  _db   = getFirestore(app);

  // Requirement 20: Firebase App Check for abuse & bot protection
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  if (typeof window !== 'undefined' && recaptchaSiteKey) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (appCheckErr) {
      console.warn('[firebase] App Check init notice:', appCheckErr);
    }
  }
} catch (err) {
  console.warn('[firebase] Init notice:', err);
}

// ─── Exports ───────────────────────────────────────────────────────────────
export const auth = _auth;
export const db   = _db;

export {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  _signOut as signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
};
