import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Initialize Firebase with minimal config for client-side
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize App Check in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (recaptchaSiteKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true
      });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase App Check:', error);
  }
}

// Initialize Analytics only in production and if supported
let analytics: Promise<Analytics | null> = Promise.resolve(null);
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = isSupported().then(supported => 
    supported ? getAnalytics(app) : null
  ).catch(error => {
    console.error('Failed to initialize Firebase Analytics:', error);
    return null;
  });
}

export { app, auth, db, storage, analytics }; 