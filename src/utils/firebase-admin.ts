import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getPrivateConfig, getPublicConfig } from './secure-config';

function formatPrivateKey(key: string): string {
  // Check if the key is already properly formatted
  if (key.includes('-----BEGIN PRIVATE KEY-----')) {
    return key;
  }

  // Replace escaped newlines with actual newlines
  const formattedKey = key.replace(/\\n/g, '\n');

  // Add header and footer if missing
  if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    return `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
  }

  return formattedKey;
}

function validatePrivateKey(key: string): void {
  if (!key.includes('-----BEGIN PRIVATE KEY-----') || !key.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Invalid private key format. Must include BEGIN and END markers');
  }

  // Check for proper line breaks
  if (!key.includes('\n')) {
    throw new Error('Invalid private key format. Must contain proper line breaks');
  }

  // Log key length without exposing the key
  console.log(`Private key length: ${key.length} characters`);
}

export function initializeFirebaseAdmin() {
  try {
    // Return existing instance if already initialized
    if (getApps().length > 0) {
      return {
        app: getApp(),
        db: getFirestore(),
      };
    }

    // Get configuration
    const privateConfig = getPrivateConfig();
    const publicConfig = getPublicConfig();
    
    // Format and validate private key
    const privateKey = formatPrivateKey(privateConfig.FIREBASE_ADMIN_PRIVATE_KEY);
    validatePrivateKey(privateKey);

    // Initialize app with credentials
    const app = initializeApp({
      credential: cert({
        projectId: publicConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: privateConfig.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });

    // Initialize Firestore
    const db = getFirestore(app);

    return { app, db };
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
} 