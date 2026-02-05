'use client';

import { useCallback, useRef, useEffect } from 'react';
import { studioClient } from '@/api/client/studio.client';
import type { UpdateVideoPayload } from '@/api/types';
import { useUploadStore, type ActiveUpload, type UploadPhase } from '@/shared/stores/upload-store';
import { fileReferenceStore } from '@/shared/stores/file-reference-store';
import type { TusUploadConfig, PublishMode } from '../config/types';
import { detectVideoAspectRatio, type AspectRatioResult } from './use-aspect-ratio';

/**
 * Legacy state interface for backward compatibility with UploadModal
 */
export interface ImmediateUploadState {
  uploadId: string | null;
  videoId: number | null;
  videoUuid: string | null;
  uploadPhase: UploadPhase;
  uploadProgress: number;
  bytesUploaded: number;
  bytesTotal: number;
  detectedType: 'video' | 'short' | null;
  aspectRatio: AspectRatioResult | null;
  isDraft: boolean;
  canPublish: boolean;
  isPaused: boolean;
  error: string | null;
  modalStep: 'details' | 'location' | 'tags' | 'content-rating' | 'thumbnail' | 'publishing';
}

export interface ImmediateUploadFormData {
  title: string;
  description?: string;
  /** Tag IDs for UI selection */
  tags?: number[];
  /** Tag slugs for API payload */
  tagSlugs?: string[];
  isAdultContent?: boolean;
  countryId?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  thumbnailPath?: string;
  thumbnailSource?: 'auto' | 'custom';
  publishMode?: PublishMode;
  scheduledAt?: Date;
}

export interface UseImmediateUploadOptions {
  onUploadComplete?: (videoId: number, videoUuid: string) => void;
  onPublishComplete?: () => void;
  onError?: (error: string) => void;
}

export interface UseImmediateUploadReturn {
  state: ImmediateUploadState;
  storeUploadId: string | null; // ID in global store
  storeUpload: ActiveUpload | undefined; // Current upload from store
  startUpload: (file: File) => Promise<void>;
  updateMetadata: (data: Partial<ImmediateUploadFormData>) => void;
  publish: (visibility: 'live' | 'draft') => Promise<void>;
  pauseUpload: () => void;
  resumeUpload: () => void;
  retryUpload: () => void; // Manual retry after circuit breaker trips
  cancel: () => void;
  reset: () => void;
  setModalStep: (step: ImmediateUploadState['modalStep']) => void;
  /** Attach to an existing upload (for resume mode) */
  attachToUpload: (uploadId: string) => ActiveUpload | null;
}

const initialState: ImmediateUploadState = {
  uploadId: null,
  videoId: null,
  videoUuid: null,
  uploadPhase: 'idle',
  uploadProgress: 0,
  bytesUploaded: 0,
  bytesTotal: 0,
  detectedType: null,
  aspectRatio: null,
  isDraft: true,
  canPublish: false,
  isPaused: false,
  error: null,
  modalStep: 'details',
};

/**
 * Mock mode for testing UI flows without API calls
 */
const MOCK_MODE =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MOCK_UPLOAD === 'true';

/**
 * Circuit breaker configuration
 */
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

/**
 * Check if error is a server error (5xx) or network failure
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return true;
    }
    // Check for HTTP status in error message
    const statusMatch = message.match(/(\d{3})/);
    if (statusMatch && statusMatch[1]) {
      const status = parseInt(statusMatch[1], 10);
      return status >= 500 && status < 600;
    }
  }
  return false;
}

/**
 * Hook for immediate upload flow with global store integration
 *
 * This version integrates with useUploadStore for:
 * - Persistence across modal close
 * - Circuit breaker pattern (max 3 retries)
 * - Background upload visibility
 *
 * Flow:
 * 1. User drops/selects file
 * 2. Detect aspect ratio → auto-classify as video/short
 * 3. Call API to prepare upload (creates draft)
 * 4. Start TUS upload in background
 * 5. User fills form while upload progresses
 * 6. User clicks Publish → update metadata + visibility
 */
export function useImmediateUploadV2({
  onUploadComplete,
  onPublishComplete,
  onError,
}: UseImmediateUploadOptions = {}): UseImmediateUploadReturn {
  // Global store
  const store = useUploadStore();

  // Local refs for this instance
  const currentUploadIdRef = useRef<string | null>(null);
  const uploadRef = useRef<{ abort: () => void; start: () => void } | null>(null);
  const aspectRatioRef = useRef<AspectRatioResult | null>(null);
  const retryCountRef = useRef(0);
  const fileRef = useRef<File | null>(null);
  const tusConfigRef = useRef<TusUploadConfig | null>(null);

  /**
   * Derive local state from global store for backward compatibility
   */
  const getStateFromStore = useCallback((): ImmediateUploadState => {
    const uploadId = currentUploadIdRef.current;
    if (!uploadId) return initialState;

    const upload = store.getUpload(uploadId);
    if (!upload) return initialState;

    return {
      uploadId: upload.bunnyVideoId,
      videoId: upload.videoId,
      videoUuid: upload.videoUuid,
      uploadPhase: upload.phase,
      uploadProgress: upload.progress,
      bytesUploaded: upload.bytesUploaded,
      bytesTotal: upload.bytesTotal,
      detectedType: upload.contentType,
      aspectRatio: aspectRatioRef.current,
      isDraft: upload.phase !== 'complete',
      canPublish: upload.phase === 'complete',
      isPaused: upload.isPaused,
      error: upload.error,
      modalStep: upload.modalStep ?? 'details',
    };
  }, [store]);

  // Subscribe to store changes for this upload
  const storeUpload = currentUploadIdRef.current
    ? store.getUpload(currentUploadIdRef.current)
    : undefined;

  const state = storeUpload ? getStateFromStore() : initialState;

  /**
   * Handle TUS upload error with circuit breaker
   */
  const handleUploadError = useCallback(
    async (error: Error) => {
      const uploadId = currentUploadIdRef.current;
      if (!uploadId) return;

      const errorMsg = error.message || 'Upload failed';

      // Check for 404 specifically - indicates stale/invalid upload session
      const is404 = errorMsg.includes('404') || errorMsg.toLowerCase().includes('not found');
      if (is404) {
        console.warn('[Upload] 404 detected - clearing stale upload fingerprint');
        // Clear TUS localStorage for this fingerprint to prevent future stale resumes
        const upload = store.getUpload(uploadId);
        if (upload?.tusFingerprint) {
          try {
            localStorage.removeItem(upload.tusFingerprint);
          } catch {
            // Ignore localStorage errors
          }
        }
        // Don't retry 404 - go straight to error
        store.setPhase(uploadId, 'error', 'Upload session expired. Please try again.');
        onError?.('Upload session expired. Please try again.');
        return;
      }

      // Check if retryable
      if (isRetryableError(error) && store.canRetry(uploadId)) {
        // Record failure and check if we can retry
        const canRetry = store.recordFailure(uploadId, errorMsg);

        if (canRetry) {
          retryCountRef.current++;
          console.log(
            `[Upload] Retry ${retryCountRef.current}/${MAX_RETRIES} after error: ${errorMsg}`
          );

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

          // Attempt retry if TUS client exists
          if (uploadRef.current) {
            try {
              uploadRef.current.start();
              return; // Exit - retry in progress
            } catch (retryError) {
              console.error('[Upload] Retry failed:', retryError);
            }
          }
        }
      }

      // Circuit breaker tripped or non-retryable error
      store.setPhase(uploadId, 'error', errorMsg);
      onError?.(errorMsg);
    },
    [store, onError]
  );

  /**
   * Start the immediate upload process
   */
  const startUpload = useCallback(
    async (file: File) => {
      // Reset retry count
      retryCountRef.current = 0;
      fileRef.current = file;

      try {
        // Step 1: Detect aspect ratio
        const aspectRatio = await detectVideoAspectRatio(file);
        const detectedType = aspectRatio.classification;
        aspectRatioRef.current = aspectRatio;

        // Auto-fill title from filename
        const titleFromFile = file.name.replace(/\.[^/.]+$/, '');

        // Check for existing upload with same file signature (deduplication)
        const { id: uploadId, isExisting } = store.addOrFindUpload({
          videoId: null,
          videoUuid: null,
          bunnyVideoId: null,
          fileName: file.name,
          fileSize: file.size,
          contentType: detectedType,
          phase: 'preparing',
          progress: 0,
          bytesUploaded: 0,
          bytesTotal: file.size,
          tusFingerprint: null,
          metadata: {
            title: titleFromFile,
            thumbnailSource: 'auto',
            publishMode: 'none',
          },
          isPaused: false,
          error: null,
        });

        currentUploadIdRef.current = uploadId;

        // Store file reference for video preview (in-memory only)
        fileReferenceStore.set(uploadId, file);

        // Mark modal as open for this upload (prevents auto-clear)
        store.setModalOpen(uploadId, true);

        // If existing upload found, check if it's stale and handle accordingly
        if (isExisting) {
          const existingUpload = store.getUpload(uploadId);
          if (existingUpload?.isStale) {
            // Clear stale flag and re-prepare the upload
            store.updateUpload(uploadId, { isStale: false, phase: 'preparing', error: null });
            console.log('[Upload] Found stale upload, restarting:', uploadId);
          } else {
            // Non-stale existing upload - just attach to it
            console.log('[Upload] Found existing upload, attaching:', uploadId);
            return;
          }
        }

        // Mock mode: simulate upload progress without API calls
        if (MOCK_MODE) {
          const mockVideoId = Math.floor(Math.random() * 10000);
          const mockVideoUuid = `mock-${Date.now()}-${mockVideoId}`;

          store.updateUpload(uploadId, {
            videoId: mockVideoId,
            videoUuid: mockVideoUuid,
            bunnyVideoId: `mock-bunny-${mockVideoId}`,
            phase: 'uploading',
          });

          // Simulate upload progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            const bytesUploaded = Math.floor((progress / 100) * file.size);

            store.updateProgress(uploadId, progress, bytesUploaded);

            if (progress >= 100) {
              clearInterval(interval);
              store.setPhase(uploadId, 'processing');

              // Simulate processing delay
              setTimeout(() => {
                store.setPhase(uploadId, 'complete');
                onUploadComplete?.(mockVideoId, mockVideoUuid);
              }, 1000);
            }
          }, 500);

          return;
        }

        // Step 2: Prepare upload (creates draft in backend)
        const prepareResponse = await studioClient.prepareBunnyUpload({
          title: titleFromFile,
          short: detectedType === 'short',
          publish_mode: 'none', // Force draft mode - prevents backend auto-publish job
        });

        store.updateUpload(uploadId, {
          videoId: prepareResponse.video_id,
          videoUuid: prepareResponse.video_uuid,
          bunnyVideoId: prepareResponse.bunny_video_id,
        });

        tusConfigRef.current = prepareResponse.upload_config;

        // Step 3: Start TUS upload
        store.setPhase(uploadId, 'uploading');

        await startTusUpload(
          file,
          prepareResponse.upload_config,
          uploadId,
          prepareResponse.video_id,
          prepareResponse.video_uuid
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to start upload';
        const uploadId = currentUploadIdRef.current;

        if (uploadId) {
          store.setPhase(uploadId, 'error', errorMsg);
        }
        onError?.(errorMsg);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startTusUpload is stable via refs
    [store, onError, onUploadComplete]
  );

  /**
   * Internal: Start TUS upload with circuit breaker integration
   */
  const startTusUpload = useCallback(
    async (
      file: File,
      tusConfig: TusUploadConfig,
      uploadId: string,
      videoId: number,
      videoUuid: string
    ) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tus = (await import('tus-js-client')) as any;

        const upload = new tus.Upload(file, {
          endpoint: tusConfig.endpoint,
          // Circuit breaker handles retries, so minimal TUS retries
          // Reduced from [0, 1000, 2000] to fail faster on 404s
          retryDelays: [0, 1000],
          headers: {
            AuthorizationSignature: tusConfig.headers.AuthorizationSignature,
            AuthorizationExpire: String(tusConfig.headers.AuthorizationExpire),
            LibraryId: tusConfig.headers.LibraryId,
            VideoId: tusConfig.headers.VideoId,
            filetype: file.type,
          },
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          onError: (error: Error) => {
            console.log('[TUS] onError:', error.message);
            handleUploadError(error);
          },
          onProgress: (bytesUploaded: number, bytesTotal: number) => {
            const upload = store.getUpload(uploadId);
            // Don't update progress if paused (prevents race condition with abort)
            if (upload?.isPaused) return;

            const percentage = bytesTotal > 0 ? (bytesUploaded / bytesTotal) * 100 : 0;
            store.updateProgress(uploadId, Math.round(percentage), bytesUploaded);
          },
          onSuccess: () => {
            console.log('[TUS] onSuccess:', uploadId);
            // Clear any stale error before transitioning to processing
            store.clearError(uploadId);
            store.setPhase(uploadId, 'processing');
            store.updateProgress(uploadId, 100, file.size);

            // After short delay, mark as ready
            setTimeout(() => {
              // Clear error again before complete (defensive)
              store.clearError(uploadId);
              store.setPhase(uploadId, 'complete');
              onUploadComplete?.(videoId, videoUuid);
            }, 500);
          },
        });

        uploadRef.current = upload;

        // Store fingerprint for resume capability
        // Include VideoId to prevent resuming stale uploads with different Bunny video IDs
        const fingerprint = `tus::${tusConfig.headers.VideoId}::${file.name}-${file.size}-${file.lastModified}`;
        store.updateUpload(uploadId, { tusFingerprint: fingerprint });

        // Check for previous uploads to resume
        const previousUploads = await upload.findPreviousUploads();
        if (previousUploads.length > 0 && previousUploads[0]) {
          const previousUrl = previousUploads[0].uploadUrl;
          // Only resume if the URL contains our current VideoId
          // This prevents 404s from attempting to resume uploads with different Bunny video IDs
          if (previousUrl && previousUrl.includes(tusConfig.headers.VideoId)) {
            console.log('[Upload] Resuming from previous upload');
            upload.resumeFromPreviousUpload(previousUploads[0]);
          } else {
            console.log('[Upload] Previous upload found but VideoId mismatch, starting fresh');
          }
        }

        upload.start();
      } catch (error) {
        handleUploadError(error instanceof Error ? error : new Error('Failed to start TUS upload'));
      }
    },
    [store, handleUploadError, onUploadComplete]
  );

  /**
   * Update form metadata (syncs to global store)
   */
  const updateMetadata = useCallback(
    (data: Partial<ImmediateUploadFormData>) => {
      const uploadId = currentUploadIdRef.current;
      if (!uploadId) return;

      // Map form data to store metadata format
      const storeMetadata: Partial<ActiveUpload['metadata']> = {};

      if (data.title !== undefined) storeMetadata.title = data.title;
      if (data.description !== undefined) storeMetadata.description = data.description;
      if (data.tags !== undefined) storeMetadata.tags = data.tags;
      if (data.tagSlugs !== undefined) storeMetadata.tagSlugs = data.tagSlugs;
      if (data.isAdultContent !== undefined) storeMetadata.isAdultContent = data.isAdultContent;
      if (data.countryId !== undefined) storeMetadata.countryId = data.countryId;
      if (data.location !== undefined) storeMetadata.location = data.location;
      if (data.latitude !== undefined) storeMetadata.latitude = data.latitude;
      if (data.longitude !== undefined) storeMetadata.longitude = data.longitude;
      if (data.thumbnailPath !== undefined) storeMetadata.thumbnailPath = data.thumbnailPath;
      if (data.thumbnailSource !== undefined) storeMetadata.thumbnailSource = data.thumbnailSource;
      if (data.publishMode !== undefined) storeMetadata.publishMode = data.publishMode;
      if (data.scheduledAt !== undefined)
        storeMetadata.scheduledAt = data.scheduledAt.toISOString();

      store.updateMetadata(uploadId, storeMetadata);
    },
    [store]
  );

  /**
   * Publish the video (update metadata then handle publish via schedule API)
   * Split into two API calls:
   * 1. PATCH metadata (title, description, tags, etc.) - no publish_mode
   * 2. POST /schedule for publish action (if publishing)
   */
  const publish = useCallback(
    async (visibility: 'live' | 'draft') => {
      const uploadId = currentUploadIdRef.current;
      if (!uploadId) {
        onError?.('No upload to publish');
        return;
      }

      const upload = store.getUpload(uploadId);

      // UUID GUARD: Block publish until videoUuid is ready
      if (!upload || !upload.videoUuid) {
        onError?.('Video not ready. Please wait for preparation to complete.');
        return;
      }

      // Mock mode
      if (MOCK_MODE) {
        console.log('[Mock Mode] Publishing:', { uploadId, visibility, metadata: upload.metadata });
        await new Promise((resolve) => setTimeout(resolve, 500));
        onPublishComplete?.();
        return;
      }

      try {
        // Step 1: Update metadata only (no publish_mode)
        const metadataPayload: UpdateVideoPayload = {
          title: upload.metadata.title,
        };

        // Optional metadata
        if (upload.metadata.description) metadataPayload.description = upload.metadata.description;
        if (upload.metadata.isAdultContent !== undefined)
          metadataPayload.is_adult_content = upload.metadata.isAdultContent;
        if (upload.metadata.countryId) metadataPayload.country_id = upload.metadata.countryId;
        if (upload.metadata.location) metadataPayload.location = upload.metadata.location;
        if (upload.metadata.latitude) metadataPayload.latitude = upload.metadata.latitude;
        if (upload.metadata.longitude) metadataPayload.longitude = upload.metadata.longitude;

        // TAG CONVERSION: Use slugs for API (IDs are kept in store for UI)
        if (upload.metadata.tagSlugs?.length) {
          metadataPayload.tags = upload.metadata.tagSlugs;
        }

        // Update metadata first
        await studioClient.updateVideo(upload.videoUuid, metadataPayload);

        // Step 2: Handle publish via schedule API
        if (visibility === 'live') {
          if (upload.metadata.publishMode === 'scheduled' && upload.metadata.scheduledAt) {
            // Schedule for later
            await studioClient.createSchedule(upload.videoUuid, {
              publish_mode: 'scheduled',
              scheduled_at: upload.metadata.scheduledAt,
            });
          } else {
            // Publish now
            await studioClient.createSchedule(upload.videoUuid, {
              publish_mode: 'auto',
            });
          }
        }
        // visibility === 'draft' -> Skip schedule call (already draft from handshake)

        onPublishComplete?.();
      } catch (error) {
        // Graceful error handling - TUS upload continues
        const msg = error instanceof Error ? error.message : '';
        if (msg.includes('403') || msg.includes('authorized')) {
          onError?.('You do not have permission to modify this video.');
          return;
        }
        if (msg.includes('404') || msg.includes('not found')) {
          onError?.('Video not found. It may have been deleted.');
          return;
        }
        onError?.(msg || 'Failed to publish');
      }
    },
    [store, onError, onPublishComplete]
  );

  /**
   * Pause the upload
   */
  const pauseUpload = useCallback(() => {
    const uploadId = currentUploadIdRef.current;
    if (!uploadId) return;

    const upload = store.getUpload(uploadId);
    if (upload?.phase === 'uploading' && uploadRef.current) {
      uploadRef.current.abort();
      store.pauseUpload(uploadId);
    }
  }, [store]);

  /**
   * Resume the upload
   */
  const resumeUpload = useCallback(() => {
    const uploadId = currentUploadIdRef.current;
    if (!uploadId) return;

    const upload = store.getUpload(uploadId);
    if (upload?.isPaused && uploadRef.current) {
      uploadRef.current.start();
      store.resumeUpload(uploadId);
    }
  }, [store]);

  /**
   * Manual retry after circuit breaker trips or stale session
   * Requires explicit user action - prevents infinite loops
   */
  const retryUpload = useCallback(async () => {
    const uploadId = currentUploadIdRef.current;
    if (!uploadId) return;

    const upload = store.getUpload(uploadId);
    // Allow retry for error or stale uploads
    if (!upload || (upload.phase !== 'error' && !upload.isStale)) return;

    // Reset circuit breaker and stale flag
    store.resetCircuitBreaker(uploadId);
    store.updateUpload(uploadId, { isStale: false });
    retryCountRef.current = 0;

    // Re-attempt upload
    const file = fileRef.current;
    const tusConfig = tusConfigRef.current;

    if (file && tusConfig && upload.videoId && upload.videoUuid && !upload.isStale) {
      // Can resume with existing TUS config (error retry, not stale)
      store.setPhase(uploadId, 'uploading');
      await startTusUpload(file, tusConfig, uploadId, upload.videoId, upload.videoUuid);
    } else if (file) {
      // Need to re-prepare upload (stale session or missing config)
      store.removeUpload(uploadId);
      currentUploadIdRef.current = null;
      await startUpload(file);
    }
  }, [store, startTusUpload, startUpload]);

  /**
   * Cancel the upload
   */
  const cancel = useCallback(() => {
    const uploadId = currentUploadIdRef.current;

    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
    }

    if (uploadId) {
      // Clear modal open flag before removing
      store.setModalOpen(uploadId, false);
      store.removeUpload(uploadId);
    }

    currentUploadIdRef.current = null;
    aspectRatioRef.current = null;
    retryCountRef.current = 0;
    fileRef.current = null;
    tusConfigRef.current = null;
  }, [store]);

  /**
   * Reset state (keep store entry for background tracking)
   */
  const reset = useCallback(() => {
    // Clear modal open flag before resetting
    const uploadId = currentUploadIdRef.current;
    if (uploadId) {
      store.setModalOpen(uploadId, false);
    }

    uploadRef.current = null;
    currentUploadIdRef.current = null;
    aspectRatioRef.current = null;
    retryCountRef.current = 0;
    fileRef.current = null;
    tusConfigRef.current = null;
  }, [store]);

  /**
   * Set modal step (persisted in store)
   */
  const setModalStep = useCallback(
    (step: ImmediateUploadState['modalStep']) => {
      const uploadId = currentUploadIdRef.current;
      if (uploadId) {
        store.updateModalStep(uploadId, step);
      }
    },
    [store]
  );

  /**
   * Attach to an existing upload (for resume mode)
   * Sets currentUploadIdRef and marks modal as open
   */
  const attachToUpload = useCallback(
    (uploadId: string): ActiveUpload | null => {
      const upload = store.getUpload(uploadId);
      if (!upload) return null;

      currentUploadIdRef.current = uploadId;
      store.setModalOpen(uploadId, true);
      return upload;
    },
    [store]
  );

  // Cleanup on unmount (but don't remove from store - upload continues)
  useEffect(() => {
    return () => {
      // Clear modal open flag when component unmounts
      const uploadId = currentUploadIdRef.current;
      if (uploadId) {
        // Use getState() for imperative access - doesn't trigger re-renders
        useUploadStore.getState().setModalOpen(uploadId, false);
      }
      // Don't cancel upload - let it continue in background
      uploadRef.current = null;
    };
  }, []); // Empty deps - only runs on unmount

  return {
    state,
    storeUploadId: currentUploadIdRef.current,
    storeUpload,
    startUpload,
    updateMetadata,
    publish,
    pauseUpload,
    resumeUpload,
    retryUpload,
    cancel,
    reset,
    setModalStep,
    attachToUpload,
  };
}
