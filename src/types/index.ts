/**
 * Types Index
 *
 * Re-exports all types from domain-specific files for backward compatibility.
 * For new code, prefer importing directly from specific type files:
 *
 * @example
 * // Instead of:
 * import type { User, Video } from '@/types';
 *
 * // Prefer:
 * import type { User } from '@/types/user';
 * import type { Video } from '@/types/video';
 */

// UI Component Types
export type { ButtonVariant, ButtonSize, HeadingLevel, TextVariant } from './ui';

// API Response Types
export type { ApiResponse, PaginatedResponse, PaginationLink, MessageResponse } from './api';

// User & Authentication Types
export type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  FirebaseLoginData,
  MeResponse,
} from './user';

// Channel & Creator Types
export type { Channel, Creator, CreatorsResponse } from './channel';

// Media Types
export type { Media, Tag } from './media';

// Video Types
export type {
  Caption,
  UserProgress,
  Video,
  ShortVideo,
  VideosResponse,
  VideoResponse,
  VideoListResponse,
} from './video';

// Comment Types
export type {
  Comment,
  CommentsResponse,
  PostComment,
  CommentListResponse,
  PostCommentListResponse,
} from './comment';

// Series & Course Types
export type {
  Series,
  SeriesCategory,
  Course,
  SeriesResponse,
  SeriesDetailResponse,
} from './series';

// Banner Types
export type { Banner, BannersResponse } from './banner';

// Post Types
export type { Post, PostsResponse, PostListResponse } from './post';

// Subscription Types
export type {
  SubscriptionProvider,
  SubscriptionStatus,
  PlanInterval,
  Plan,
  PlansResponse,
  Subscription,
  SubscriptionInfo,
  SubscriptionStatusResponse,
  BackendSubscriptionInfo,
} from './subscription';

// Notification Types
export type { Notification, NotificationsResponse } from './notification';

// Chat Types
export type {
  ChatMessage,
  ChatMessagesResponse,
  Chatroom,
  PlatformUsersCountResponse,
} from './chat';

// Playlist Types
export type { Playlist, PlaylistsResponse } from './playlist';

// Search Types
export type {
  SearchResults,
  SearchResponse,
  SearchTitle,
  SearchCreator,
  SearchTag,
  SearchItem,
  SearchRail,
  TopResult,
  SuggestResponse,
  TrendingResponse,
} from './search';

// Moderation Types
export type { ReportData, BlockData } from './moderation';

// Interaction Types
export type {
  ToggleLikeResponse,
  ToggleDislikeResponse,
  ToggleFollowResponse,
  LikeResponse,
  DislikeResponse,
  BookmarkResponse,
} from './interaction';

// Studio Types
export type {
  StudioCreator,
  StudioStats,
  StudioContentItem,
  StudioDashboardResponse,
  StudioUploadVideoPayload,
  StudioUploadVideoResponse,
  StudioUploadShortPayload,
  StudioUploadShortResponse,
  StudioCreatePostPayload,
  StudioCreatePostResponse,
  StudioVideoListItem,
  StudioVideoDetail,
  StudioShortListItem,
  StudioShortDetail,
  StudioPostListItem,
  StudioPostDetail,
  StudioSeriesListItem,
  StudioSeriesDetail,
  StudioCourseListItem,
  StudioCourseDetail,
  StudioVideosListResponse,
  StudioPostsListResponse,
  PrepareBunnyUploadPayload,
  PrepareBunnyUploadResponse,
  // Content Management Hub types
  ContentVisibility,
  ProcessingStatus,
  StudioContentListItem,
  StudioContentListResponse,
  UpdateVideoMetadataPayload,
  UpdateVisibilityPayload,
  UpdateVideoResponse,
  // UUID-based unified endpoint types
  UpdateVideoPayload,
  ToggleHiddenResponse,
  DeleteVideoResponse,
  // Video listing query params
  StudioVideoContentType,
  StudioVideoSortBy,
  StudioVideosQueryParams,
  // New API-aligned types
  BunnyStatus,
  PublishSchedule,
  PublicationMode,
  VideoDisplayState,
  // Schedule API types
  CreateSchedulePayload,
  UpdateSchedulePayload,
  VideoPublishSchedule,
  ScheduleResponse,
  DeleteScheduleResponse,
} from './studio';

// Earnings Types (FirstPromoter Integration)
export * from './earnings';

// Feature Flags
export * from './feature-flags';

// Mention Types
export type { MentionUser, UserSearchResponse } from './mention';
