/**
 * Video Content Types
 * Video, shorts, and related response types
 */

import type { Channel } from './channel';
import type { Tag } from './media';
import type { Comment } from './comment';
import type { PaginatedResponse } from './api';

export interface Caption {
  srclang: string;
  label: string;
  url: string;
}

export interface UserProgress {
  position: number;
  duration: number;
  completed: boolean;
  first_watched_at: string | null;
  first_completed_at: string | null;
}

export interface Video {
  id?: number;
  uuid: string;
  title: string;
  description?: string;
  short?: boolean;
  is_short?: boolean;
  type?: string;
  featured?: boolean;
  banner?: boolean;
  is_adult_content?: boolean;
  is_free?: boolean;
  is_liked?: boolean;
  is_disliked?: boolean;
  is_bookmarked?: boolean;
  in_watchlist?: boolean;
  published_at: string;
  likes_count: number;
  dislikes_count?: number;
  comments_count: number;
  views_count?: number;
  has_liked: boolean;
  has_disliked?: boolean;
  duration?: number;
  thumbnail?: string;
  card_thumbnail?: string;
  thumbnail_webp?: string;
  url_1440?: string;
  url_1080?: string;
  url_720?: string;
  url_480?: string;
  url_hls?: string;
  hls_url?: string;
  is_bunny_video?: boolean;
  humans_publish_at?: string;
  channel: Channel;
  series_id?: number;
  captions?: Caption[];
  user_progress?: UserProgress | null;
  tags?: Tag[];
  comments?: Comment[];
  country?:
    | string
    | {
        id?: number;
        name?: string;
        emoji?: string;
        iso?: string;
        name_with_flag?: string;
        emoji_code?: string;
      }
    | null;
}

export interface ShortVideo extends Video {
  short: true;
}

export interface VideosResponse {
  message: string;
  videos: PaginatedResponse<Video>;
}

export interface VideoResponse {
  message: string;
  video: Video;
}

export type VideoListResponse = PaginatedResponse<Video>;
