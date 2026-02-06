/**
 * Firebase Configuration
 *
 * Initializes Firebase app and authentication providers for social login.
 * Used for Google and Apple OAuth via Firebase Authentication.
 */

import { FirebaseApp, FirebaseOptions, getApps, initializeApp } from 'firebase/app';
import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { Auth, getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

function getFirebaseConfig(): FirebaseOptions {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (!apiKey || !authDomain || !projectId || !measurementId) {
    throw new Error(
      'Missing Firebase configuration. Please set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variables.'
    );
  }

  const config: FirebaseOptions = {
    apiKey,
    authDomain,
    projectId,
    measurementId,
  };

  // Only add optional fields if they have values
  if (storageBucket) config.storageBucket = storageBucket;
  if (messagingSenderId) config.messagingSenderId = messagingSenderId;
  if (appId) config.appId = appId;
  if (measurementId) config.measurementId = measurementId;

  return config;
}

// Initialize Firebase app (singleton pattern)
let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedAnalytics: Analytics | null = null;

function getFirebaseApp(): FirebaseApp {
  if (cachedApp) {
    return cachedApp;
  }

  const apps = getApps();
  const existingApp = apps[0];
  if (existingApp) {
    cachedApp = existingApp;
    return cachedApp;
  }

  cachedApp = initializeApp(getFirebaseConfig());
  return cachedApp;
}

function getFirebaseAuth(): Auth {
  if (cachedAuth) {
    return cachedAuth;
  }

  cachedAuth = getAuth(getFirebaseApp());
  return cachedAuth;
}

// Google OAuth provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Apple OAuth provider
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (cachedAnalytics) return cachedAnalytics;
  if (globalThis.window === undefined) return null;
  const supported = await isSupported();
  if (!supported) return null;
  cachedAnalytics = getAnalytics(getFirebaseApp());
  return cachedAnalytics;
}

export { appleProvider, getFirebaseAnalytics, getFirebaseApp, getFirebaseAuth, googleProvider };
