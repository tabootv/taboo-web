/**
 * Firebase Configuration
 *
 * Initializes Firebase app and authentication providers for social login.
 * Used for Google and Apple OAuth via Firebase Authentication.
 *
 * All Firebase imports are dynamically loaded to keep them out of the initial bundle.
 * Firebase (~131 KB) is only downloaded when a user initiates social login.
 */

import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import type { Auth } from 'firebase/auth';

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

async function getFirebaseApp(): Promise<FirebaseApp> {
  if (cachedApp) {
    return cachedApp;
  }

  const { getApps, initializeApp } = await import('firebase/app');

  const apps = getApps();
  const existingApp = apps[0];
  if (existingApp) {
    cachedApp = existingApp;
    return cachedApp;
  }

  cachedApp = initializeApp(getFirebaseConfig());
  return cachedApp;
}

async function getFirebaseAuth(): Promise<Auth> {
  if (cachedAuth) {
    return cachedAuth;
  }

  const { getAuth } = await import('firebase/auth');
  cachedAuth = getAuth(await getFirebaseApp());
  return cachedAuth;
}

async function getGoogleProvider() {
  const { GoogleAuthProvider } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  return provider;
}

async function getAppleProvider() {
  const { OAuthProvider } = await import('firebase/auth');
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return provider;
}

export { getAppleProvider, getFirebaseApp, getFirebaseAuth, getGoogleProvider };
