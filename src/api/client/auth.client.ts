/**
 * Authentication API Client
 *
 * API Endpoints (matching backend paths):
 * - POST /login - Email/password login
 * - POST /register - Account creation
 * - POST /auth/firebase-login - Google/Apple OAuth via Firebase
 * - POST /logout - Logout
 * - GET /me - Get authenticated user
 * - POST /device-token - Update FCM device token
 * - POST /forget-password - Request OTP for password reset
 * - POST /reset-password - Reset password with OTP
 *
 * Client-side: Requests go through /api/* proxy routes which manage HttpOnly cookies.
 * Server-side: Requests go directly to backend (use server actions to set cookies).
 */

import type {
  AuthResponse,
  FirebaseLoginData,
  LoginCredentials,
  MeResponse,
  MessageResponse,
  RegisterData,
} from '../types';
import { apiClient } from './base-client';

export interface AuthenticatedMeResponse extends MeResponse {
  authenticated: boolean;
}

export interface WhopExchangeRequest {
  code: string;
  membership_id?: string | undefined;
}

export interface WhopExchangeResponse {
  message: string;
  user?: Record<string, unknown>;
  subscribed?: boolean;
  scenario?: 'new_user' | 'existing_logged_in' | 'existing_logged_out';
  requires_profile_completion?: boolean;
  email?: string;
}

export const authClient = {
  /**
   * Login with email and password.
   * Client-side: /api/login proxy sets HttpOnly cookie.
   * Server-side: Returns token in response (caller sets cookie).
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/login', credentials);
  },

  /**
   * Register a new account.
   * Client-side: /api/register proxy sets HttpOnly cookie.
   * Server-side: Returns token in response (caller sets cookie).
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/register', userData);
  },

  /**
   * Login with Firebase token (Google/Apple OAuth).
   * Client-side: /api/auth/firebase-login proxy sets HttpOnly cookie.
   * Server-side: Returns token in response (caller sets cookie).
   */
  firebaseLogin: async (
    firebaseData: FirebaseLoginData
  ): Promise<AuthResponse & { requires_username?: boolean }> => {
    return apiClient.post<AuthResponse & { requires_username?: boolean }>(
      '/auth/firebase-login',
      firebaseData
    );
  },

  /**
   * Request OTP for password reset.
   * No authentication required.
   */
  forgotPassword: async (email: string): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>('/forget-password', { email });
  },

  /**
   * Reset password with OTP.
   * No authentication required.
   */
  resetPassword: async (payload: {
    email: string;
    otp: string;
    password: string;
    password_confirmation: string;
  }): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>('/reset-password', payload);
  },

  /**
   * Logout the current user.
   * Client-side: /api/logout proxy clears HttpOnly cookie.
   * Server-side: Caller clears cookie.
   */
  logout: async (device_token?: string): Promise<void> => {
    await apiClient.post('/logout', device_token ? { device_token } : undefined);
  },

  /**
   * Get the authenticated user's data.
   * Client-side: /api/me proxy reads HttpOnly cookie.
   */
  me: async (): Promise<AuthenticatedMeResponse> => {
    return apiClient.get<AuthenticatedMeResponse>('/me');
  },

  /**
   * Exchange Whop OAuth code for authentication.
   * Client-side: /api/auth/whop-exchange proxy sets HttpOnly cookie.
   */
  whopExchange: async (data: WhopExchangeRequest): Promise<WhopExchangeResponse> => {
    return apiClient.post<WhopExchangeResponse>('/auth/whop-exchange', data);
  },

  /**
   * Register or update FCM device token for push notifications.
   */
  registerDeviceToken: async (
    device_token: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<void> => {
    await apiClient.post('/device-token', { device_token, platform });
  },
};
