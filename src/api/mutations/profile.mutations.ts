/**
 * Profile Mutation Hooks
 *
 * TanStack Query mutation hooks for profile operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  UpdateContactData,
  UpdateEmailData,
  UpdatePasswordData,
  UpdateProfileData,
} from '../client';
import { profileClient } from '../client';

/**
 * Hook to update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => profileClient.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['auth', 'user', 'me'] });
    },
  });
}

/**
 * Hook to update display picture
 */
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileClient.updateDisplayPicture(file),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['auth', 'user', 'me'] });
    },
  });
}

/**
 * Hook to update email
 */
export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmailData) => profileClient.updateEmail(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['auth', 'user', 'me'] });
    },
  });
}

/**
 * Hook to update contact info
 */
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContactData) => profileClient.updateContact(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['auth', 'user', 'me'] });
    },
  });
}

/**
 * Hook to update password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordData) => profileClient.updatePassword(data),
  });
}

/**
 * Hook to delete account
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileClient.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

