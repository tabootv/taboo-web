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
  /** Video is currently being processed by Bunny */
  processing?: boolean;
  /** Bunny processing status: 0=queued, 1=processing, 2=encoding, 3=finished, 4=failed */
  bunny_status?: number;
  /** Processing progress percentage (0-100) */
  progress?: number;
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

export interface StudioPostsListResponse {
  posts: StudioPostListItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Prepare Bunny Upload Types
 * For direct TUS uploads bypassing server action body limit
 */
export interface PrepareBunnyUploadPayload {
  title: string;
  description?: string | undefined;
  short?: boolean | undefined;
  location?: string | undefined;
  country_id?: number | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  is_adult_content?: boolean | undefined;
  tags?: number[] | undefined;
  thumbnail_path?: string | undefined;
  publish_mode?: 'none' | 'auto' | 'scheduled' | undefined;
  scheduled_at?: string | undefined;
}

export interface PrepareBunnyUploadResponse {
  message: string;
  video_id: number;
  video_uuid: string;
  bunny_video_id: string;
  upload_config: {
    endpoint: string;
    headers: {
      AuthorizationSignature: string;
      AuthorizationExpire: number;
      LibraryId: string | number;
      VideoId: string;
    };
  };
}

/**
 * Content Management Types
 * Extended types for the Content Management Hub
 */

export type ContentVisibility = 'public' | 'private' | 'unlisted' | 'scheduled' | 'draft';
export type ProcessingStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface StudioContentListItem {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  visibility: ContentVisibility;
  scheduled_at?: string;
  processing_status: ProcessingStatus;
  restrictions?: string[];
  views_count: number;
  comments_count: number;
  likes_count: number;
  likes_ratio: number;
  created_at: string;
  published_at?: string;
  duration?: number;
}

export interface UpdateVideoMetadataPayload {
  title?: string;
  description?: string;
  tags?: number[];
  is_adult_content?: boolean;
  country_id?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  thumbnail_path?: string;
}

export interface UpdateVisibilityPayload {
  visibility: ContentVisibility;
  scheduled_at?: string;
}

export interface UpdateVideoResponse {
  success: boolean;
  video?: StudioVideoListItem;
  errors?: Record<string, string[]>;
}

export interface StudioContentListResponse {
  videos: StudioContentListItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
