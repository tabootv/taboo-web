/**
 * Authentication Mutation Hooks
 *
 * TanStack Query mutation hooks for authentication actions
 * with optimistic updates and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '../client/auth.client';
import { queryKeys } from '../query-keys';
import type { FirebaseLoginData, LoginCredentials, RegisterData } from '../types';

/**
 * Hook for user login mutation
 *
 * On success: Invalidates user query to refetch current user
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authClient.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

/**
 * Hook for user registration mutation
 *
 * On success: Invalidates user query to refetch current user
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterData) => authClient.register(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

/**
 * Hook for Firebase authentication (Google/Apple)
 *
 * On success: Invalidates user query to refetch current user
 */
export function useFirebaseLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (firebaseData: FirebaseLoginData) => authClient.firebaseLogin(firebaseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

/**
 * Hook for user logout mutation
 *
 * On success: Clears all auth-related queries
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      queryClient.clear();
    },
  });
}

/**
 * Hook for forgot password mutation
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authClient.forgotPassword(email),
  });
}

/**
 * Hook for reset password mutation
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: {
      email: string;
      token: string;
      password: string;
      password_confirmation: string;
    }) => authClient.resetPassword(payload),
  });
}

/**
 * Hook for device token registration (push notifications)
 */
export function useRegisterDeviceToken() {
  return useMutation({
    mutationFn: ({ token, platform }: { token: string; platform: 'ios' | 'android' | 'web' }) =>
      authClient.registerDeviceToken(token, platform),
  });
}
