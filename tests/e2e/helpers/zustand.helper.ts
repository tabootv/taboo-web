import { Page } from '@playwright/test';

/**
 * Upload phase types matching the Zustand store
 */
export type UploadPhase = 'idle' | 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';

/**
 * Upload state structure from the Zustand store
 */
export interface ActiveUpload {
  id: string;
  videoId: number | null;
  videoUuid: string | null;
  bunnyVideoId: string | null;
  fileName: string;
  fileSize: number;
  contentType: 'video' | 'short';
  phase: UploadPhase;
  progress: number;
  bytesUploaded: number;
  bytesTotal: number;
  tusFingerprint: string | null;
  metadata: {
    title: string;
    description?: string;
    tags?: number[];
    tagSlugs?: string[];
    isAdultContent?: boolean;
    countryId?: number;
    location?: string;
    thumbnailSource: 'auto' | 'custom';
    publishMode: 'none' | 'auto' | 'scheduled';
    scheduledAt?: string;
  };
  circuitBreaker: {
    failureCount: number;
    lastFailureAt: number | null;
    isOpen: boolean;
  };
  isPaused: boolean;
  isStale: boolean;
  error: string | null;
  modalStep: string;
  hasOpenModal: boolean;
  startedAt: number;
  lastProgressAt: number;
}

/**
 * Zustand store state structure
 */
export interface UploadStoreState {
  uploads: Map<string, ActiveUpload>;
}

/**
 * Zustand Store Helper
 *
 * Utilities for accessing and manipulating the Zustand upload store
 * via localStorage (key: 'taboo-uploads').
 */

const STORE_KEY = 'taboo-uploads';

/**
 * Get the raw upload store state from localStorage
 */
export async function getUploadStoreState(page: Page): Promise<UploadStoreState | null> {
  return await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      // Zustand persist format: { state: { uploads: [[id, upload], ...] }, version: 0 }
      const uploadsArray = parsed.state?.uploads || parsed.uploads || [];
      return {
        uploads: new Map(uploadsArray),
      };
    } catch {
      return null;
    }
  }, STORE_KEY);
}

/**
 * Get a specific upload by ID
 */
export async function getUploadById(page: Page, uploadId: string): Promise<ActiveUpload | null> {
  return await page.evaluate(
    ([key, id]) => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      try {
        const parsed = JSON.parse(raw);
        const uploadsArray = parsed.state?.uploads || parsed.uploads || [];
        const uploadsMap = new Map(uploadsArray);
        return uploadsMap.get(id) || null;
      } catch {
        return null;
      }
    },
    [STORE_KEY, uploadId] as const
  );
}

/**
 * Get all uploads from the store
 */
export async function getAllUploads(page: Page): Promise<ActiveUpload[]> {
  return await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      const uploadsArray = parsed.state?.uploads || parsed.uploads || [];
      return uploadsArray.map(([_, upload]: [string, ActiveUpload]) => upload);
    } catch {
      return [];
    }
  }, STORE_KEY);
}

/**
 * Wait for an upload to reach a specific phase
 */
export async function waitForUploadPhase(
  page: Page,
  uploadId: string,
  expectedPhase: UploadPhase,
  timeout = 30000
): Promise<void> {
  await page.waitForFunction(
    ([key, id, phase]) => {
      const raw = localStorage.getItem(key);
      if (!raw) return false;

      try {
        const parsed = JSON.parse(raw);
        const uploadsArray = parsed.state?.uploads || parsed.uploads || [];
        const uploadsMap = new Map(uploadsArray);
        const upload = uploadsMap.get(id) as ActiveUpload | undefined;
        return upload?.phase === phase;
      } catch {
        return false;
      }
    },
    [STORE_KEY, uploadId, expectedPhase] as const,
    { timeout }
  );
}

/**
 * Wait for an upload to be paused
 */
export async function waitForUploadPaused(
  page: Page,
  uploadId: string,
  isPaused: boolean,
  timeout = 10000
): Promise<void> {
  await page.waitForFunction(
    ([key, id, paused]) => {
      const raw = localStorage.getItem(key);
      if (!raw) return false;

      try {
        const parsed = JSON.parse(raw);
        const uploadsArray = parsed.state?.uploads || parsed.uploads || [];
        const uploadsMap = new Map(uploadsArray);
        const upload = uploadsMap.get(id) as ActiveUpload | undefined;
        return upload?.isPaused === paused;
      } catch {
        return false;
      }
    },
    [STORE_KEY, uploadId, isPaused] as const,
    { timeout }
  );
}

/**
 * Check if circuit breaker is open for an upload
 */
export async function isCircuitBreakerOpen(page: Page, uploadId: string): Promise<boolean> {
  const upload = await getUploadById(page, uploadId);
  return upload?.circuitBreaker.isOpen ?? false;
}

/**
 * Clear the entire upload store
 */
export async function clearUploadStore(page: Page): Promise<void> {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, STORE_KEY);
}

/**
 * Seed the upload store with test data
 */
export async function seedUploadStore(
  page: Page,
  uploads: Array<[string, Partial<ActiveUpload>]>
): Promise<void> {
  await page.evaluate(
    ([key, uploadsData]) => {
      const fullUploads = uploadsData.map(([id, data]) => {
        const defaultUpload: ActiveUpload = {
          id,
          videoId: null,
          videoUuid: null,
          bunnyVideoId: null,
          fileName: 'test-video.mp4',
          fileSize: 10000000,
          contentType: 'video',
          phase: 'uploading',
          progress: 50,
          bytesUploaded: 5000000,
          bytesTotal: 10000000,
          tusFingerprint: null,
          metadata: {
            title: 'Test Video',
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
        };

        return [id, { ...defaultUpload, ...data }];
      });

      const storeState = {
        state: {
          uploads: fullUploads,
        },
        version: 0,
      };

      localStorage.setItem(key, JSON.stringify(storeState));
    },
    [STORE_KEY, uploads] as const
  );
}

/**
 * Create a stale upload (for resume testing)
 */
export async function createStaleUpload(
  page: Page,
  options: {
    fileName: string;
    progress: number;
    videoUuid?: string;
  }
): Promise<string> {
  const uploadId = `test-upload-${Date.now()}`;

  await seedUploadStore(page, [
    [
      uploadId,
      {
        fileName: options.fileName,
        progress: options.progress,
        videoUuid: options.videoUuid || null,
        isStale: true,
        phase: 'uploading',
        bytesUploaded: options.progress * 100000,
        bytesTotal: 10000000,
      },
    ],
  ]);

  return uploadId;
}
