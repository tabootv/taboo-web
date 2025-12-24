'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth-api';
import { queryKeys } from '@/shared/lib/api/query-keys';
import type { LoginCredentials, RegisterData, FirebaseLoginData } from '@/types';

/**
 * Hook to fetch current user data.
 */
export function useUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.me(),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook for user login mutation.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), data);
      router.push('/home');
    },
  });
}

/**
 * Hook for user registration mutation.
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.me(), response);
      router.push('/home');
    },
  });
}

/**
 * Hook for Firebase login mutation.
 */
export function useFirebaseLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: FirebaseLoginData) => authApi.firebaseLogin(data),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.me(), response);
      router.push('/home');
    },
  });
}

/**
 * Hook for user logout mutation.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.push('/sign-in');
    },
  });
}

