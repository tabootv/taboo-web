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

/**
 * Bunny CDN processing status codes
 * Only 0-3 are valid statuses returned by the API
 */
export type BunnyStatus = 0 | 1 | 2 | 3;

/**
 * Bunny status descriptions:
 * 0 = Queued - Video is waiting to be processed
 * 1 = Processing - Video is being processed
 * 2 = Encoding - Video is being encoded into multiple resolutions
 * 3 = Finished - Video processing is complete and ready for playback
 */

/**
 * Publish schedule for scheduled videos
 */
export interface PublishSchedule {
  scheduled_at: string;
}

/**
 * Publication mode as used by the API
 * - 'none': Draft - not published, no schedule
 * - 'auto': Live - published immediately
 * - 'scheduled': Scheduled - will publish at scheduled_at time
 */
export type PublicationMode = 'none' | 'auto' | 'scheduled';

/**
 * Video display state for UI rendering
 * Derived from API fields (published, publish_schedule, bunny_status)
 */
export type VideoDisplayState = 'live' | 'draft' | 'scheduled' | 'processing';

export interface StudioVideoListItem {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  thumbnail?: string;
  views_count?: number;
  likes_count?: number;
  comments_count?: number;
  duration?: number;
  created_at: string;
  published_at?: string;
  status?: string;
  /** Whether the video is published (live) */
  published?: boolean;
  /** Video is currently being processed by Bunny */
  processing?: boolean;
  /** Bunny processing status: 0=queued, 1=processing, 2=encoding, 3=finished */
  bunny_status?: BunnyStatus;
  /** Processing progress percentage (0-100) */
  progress?: number;
  /** Bunny encoding progress percentage */
  bunny_encode_progress?: number;
  /** Available video resolutions (comma-separated, e.g., "720p,1080p") */
  bunny_available_resolutions?: string;
  /** Whether the video is hosted on Bunny CDN */
  is_bunny_video?: boolean;
  /** Whether this is a short video */
  short?: boolean;
  /** Scheduled publication info */
  publish_schedule?: PublishSchedule | null;
  /** Location name */
  location?: string;
  /** Country name */
  country?: string;
  /** Country ID */
  country_id?: number;
  /** Latitude coordinate */
  latitude?: number;
  /** Longitude coordinate */
  longitude?: number;
  /** Tags associated with the video */
  tags?: string[];
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

/**
 * Content visibility state for UI display
 * Aligned with VideoDisplayState for consistency
 */
export type ContentVisibility = 'live' | 'draft' | 'scheduled' | 'processing';

/**
 * Processing status for videos being uploaded/encoded
 */
export type ProcessingStatus = 'uploading' | 'processing' | 'ready';

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

/**
 * Payload for updating video visibility/publication status
 * Uses publish_mode to match API expectations
 */
export interface UpdateVisibilityPayload {
  publish_mode: PublicationMode;
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

/**
 * Content type enum for studio video listing
 */
export type StudioVideoContentType = 'videos' | 'series' | 'courses' | 'shorts';

/**
 * Sort options for studio video listing
 */
export type StudioVideoSortBy = 'latest' | 'oldest';

/**
 * Query parameters for GET /api/studio/videos
 */
export interface StudioVideosQueryParams {
  /** Page number. Default: 1 */
  page?: number;
  /** Items per page. Default: 20, Max: 100 */
  per_page?: number;
  /** Filter by specific video IDs */
  ids?: number[];
  /** Filter by country names */
  countries?: string[];
  /** Filter by country IDs */
  countries_ids?: number[];
  /** Filter by series IDs */
  series_ids?: number[];
  /** Filter by content types. Default: ['videos', 'series'] */
  types?: StudioVideoContentType[];
  /** Sort order. Default: 'latest' */
  sort_by?: StudioVideoSortBy;
}
