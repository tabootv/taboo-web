'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth-store';

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfAuthenticated?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo, redirectIfAuthenticated } = options;
  const router = useRouter();

  const {
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
    error,
    login,
    register,
    firebaseLogin,
    logout,
    fetchUser,
    updateUser,
    clearError,
  } = useAuthStore();

  // Handle redirects — only after initialization completes
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // Redirect to login if not authenticated and redirectTo is set
    if (redirectTo && !isAuthenticated) {
      router.push(redirectTo);
    }

    // Redirect away from auth pages if already authenticated
    if (redirectIfAuthenticated && isAuthenticated) {
      router.push(redirectIfAuthenticated);
    }
  }, [isInitialized, isLoading, isAuthenticated, redirectTo, redirectIfAuthenticated, router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
    error,
    login,
    register,
    firebaseLogin,
    logout,
    fetchUser,
    updateUser,
    clearError,
  };
}

// Hook for protected routes - redirects to login if not authenticated
export function useRequireAuth(redirectTo: string = '/sign-in') {
  return useAuth({ redirectTo });
}

// Hook for guest routes - redirects to home if already authenticated
export function useGuestOnly(redirectTo: string = '/') {
  return useAuth({ redirectIfAuthenticated: redirectTo });
}
