/**
 * Studio Types (Creator Dashboard)
 * Types for creator studio and content management
 */

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
