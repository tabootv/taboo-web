/**
 * Authentication API Client
 *
 * API Endpoints:
 * - POST /login
 * - POST /register
 * - POST /auth/firebase-login
 * - POST /forget-password
 * - POST /reset-password
 * - POST /logout
 * - GET /me
 * - POST /device-token
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
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>('/reset-password', payload);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout');
    removeToken();
  },

  me: async (): Promise<MeResponse> => {
    return apiClient.get<MeResponse>('/me');
  },

  registerDeviceToken: async (
    token: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<void> => {
    await apiClient.post('/device-token', { token, platform });
  },
};
