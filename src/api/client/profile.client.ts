/**
 * Profile API Client
 *
 * API Endpoints:
 * - GET /profile → User
 * - POST /profile/update-profile → User
 * - POST /profile/update-dp → User
 * - POST /profile/update-email → User
 * - POST /profile/update-contact → User
 * - POST /profile/update-password → { message: string }
 */

import type { ApiResponse, User } from '../types';
import { apiClient } from './base-client';

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  handler?: string;
  gender?: string;
  country_id?: number;
  phone_number?: string;
}

export interface UpdateEmailData {
  email: string;
  password: string;
}

export interface UpdateContactData {
  phone?: string;
}

export interface UpdatePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const profileClient = {
  /**
   * Get user profile
   */
  get: async (): Promise<User> => {
    const data = await apiClient.get<ApiResponse<User>>('/profile');
    return data.data;
  },

  /**
   * Update profile
   */
  updateProfile: async (profileData: UpdateProfileData): Promise<User> => {
    const data = await apiClient.post<{ message: string; user_data: User } | ApiResponse<User>>(
      '/profile/update-profile',
      profileData
    );
    if ('user_data' in data && data.user_data) {
      return data.user_data;
    }
    return (data as ApiResponse<User>).data;
  },

  /**
   * Update display picture (avatar)
   */
  updateDisplayPicture: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('dp', file);
    const data = await apiClient.post<ApiResponse<User>>('/profile/update-dp', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  /**
   * Update email
   */
  updateEmail: async (emailData: UpdateEmailData): Promise<User> => {
    const data = await apiClient.post<ApiResponse<User>>('/profile/update-email', emailData);
    return data.data;
  },

  /**
   * Update contact info
   */
  updateContact: async (contactData: UpdateContactData): Promise<User> => {
    const data = await apiClient.post<ApiResponse<User>>('/profile/update-contact', contactData);
    return data.data;
  },

  /**
   * Update password
   */
  updatePassword: async (passwordData: UpdatePasswordData): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/profile/update-password', passwordData);
  },
};
