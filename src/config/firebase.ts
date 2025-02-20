import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { config } from './env';

// Declare app check debug token for development
if (typeof window !== 'undefined' && config.app.isDev) {
  // @ts-ignore
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
  measurementId: config.analytics.googleAnalyticsId,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize App Check in non-development environments
if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(config.firebase.recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only in production and if supported
const analytics: Promise<Analytics | null> | null = typeof window !== 'undefined' 
  ? isSupported().then((supported: boolean) => supported ? getAnalytics(app) : null) 
  : null;

export { app, auth, db, storage, analytics }; 