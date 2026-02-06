/**
 * Social Authentication Hook
 *
 * Provides Google and Apple OAuth login via Firebase Authentication.
 * Handles the OAuth popup flow and exchanges Firebase token for app session.
 */

'use client';

import { useState, useCallback } from 'react';
import { signInWithPopup, UserCredential } from 'firebase/auth';
import { getFirebaseAuth, googleProvider, appleProvider } from '@/shared/lib/firebase/config';
import { useAuthStore } from '@/shared/stores/auth-store';

export interface SocialAuthResult {
  success: boolean;
  requires_username?: boolean;
  error?: string;
}

export function useSocialAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firebaseLogin = useAuthStore((state) => state.firebaseLogin);

  const handleFirebaseAuth = useCallback(
    async (result: UserCredential, provider: 'google' | 'apple'): Promise<SocialAuthResult> => {
      try {
        // Get Firebase ID token
        const idToken = await result.user.getIdToken();

        // Exchange Firebase token for app session
        const response = await firebaseLogin({
          firebase_token: idToken,
          provider,
        });

        return {
          success: true,
          ...(response.requires_username !== undefined && {
            requires_username: response.requires_username,
          }),
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        throw new Error(message);
      }
    },
    [firebaseLogin]
  );

  const signInWithGoogle = useCallback(async (): Promise<SocialAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, googleProvider);
      return await handleFirebaseAuth(result, 'google');
    } catch (err) {
      // Handle Firebase-specific errors
      const error = err as { code?: string; message?: string };
      let message = 'Google sign-in failed';

      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Pop-up was blocked. Please allow pop-ups for this site.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'An account already exists with this email using a different sign-in method.';
      } else if (error.message) {
        message = error.message;
      }

      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [handleFirebaseAuth]);

  const signInWithApple = useCallback(async (): Promise<SocialAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, appleProvider);
      return await handleFirebaseAuth(result, 'apple');
    } catch (err) {
      const error = err as { code?: string; message?: string };
      let message = 'Apple sign-in failed';

      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Pop-up was blocked. Please allow pop-ups for this site.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'An account already exists with this email using a different sign-in method.';
      } else if (error.message) {
        message = error.message;
      }

      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [handleFirebaseAuth]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signInWithGoogle,
    signInWithApple,
    isLoading,
    error,
    clearError,
  };
}
