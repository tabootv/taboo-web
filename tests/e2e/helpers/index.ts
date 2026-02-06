/**
 * E2E Test Helpers
 *
 * Export all helper utilities for easy importing in test specs.
 */

// Auth helpers
export {
  setupMockAuth,
  seedAuthStore,
  clearAuth,
  setupContextAuth,
  MOCK_CREATOR_USER,
  MOCK_TOKEN,
} from './auth.helper';

// Zustand store helpers
export {
  getUploadStoreState,
  getUploadById,
  getAllUploads,
  waitForUploadPhase,
  waitForUploadPaused,
  isCircuitBreakerOpen,
  clearUploadStore,
  seedUploadStore,
  createStaleUpload,
  type ActiveUpload,
  type UploadPhase,
  type UploadStoreState,
} from './zustand.helper';

// API mocking helpers
export {
  mockPrepareUpload,
  mockVideoUpdate,
  mockCreateSchedule,
  mock500Error,
  mock404Error,
  mockTimeout,
  mockIntermittentFailure,
  captureRequests,
  setupFullUploadMocks,
  mockStudioVideos,
  mockStudioShorts,
  mockStudioPosts,
  setupStudioContentMocks,
  DEFAULT_PREPARE_UPLOAD_RESPONSE,
  type MockPrepareUploadResponse,
} from './mock-api.helper';

// TUS mocking helpers
export {
  TusMockServer,
  mockTusUpload,
  mockTusFailure,
  mockTusSlow,
  captureTusHeaders,
  type TusMockOptions,
} from './tus-mock.helper';

// Large file simulation helpers
export {
  EIGHTEEN_GB,
  TEN_GB,
  FIVE_GB,
  createVirtualLargeFile,
  getVirtualLargeFile,
  injectVirtualFileToInput,
  simulateLargeFileProgress,
  validateNumericDisplay,
  formatBytes,
  calculateExpectedTime,
  captureUploadLengthHeader,
  monitorMemoryUsage,
  mockVideoMetadata,
} from './large-file.helper';
