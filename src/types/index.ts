// ============================================
// Core Data Types for TabooTV
// Based on actual Laravel backend API responses
// ============================================

// UI Component Types
export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TextVariant = 'body' | 'small' | 'large' | 'lead';

// Generic API Response wrapper
export interface ApiResponse<T> {
  message?: string;
  data: T;
}

// Pagination
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
// User & Authentication
// ============================================

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
  token?: string; // Included in login response
  subscribed?: boolean; // Subscription status (in login response)
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string; // Token is at root level
  subscribed?: boolean; // Subscription status at root level
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
// Channel & Creator
// ============================================

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

// ============================================
// Video Content
// ============================================

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
  country?: string | {
    id?: number;
    name?: string;
    emoji?: string;
    iso?: string;
    name_with_flag?: string;
    emoji_code?: string;
  } | null;
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

// ============================================
// Series & Courses
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

export interface SeriesResponse {
  message: string;
  series: Series[];
}

export interface SeriesDetailResponse {
  message: string;
  series: Series;
}

// ============================================
// Banners
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

export interface BannersResponse {
  message: string;
  banners: Banner[];
}

// ============================================
// Comments
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

export interface CommentsResponse {
  message: string;
  comments: PaginatedResponse<Comment>;
}

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

// ============================================
// Community Posts
// ============================================

export interface Post {
  id: number;
  uuid: string;
  caption: string; // Vue uses caption, not content
  user_id: number;
  published_at?: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  has_liked: boolean;
  has_disliked: boolean;
  user: User;
  channel?: Channel;
  post_image?: string[]; // Array of image URLs
  post_audio?: string[]; // Array of audio URLs
  media?: Media[];
  created_at: string;
  updated_at: string;
}

export interface PostsResponse {
  message: string;
  posts: PaginatedResponse<Post>;
}

// ============================================
// Media
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
// Subscription & Plans
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
  // Provider-specific IDs and URLs
  whop_plan_id?: string;
  whop_plan_url?: string;
  apple_product_id?: string;
  google_product_id?: string;
}

export interface PlansResponse {
  message: string;
  plans: Plan[];
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

// Subscription info response (from /api/me or /api/subscription-info)
export interface SubscriptionInfo {
  is_subscribed: boolean;
  provider?: SubscriptionProvider | undefined;
  plan?: string | undefined;
  status?: SubscriptionStatus | undefined;
  current_period_end?: string | undefined;
  manage_url?: string | undefined;
}

export interface SubscriptionStatusResponse {
  message: string;
  subscribed: boolean;
}

// ============================================
// Notifications
// ============================================

export interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown> | string;
  read_at: string | null;
  created_at: string;
  // Campos adicionais da API Laravel
  mobile_message?: string;
  created_by?: string;
  media_url?: string;
  profile?: string;
  model_uuid?: string;
  human_readable_time?: string;
}

export interface NotificationsResponse {
  message: string;
  notifications: Notification[];
}

// ============================================
// Live Chat
// ============================================

export interface ChatMessage {
  id: number;
  uuid: string;
  content: string;
  user: User;
  chatroom_id: number;
  created_at: string;
}

export interface ChatMessagesResponse {
  message: string;
  messages: PaginatedResponse<ChatMessage>;
}

export interface Chatroom {
  id: number;
  name: string;
  active: boolean;
}

export interface PlatformUsersCountResponse {
  message: string;
  count: number;
}

// ============================================
// Playlists
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

export interface PlaylistsResponse {
  message: string;
  playlists: Playlist[];
}

// ============================================
// Search
// ============================================

export interface SearchResults {
  videos: Video[];
  shorts: Video[];
  series: Series[];
  posts: Post[];
  creators: Creator[];
}

export interface SearchResponse {
  message: string;
  results: SearchResults;
}

// ============================================
// Reports & Blocking
// ============================================

export interface ReportData {
  type: 'video' | 'post' | 'comment' | 'user';
  id: number | string;
  reason: string;
  description?: string;
}

export interface BlockData {
  type: 'video' | 'post' | 'user';
  id: number | string;
}

// ============================================
// Generic API Response
// ============================================

export interface MessageResponse {
  message: string;
}

export interface ToggleLikeResponse {
  message: string;
  has_liked: boolean;
  likes_count: number;
}

export interface ToggleDislikeResponse {
  message: string;
  has_disliked: boolean;
  dislikes_count: number;
}

export interface ToggleFollowResponse {
  message: string;
  following: boolean;
  followers_count?: number;
}

// ============================================
// Response Type Aliases
// ============================================

export type VideoListResponse = PaginatedResponse<Video>;
export type CommentListResponse = PaginatedResponse<Comment>;
export type PostListResponse = PaginatedResponse<Post>;
export type PostCommentListResponse = PaginatedResponse<PostComment>;

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
// Search UI Types
// ============================================

export interface SearchTitle {
  type: 'title';
  id: string;
  uuid: string;
  title: string;
  thumb: string;
  thumbWebp?: string;
  creatorName: string;
  creatorId: string;
  year: number;
  description: string;
  duration?: number;
  views?: number;
  contentType: 'video' | 'short' | 'series';
}

export interface SearchCreator {
  type: 'creator';
  id: string;
  uuid: string;
  handler?: string;
  name: string;
  avatar: string;
  subscriberCount: number;
  videoCount: number;
  verified?: boolean;
}

export interface SearchTag {
  type: 'tag';
  id: string;
  name: string;
  count: number;
}

export type SearchItem = SearchTitle | SearchCreator | SearchTag;

export interface SearchRail {
  label: string;
  type: 'titles' | 'creators' | 'tags';
  items: SearchItem[];
}

export interface TopResult {
  type: 'title' | 'creator';
  id: string;
  uuid?: string;
  title: string;
  thumb: string;
  thumbLarge?: string;
  creatorName?: string;
  year?: number;
  description: string;
  duration?: number;
  contentType?: 'video' | 'short' | 'series';
}

export interface SuggestResponse {
  query: string;
  suggestions: SearchItem[];
  recentSearches?: string[];
}

export interface TrendingResponse {
  trending: SearchItem[];
  popular: string[];
}

// ============================================
// Studio Types (Creator Dashboard)
// ============================================

export interface StudioCreator {
  id: number;
  name: string;
  channel_slug: string;
  avatar_url: string;
}

export interface StudioStats {
  totalVideos: number;
  totalShorts: number;
  totalPosts: number;
  totalViews?: number;
  totalWatchTimeSeconds?: number;
}

export interface StudioContentItem {
  id: number;
  uuid: string;
  title: string;
  thumbnail_url: string;
  created_at: string;
  views_count?: number;
  likes_count?: number;
}

export interface StudioDashboardResponse {
  creator: StudioCreator;
  stats: StudioStats;
  latestVideos: StudioContentItem[];
  latestShorts: StudioContentItem[];
}

export interface StudioUploadVideoPayload {
  file: File;
  thumbnail?: File | null;
  title: string;
  description?: string;
  tags?: string[];
  country_id?: number | null;
  is_nsfw?: boolean;
  series_id?: number | null;
}

export interface StudioUploadVideoResponse {
  success: boolean;
  video?: {
    id: number;
    uuid: string;
    title: string;
    thumbnail_url: string;
  };
  errors?: Record<string, string[]>;
}

export interface StudioUploadShortPayload {
  file: File;
  thumbnail?: File | null;
  title: string;
  description?: string;
  tags?: string[];
  country_id?: number | null;
  is_nsfw?: boolean;
}

export interface StudioUploadShortResponse {
  success: boolean;
  video?: {
    id: number;
    uuid: string;
    title: string;
    thumbnail_url: string;
  };
  errors?: Record<string, string[]>;
}

export interface StudioCreatePostPayload {
  body: string;
  image?: File | null;
  video?: File | null;
}

export interface StudioCreatePostResponse {
  success: boolean;
  post?: {
    id: number;
    body: string;
    created_at: string;
  };
  errors?: Record<string, string[]>;
}

export interface StudioVideoListItem {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  views_count?: number;
  likes_count?: number;
  comments_count?: number;
  duration?: number;
  created_at: string;
  published_at?: string;
  status?: string;
}

export type StudioVideoDetail = StudioVideoListItem;
export type StudioShortListItem = StudioVideoListItem;
export type StudioShortDetail = StudioVideoListItem;

export interface StudioPostListItem {
  id: number;
  uuid: string;
  body: string;
  created_at: string;
  published_at?: string;
  likes_count?: number;
  comments_count?: number;
}

export type StudioPostDetail = StudioPostListItem;

export interface StudioSeriesListItem {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  videos_count?: number;
  created_at: string;
  published_at?: string;
}

export type StudioSeriesDetail = StudioSeriesListItem;
export type StudioCourseListItem = StudioSeriesListItem;
export type StudioCourseDetail = StudioSeriesListItem;

export interface StudioVideosListResponse {
  videos: StudioVideoListItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ============================================
// Earnings (FirstPromoter Integration)
// ============================================

export * from './earnings';
