// ============================================
// TabooTV API Types for Landing Page Integration
// ============================================

// Generic pagination response
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// User type
export interface User {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  is_creator: boolean;
  dp?: string;
  medium_dp?: string;
  small_dp?: string;
}

// Channel (base for Creator)
export interface Channel {
  id: number;
  uuid: string;
  name: string;
  user_id: number;
  description?: string;
  paypal_link?: string | null;
  following?: boolean | null;
  dp?: string;
  banner?: string;
  subscribers_count?: number;
  followers_count?: number;
  videos_count?: number;
  shorts_count?: number;
  views_count?: number;
  likes_count?: number;
}

// Creator (extends Channel)
export interface Creator extends Channel {
  user?: User;
  short_videos_count?: number;
  series_count?: number;
  posts_count?: number;
  course_count?: number;
}

// Video
export interface Video {
  id?: number;
  uuid: string;
  title: string;
  description?: string;
  short?: boolean;
  featured?: boolean;
  is_free?: boolean;
  is_liked?: boolean;
  published_at: string;
  likes_count: number;
  comments_count: number;
  views_count?: number;
  duration?: number;
  thumbnail?: string;
  thumbnail_webp?: string;
  url_1440?: string;
  url_1080?: string;
  url_720?: string;
  url_480?: string;
  hls_url?: string;
  channel: Channel;
}

// Short video
export interface ShortVideo extends Video {
  short: true;
}

// Series
export interface Series {
  id: number;
  uuid: string;
  type: string;
  module_type: 'series' | 'course';
  title: string;
  description?: string;
  duration?: number;
  is_free?: boolean;
  published_at: string;
  videos_count: number;
  thumbnail?: string;
  card_thumbnail?: string;
  trailer_thumbnail?: string;
  desktop_banner?: string;
  mobile_banner?: string;
  trailer_url?: string;
  channel: Channel;
}

// Course (extends Series)
export interface Course extends Series {
  module_type: 'course';
  price_tier?: string;
  is_enrolled?: boolean;
}

// Post
export interface Post {
  id: number;
  uuid: string;
  caption: string;
  user_id: number;
  published_at?: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  has_liked: boolean;
  has_disliked: boolean;
  user: User;
  channel?: Channel;
  post_image?: string[];
  post_audio?: string[];
  created_at: string;
  updated_at: string;
}

// Media
export interface Media {
  id: number;
  uuid?: string;
  collection_name?: string;
  name?: string;
  file_name?: string;
  mime_type?: string;
  size?: number;
  original_url?: string;
  preview_url?: string;
}
