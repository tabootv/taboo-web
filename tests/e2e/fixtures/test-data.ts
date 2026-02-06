/**
 * Test Data Constants for E2E Tests
 *
 * Shared test data, mock responses, and constants
 * used across all upload flow tests.
 */

/**
 * Test user credentials (for authenticated tests)
 */
export const TEST_USERS = {
  creator: {
    email: process.env.TEST_CREATOR_EMAIL || 'e2e-creator@test.taboo.tv',
    password: process.env.TEST_CREATOR_PASSWORD || 'TestPassword123!',
  },
  viewer: {
    email: process.env.TEST_VIEWER_EMAIL || 'e2e-viewer@test.taboo.tv',
    password: process.env.TEST_VIEWER_PASSWORD || 'TestPassword123!',
  },
};

/**
 * Test video file configurations
 */
export const TEST_VIDEO_FILES = {
  landscape: {
    path: 'videos/test-video-landscape.mp4',
    name: 'test-video-landscape.mp4',
    type: 'video/mp4',
    expectedType: 'video' as const,
  },
  portrait: {
    path: 'videos/test-video-portrait.mp4',
    name: 'test-video-portrait.mp4',
    type: 'video/mp4',
    expectedType: 'short' as const,
  },
};

/**
 * Sample upload metadata for tests
 */
export const TEST_UPLOAD_METADATA = {
  basic: {
    title: 'E2E Test Video',
    description: 'This is an automated E2E test video',
    tags: ['music', 'entertainment'],
    tagIds: [1, 2],
    isAdultContent: false,
  },
  withSchedule: {
    title: 'E2E Scheduled Video',
    description: 'This video will be published later',
    publishMode: 'scheduled' as const,
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  },
  draft: {
    title: 'E2E Draft Video',
    description: 'Draft video for testing',
    publishMode: 'none' as const,
  },
};

/**
 * API endpoint patterns
 */
export const API_ENDPOINTS = {
  prepareBunnyUpload: 'videos/prepare-bunny-upload',
  studioVideos: 'studio/videos',
  studioContent: 'studio/content',
  schedule: 'studio/videos/*/schedule',
  tusUpload: 'tusupload',
};

/**
 * Mock tag data
 */
export const MOCK_TAGS = [
  { id: 1, name: 'Music', slug: 'music' },
  { id: 2, name: 'Entertainment', slug: 'entertainment' },
  { id: 3, name: 'Comedy', slug: 'comedy' },
  { id: 4, name: 'Education', slug: 'education' },
  { id: 5, name: 'Sports', slug: 'sports' },
  { id: 6, name: 'Gaming', slug: 'gaming' },
  { id: 7, name: 'News', slug: 'news' },
  { id: 8, name: 'Lifestyle', slug: 'lifestyle' },
];

/**
 * Mock prepare-bunny-upload response
 */
export const MOCK_PREPARE_UPLOAD_RESPONSE = {
  message: 'Video prepared successfully',
  video_id: 12345,
  video_uuid: 'test-uuid-abc-123',
  bunny_video_id: 'bunny-vid-xyz',
  upload_config: {
    endpoint: 'https://video.bunnycdn.com/tusupload',
    headers: {
      AuthorizationSignature: 'mock-auth-signature-123',
      AuthorizationExpire: Date.now() + 3600000,
      LibraryId: '123456',
      VideoId: 'bunny-vid-xyz',
    },
  },
};

/**
 * Mock video published response
 */
export const MOCK_VIDEO_PUBLISHED_RESPONSE = {
  success: true,
  video: {
    id: 12345,
    uuid: 'test-uuid-abc-123',
    title: 'E2E Test Video',
    status: 'published',
  },
};

/**
 * Mock schedule response factory
 */
export function createMockScheduleResponse(mode: 'auto' | 'scheduled', scheduledAt?: string) {
  return {
    success: true,
    data: {
      schedule: {
        id: 1,
        video_id: 12345,
        publish_mode: mode,
        scheduled_at: scheduledAt || null,
        notify: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    message: 'Schedule created',
  };
}

/**
 * Helper to create mock upload store state
 */
export function createMockUpload(overrides: Record<string, unknown> = {}) {
  return {
    id: `upload-${Date.now()}`,
    videoId: 12345,
    videoUuid: 'test-uuid-abc-123',
    bunnyVideoId: 'bunny-vid-xyz',
    fileName: 'test-video.mp4',
    fileSize: 10000000,
    contentType: 'video',
    phase: 'uploading',
    progress: 50,
    bytesUploaded: 5000000,
    bytesTotal: 10000000,
    tusFingerprint: 'tus::bunny-vid-xyz::test-video.mp4-10000000-1234567890',
    metadata: {
      title: 'Test Video',
      description: 'Test description',
      tags: [1, 2],
      tagSlugs: ['music', 'entertainment'],
      thumbnailSource: 'auto',
      publishMode: 'none',
    },
    circuitBreaker: {
      failureCount: 0,
      lastFailureAt: null,
      isOpen: false,
    },
    isPaused: false,
    isStale: false,
    error: null,
    modalStep: 'details',
    hasOpenModal: false,
    startedAt: Date.now() - 60000,
    lastProgressAt: Date.now(),
    ...overrides,
  };
}

/**
 * Seed data format for Zustand store
 */
export function createUploadStoreState(uploads: Array<ReturnType<typeof createMockUpload>>) {
  return {
    state: {
      uploads: uploads.map((u) => [u.id, u]),
    },
    version: 0,
  };
}
