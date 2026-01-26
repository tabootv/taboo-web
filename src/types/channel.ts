/**
 * Channel & Creator Types
 * Channel model and creator profiles
 */

import type { Media } from './media';
import type { User } from './user';
import type { PaginatedResponse } from './api';

export interface Channel {
  id: number;
  uuid: string;
  name: string;
  handler?: string;
  user_id: number;
  description?: string;
  paypal_link?: string | null;
  following?: boolean | null;
  dp?: string;
  banner?: string;
  media?: Media[];
  subscribers_count?: number;
  followers_count?: number;
  videos_count?: number;
  shorts_count?: number;
  views_count?: number;
  likes_count?: number;
  laravel_through_key?: number;
}

export interface Creator extends Channel {
  user?: User;
  followers_count?: number;
  videos_count?: number;
  shorts_count?: number;
  short_videos_count?: number;
  series_count?: number;
  posts_count?: number;
  course_count?: number;
  x?: string | null;
  tiktok?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  country?: string;
  countries_recorded?: number;
  total_videos?: number;
  total_shorts?: number;
}

export interface CreatorsResponse {
  message: string;
  creators: PaginatedResponse<Creator>;
}
