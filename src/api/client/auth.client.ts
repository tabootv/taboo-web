/**
 * Authentication API Client
 *
 * API Endpoints:
 * - POST /login - Email/password login (accepts device_token)
 * - POST /register - Account creation (requires privacy_policy, terms_and_condition)
 * - POST /auth/firebase-login - Google/Apple OAuth via Firebase
 * - POST /forget-password - Request OTP for password reset
 * - POST /reset-password - Reset password with OTP
 * - POST /logout - Logout (accepts device_token to remove)
 * - GET /me - Get authenticated user
 * - POST /device-token - Update FCM device token
 */

import type {
  AuthResponse,
  FirebaseLoginData,
  LoginCredentials,
  MeResponse,
  MessageResponse,
  RegisterData,
} from '../types';
import { apiClient, removeToken, setToken } from './base-client';

export const authClient = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/login', credentials);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/register', userData);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  firebaseLogin: async (firebaseData: FirebaseLoginData): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>('/auth/firebase-login', firebaseData);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  forgotPassword: async (email: string): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>('/forget-password', { email });
  },

  resetPassword: async (payload: {
    email: string;
    otp: string;
    password: string;
    password_confirmation: string;
  }): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>('/reset-password', payload);
  },

  logout: async (device_token?: string): Promise<void> => {
    await apiClient.post('/logout', device_token ? { device_token } : undefined);
    removeToken();
  },

  me: async (): Promise<MeResponse> => {
    return apiClient.get<MeResponse>('/me');
  },

  registerDeviceToken: async (
    device_token: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<void> => {
    await apiClient.post('/device-token', { device_token, platform });
  },
};
