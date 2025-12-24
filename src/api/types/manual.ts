/**
 * Manual TypeScript types for TabooTV API
 *
 * These types are manually defined based on existing API responses.
 * When OpenAPI schema is available, these will be replaced with generated types.
 *
 * TODO: When OpenAPI is available, replace with generated types from schema
 * Migration: Update src/api/types/index.ts to export from './generated' instead
 */

// ============================================
// Core Types
// ============================================

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// ============================================
// Authentication Domain
// ============================================

/**
 * API Endpoints:
 * - POST /login → AuthResponse
 * - POST /register → AuthResponse
 * - POST /auth/firebase-login → AuthResponse
 * - GET /me → MeResponse
 *
 * TODO: Map to OpenAPI:
 * - components.schemas.User
 * - components.schemas.AuthResponse
 * - components.schemas.MeResponse
 */

export interface User {
  id: number;
  uuid: string;
  country_id?: number;
  first_name: string;
  last_name: string;
  display_name: string;
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
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface FirebaseLoginData {
  token: string;
  provider: 'google' | 'apple';
}

export interface MeResponse {
  message: string;
  user: User;
  subscribed: boolean;
}

// ============================================
// Channel & Creator Domain
// ============================================

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
}

// ============================================
// Video Domain
// ============================================

/**
 * API Endpoints:
 * - GET /videos/{id}/play → Video
 * - GET /public/videos → VideoListResponse
 * - POST /videos/{id}/toggle-like → LikeResponse
 * - POST /videos/{id}/toggle-bookmark → BookmarkResponse
 *
 * TODO: Map to OpenAPI:
 * - components.schemas.Video
 * - components.schemas.VideoListResponse
 */

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
  humans_publish_at?: string;
  channel: Channel;
  series_id?: number;
  tags?: Tag[];
  comments?: Comment[];
}

export interface ShortVideo extends Video {
  short: true;
}

export interface VideoListResponse extends PaginatedResponse<Video> {}

export interface LikeResponse {
  has_liked: boolean;
  likes_count: number;
}

export interface DislikeResponse {
  has_disliked: boolean;
  dislikes_count: number;
}

export interface BookmarkResponse {
  is_bookmarked: boolean;
}

// ============================================
// Series & Courses Domain
// ============================================

export interface Series {
  id: number;
  uuid: string;
  type: string;
  module_type: 'series' | 'course';
  title: string;
  description?: string;
  duration?: number;
  banner?: boolean;
  is_free?: boolean;
  is_adult_content?: boolean;
  user_has_access?: boolean;
  purchase_link?: string | null;
  published_at: string;
  humans_publish_at?: string;
  latest?: boolean;
  videos_count: number;
  thumbnail?: string;
  card_thumbnail?: string;
  trailer_thumbnail?: string;
  course_thumbnail?: string;
  desktop_banner?: string;
  mobile_banner?: string;
  trailer_url?: string;
  trailer?: string;
  channel: Channel;
  user_id: number;
  videos?: Video[];
  categories?: SeriesCategory[];
  tags?: Tag[];
}

export interface SeriesCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Course extends Series {
  module_type: 'course';
  price_tier?: string;
  is_enrolled?: boolean;
}

// ============================================
// Community Posts Domain
// ============================================

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
  media?: Media[];
  created_at: string;
  updated_at: string;
}

export interface PostListResponse extends PaginatedResponse<Post> {}

export interface PostComment {
  id: number;
  uuid: string;
  content: string;
  user: User;
  post_id: number;
  parent_id?: number;
  likes_count: number;
  dislikes_count: number;
  has_liked: boolean;
  has_disliked: boolean;
  replies_count?: number;
  replies?: PostComment[];
  created_at: string;
  updated_at: string;
}

export interface PostCommentListResponse extends PaginatedResponse<PostComment> {}

// ============================================
// Comments Domain
// ============================================

export interface Comment {
  id: number;
  uuid: string;
  content: string;
  user: User;
  video_id?: number;
  parent_id?: number;
  likes_count: number;
  dislikes_count: number;
  has_liked: boolean;
  has_disliked: boolean;
  replies_count?: number;
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface CommentListResponse extends PaginatedResponse<Comment> {}

// ============================================
// Subscription Domain
// ============================================

export type SubscriptionProvider = 'whop' | 'apple' | 'google' | 'copecart' | 'stripe';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due' | 'pending';
export type PlanInterval = 'monthly' | 'yearly' | 'lifetime';

export interface Plan {
  id: number;
  name: string;
  slug?: string;
  badge?: string;
  description?: string;
  price: number;
  currency: string;
  interval: PlanInterval;
  features?: string[];
  is_active?: boolean;
  whop_plan_id?: string;
  whop_plan_url?: string;
  apple_product_id?: string;
  google_product_id?: string;
}

export interface Subscription {
  id: number;
  uuid: string;
  user_id: number;
  plan_id: number;
  provider: SubscriptionProvider;
  provider_subscription_id?: string;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string;
  current_period_end?: string;
  plan?: Plan;
  payload?: {
    manage_url?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInfo {
  is_subscribed: boolean;
  provider?: SubscriptionProvider;
  plan?: string;
  status?: SubscriptionStatus;
  current_period_end?: string;
  manage_url?: string;
}

// ============================================
// Home Feed Domain
// ============================================

export interface Banner {
  id: number;
  uuid: string;
  type: 'series' | 'video';
  module_type?: string;
  title: string;
  description?: string;
  banner: boolean;
  user_id: number;
  series_id?: number;
  is_adult_content?: boolean;
  published_at?: string;
  channel: Channel;
  trailer_thumbnail?: string;
  desktop_banner?: string;
  mobile_banner?: string;
  trailer_url?: string;
  thumbnail?: string;
}

// ============================================
// Search Domain
// ============================================

export interface SearchResults {
  videos: Video[];
  shorts: Video[];
  series: Series[];
  posts: Post[];
  creators: Creator[];
}

// ============================================
// Notifications Domain
// ============================================

export interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// ============================================
// Playlists Domain
// ============================================

export interface Playlist {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  user_id: number;
  videos_count: number;
  thumbnail?: string;
  videos?: Video[];
  created_at: string;
  updated_at: string;
}

// ============================================
// Media & Tags
// ============================================

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

export interface Tag {
  id: number;
  name: string;
  slug: string;
  should_show?: boolean;
}

// ============================================
// Utility Types
// ============================================

export interface MessageResponse {
  message: string;
}

export interface ToggleFollowResponse {
  message: string;
  following: boolean;
  followers_count?: number;
  is_following?: boolean;
}
