/**
 * User & Authentication Types
 * User model, auth responses, and credentials
 */

import type { Channel } from './channel';

export interface User {
  id: number;
  uuid: string;
  country_id?: number;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  handler?: string;
  handler_changes_remaining?: number;
  email: string;
  gender?: string;
  phone_number?: string;
  profile_completed: boolean;
  video_autoplay: boolean;
  provider?: string;
  badge?: string;
  is_creator: boolean;
  has_courses: boolean;
  channel?: Channel;
  dp?: string;
  medium_dp?: string;
  small_dp?: string;
  token?: string;
  subscribed?: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  subscribed?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_token?: string;
  remember_me?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  privacy_policy: boolean;
  terms_and_condition: boolean;
  referral_code?: string;
  device_token?: string;
}

export interface FirebaseLoginData {
  firebase_token: string;
  device_token?: string;
  provider?: 'google' | 'apple';
}

export interface MeResponse {
  message: string;
  user: User;
  subscribed: boolean;
}
