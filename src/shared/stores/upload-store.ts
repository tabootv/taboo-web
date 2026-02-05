'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PublishMode } from '@/app/studio/upload/_config/types';
import { fileReferenceStore } from './file-reference-store';

/**
 * Upload Phase States
 */
export type UploadPhase = 'idle' | 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';

/**
 * Circuit Breaker State
 * Prevents infinite retry loops (the "250 ghost videos" disaster)
 */
export interface CircuitBreakerState {
  failureCount: number;
  lastFailureAt: number | null;
  isOpen: boolean; // When open, no retries allowed - requires manual intervention
}

/**
 * Active Upload Entry
 */
export interface ActiveUpload {
  // Identity
  id: string; // Client-generated UUID for tracking
  videoId: number | null;
  videoUuid: string | null;
  bunnyVideoId: string | null;

  // File info
  fileName: string;
  fileSize: number;
  contentType: 'video' | 'short';

  // Progress
  phase: UploadPhase;
  progress: number; // 0-100
  bytesUploaded: number;
  bytesTotal: number;

  // TUS resumption
  tusFingerprint: string | null;

  // Metadata (form data collected during upload)
  metadata: {
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
    // Thumbnail
    thumbnailSource: 'auto' | 'custom';
    thumbnailPath?: string;
    // Publishing
    publishMode: PublishMode;
    scheduledAt?: string; // ISO timestamp
  };

  // Circuit breaker for this specific upload
  circuitBreaker: CircuitBreakerState;

  // State
  isPaused: boolean;
  isStale: boolean; // True for hydrated uploads with no live TUS client
  error: string | null;

  // Modal UI state
  modalStep: 'details' | 'location' | 'tags' | 'content-rating' | 'thumbnail' | 'publishing';
  hasOpenModal: boolean; // True when modal is open for this upload (prevents auto-clear)

  // Timestamps
  startedAt: number;
  lastProgressAt: number;
}

/**
 * Upload Store State Interface
 */
interface UploadState {
  // Active uploads map (supports concurrent uploads)
  uploads: Map<string, ActiveUpload>;

  // Queue for sequential processing
  maxConcurrent: number;

  // Global circuit breaker settings
  maxRetries: number;
  retryDelayMs: number;

  // Hydration flag
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // ============ ACTIONS ============

  /**
   * Add a new upload to the store
   * Returns the generated upload ID
   */
  addUpload: (
    upload: Omit<
      ActiveUpload,
      | 'id'
      | 'startedAt'
      | 'lastProgressAt'
      | 'circuitBreaker'
      | 'isStale'
      | 'modalStep'
      | 'hasOpenModal'
    >
  ) => string;

  /**
   * Find existing non-terminal upload matching file signature
   * Returns upload ID if found, null otherwise
   */
  findExistingUpload: (
    fileName: string,
    fileSize: number,
    contentType: 'video' | 'short'
  ) => string | null;

  /**
   * Add upload or return existing one with same signature
   * Returns { id, isExisting } to indicate if deduplication occurred
   */
  addOrFindUpload: (
    upload: Omit<
      ActiveUpload,
      | 'id'
      | 'startedAt'
      | 'lastProgressAt'
      | 'circuitBreaker'
      | 'isStale'
      | 'modalStep'
      | 'hasOpenModal'
    >
  ) => { id: string; isExisting: boolean };

  /**
   * Update an existing upload
   */
  updateUpload: (id: string, updates: Partial<ActiveUpload>) => void;

  /**
   * Update upload progress (optimized for frequent calls)
   */
  updateProgress: (id: string, progress: number, bytesUploaded: number) => void;

  /**
   * Set upload phase with optional error
   */
  setPhase: (id: string, phase: UploadPhase, error?: string) => void;

  /**
   * Update upload metadata
   */
  updateMetadata: (id: string, metadata: Partial<ActiveUpload['metadata']>) => void;

  /**
   * Pause an upload
   */
  pauseUpload: (id: string) => void;

  /**
   * Resume an upload
   */
  resumeUpload: (id: string) => void;

  /**
   * Update modal step for an upload
   */
  updateModalStep: (id: string, step: ActiveUpload['modalStep']) => void;

  /**
   * Set whether modal is open for an upload (prevents auto-clear)
   */
  setModalOpen: (id: string, isOpen: boolean) => void;

  /**
   * Clear error for an upload (without changing phase)
   */
  clearError: (id: string) => void;

  /**
   * Remove an upload from the store
   */
  removeUpload: (id: string) => void;

  /**
   * Clear all completed/errored uploads
   */
  clearCompleted: () => void;

  /**
   * Clean up orphaned uploads (older than 24h)
   */
  cleanupOrphaned: () => void;

  /**
   * Mark hydrated uploads as stale (no live TUS client)
   * Called during rehydration for uploads that were in progress
   */
  markHydratedUploadsStale: () => void;

  // ============ CIRCUIT BREAKER ACTIONS ============

  /**
   * Record a failure for an upload's circuit breaker
   * Returns true if retry is allowed, false if circuit is now open
   */
  recordFailure: (id: string, error: string) => boolean;

  /**
   * Reset circuit breaker for an upload (manual retry)
   */
  resetCircuitBreaker: (id: string) => void;

  /**
   * Check if retry is allowed for an upload
   */
  canRetry: (id: string) => boolean;

  // ============ SELECTORS ============

  /**
   * Get a specific upload
   */
  getUpload: (id: string) => ActiveUpload | undefined;

  /**
   * Get all active uploads as array
   */
  getActiveUploads: () => ActiveUpload[];

  /**
   * Get count of currently uploading items
   */
  getUploadingCount: () => number;

  /**
   * Get validated link for an upload
   * Returns /shorts/[uuid] or /video/[uuid] based on contentType
   */
  getUploadLink: (id: string) => string | null;

  /**
   * Check if any uploads are in progress
   */
  hasActiveUploads: () => boolean;
}

/**
 * Initial circuit breaker state
 */
const initialCircuitBreaker: CircuitBreakerState = {
  failureCount: 0,
  lastFailureAt: null,
  isOpen: false,
};

/**
 * Maximum age for orphaned upload cleanup (24 hours)
 */
const ORPHAN_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/**
 * Upload Store
 *
 * Global state for managing video uploads with:
 * - localStorage persistence (survives page reload)
 * - Map serialization (supports concurrent uploads)
 * - Circuit breaker pattern (prevents infinite retry loops)
 */
export const useUploadStore = create<UploadState>()(
  persist(
    (set, get) => ({
      uploads: new Map(),
      maxConcurrent: 2,
      maxRetries: 3,
      retryDelayMs: 3000,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // ============ ACTIONS ============

      addUpload: (upload) => {
        const id = crypto.randomUUID();
        const now = Date.now();

        set((state) => {
          const newUploads = new Map(state.uploads);
          newUploads.set(id, {
            ...upload,
            id,
            startedAt: now,
            lastProgressAt: now,
            circuitBreaker: { ...initialCircuitBreaker },
            isStale: false,
            modalStep: 'details', // Initialize modal step
            hasOpenModal: false,
          });
          return { uploads: newUploads };
        });

        return id;
      },

      findExistingUpload: (fileName, fileSize, contentType) => {
        const uploads = get().uploads;
        for (const [id, upload] of uploads) {
          // Match file signature
          if (
            upload.fileName === fileName &&
            upload.fileSize === fileSize &&
            upload.contentType === contentType &&
            // Non-terminal: not complete and not error
            upload.phase !== 'complete' &&
            upload.phase !== 'error'
          ) {
            return id;
          }
        }
        return null;
      },

      addOrFindUpload: (upload) => {
        // Check for existing upload with same signature
        const existingId = get().findExistingUpload(
          upload.fileName,
          upload.fileSize,
          upload.contentType
        );

        if (existingId) {
          return { id: existingId, isExisting: true };
        }

        // Create new upload
        const id = get().addUpload(upload);
        return { id, isExisting: false };
      },

      updateUpload: (id, updates) => {
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(id, {
            ...upload,
            ...updates,
            lastProgressAt: Date.now(),
          });
          return { uploads: newUploads };
        });
      },

      updateProgress: (id, progress, bytesUploaded) => {
        const upload = get().uploads.get(id);
        if (!upload) return;

        // Early return if values unchanged (progress updates are frequent)
        if (upload.progress === progress && upload.bytesUploaded === bytesUploaded) return;

        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(id, {
            ...upload,
            progress,
            bytesUploaded,
            lastProgressAt: Date.now(),
          });
          return { uploads: newUploads };
        });
      },

      setPhase: (id, phase, error) => {
        // Debug logging to trace error state
        if (error) {
          console.log('[UploadStore] setPhase with error:', { id, phase, error });
        }
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(id, {
            ...upload,
            phase,
            error: error ?? null,
            // Clear isPaused when transitioning away from uploading phase
            isPaused: phase === 'uploading' ? upload.isPaused : false,
            lastProgressAt: Date.now(),
          });
          return { uploads: newUploads };
        });
      },

      updateMetadata: (id, metadata) => {
        const upload = get().uploads.get(id);
        if (!upload) return;

        // Early return if no actual changes (shallow compare)
        const metadataKeys = Object.keys(metadata) as (keyof typeof metadata)[];
        const hasChanges = metadataKeys.some((key) => upload.metadata[key] !== metadata[key]);
        if (!hasChanges) return;

        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(id, {
            ...upload,
            metadata: { ...upload.metadata, ...metadata },
            lastProgressAt: Date.now(),
          });
          return { uploads: newUploads };
        });
      },

      pauseUpload: (id) => {
        const upload = get().uploads.get(id);
        if (upload && upload.phase === 'uploading') {
          get().updateUpload(id, { isPaused: true });
        }
      },

      resumeUpload: (id) => {
        const upload = get().uploads.get(id);
        // Reject resume for stale uploads - they need retry instead
        if (upload && upload.isPaused && !upload.isStale) {
          get().updateUpload(id, { isPaused: false });
        }
      },

      updateModalStep: (id, step) => {
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(id, {
            ...upload,
            modalStep: step,
          });
          return { uploads: newUploads };
        });
      },

      setModalOpen: (id, isOpen) => {
        const upload = get().uploads.get(id);
        // Early return if value unchanged - prevents infinite loops
        if (!upload || upload.hasOpenModal === isOpen) return;

        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(id, {
            ...upload,
            hasOpenModal: isOpen,
          });
          return { uploads: newUploads };
        });
      },

      clearError: (id) => {
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(id, {
            ...upload,
            error: null,
          });
          return { uploads: newUploads };
        });
      },

      removeUpload: (id) => {
        // Clean up file reference before removing from store
        fileReferenceStore.remove(id);

        set((state) => {
          const newUploads = new Map(state.uploads);
          newUploads.delete(id);
          return { uploads: newUploads };
        });
      },

      clearCompleted: () => {
        set((state) => {
          const newUploads = new Map(state.uploads);
          for (const [id, upload] of newUploads) {
            if (upload.phase === 'complete' || upload.phase === 'error') {
              // Clean up file reference before removing
              fileReferenceStore.remove(id);
              newUploads.delete(id);
            }
          }
          return { uploads: newUploads };
        });
      },

      cleanupOrphaned: () => {
        const now = Date.now();
        set((state) => {
          const newUploads = new Map(state.uploads);
          for (const [id, upload] of newUploads) {
            // Remove uploads older than 24h that are stuck
            if (now - upload.lastProgressAt > ORPHAN_THRESHOLD_MS) {
              // Clean up file reference before removing
              fileReferenceStore.remove(id);
              newUploads.delete(id);
            }
          }
          return { uploads: newUploads };
        });
      },

      markHydratedUploadsStale: () => {
        set((state) => {
          const newUploads = new Map(state.uploads);
          let hasChanges = false;

          for (const [id, upload] of newUploads) {
            // Mark as stale if in-progress or paused (no live TUS client after hydration)
            if (
              upload.phase === 'uploading' ||
              upload.phase === 'preparing' ||
              upload.phase === 'processing' ||
              upload.isPaused
            ) {
              newUploads.set(id, { ...upload, isStale: true });
              hasChanges = true;
            }
          }

          return hasChanges ? { uploads: newUploads } : state;
        });
      },

      // ============ CIRCUIT BREAKER ACTIONS ============

      recordFailure: (id, error) => {
        // Debug logging to trace error state
        console.log('[UploadStore] recordFailure:', { id, error });

        const state = get();
        const upload = state.uploads.get(id);
        if (!upload) return false;

        const newFailureCount = upload.circuitBreaker.failureCount + 1;
        const isOpen = newFailureCount >= state.maxRetries;

        set((s) => {
          const newUploads = new Map(s.uploads);
          const existingUpload = newUploads.get(id);
          if (!existingUpload) return s;

          newUploads.set(id, {
            ...existingUpload,
            circuitBreaker: {
              failureCount: newFailureCount,
              lastFailureAt: Date.now(),
              isOpen,
            },
            // If circuit is open, set phase to error
            ...(isOpen
              ? {
                  phase: 'error' as UploadPhase,
                  error: `Upload failed after ${state.maxRetries} attempts: ${error}. Please retry manually.`,
                }
              : {}),
          });
          return { uploads: newUploads };
        });

        // Return true if retry is still allowed, false if circuit is now open
        return !isOpen;
      },

      resetCircuitBreaker: (id) => {
        set((state) => {
          const upload = state.uploads.get(id);
          if (!upload) return state;

          const newUploads = new Map(state.uploads);
          newUploads.set(id, {
            ...upload,
            circuitBreaker: { ...initialCircuitBreaker },
            error: null,
          });
          return { uploads: newUploads };
        });
      },

      canRetry: (id) => {
        const upload = get().uploads.get(id);
        if (!upload) return false;
        return !upload.circuitBreaker.isOpen;
      },

      // ============ SELECTORS ============

      getUpload: (id) => get().uploads.get(id),

      getActiveUploads: () => Array.from(get().uploads.values()),

      getUploadingCount: () => {
        return Array.from(get().uploads.values()).filter(
          (u) => u.phase === 'uploading' || u.phase === 'preparing'
        ).length;
      },

      getUploadLink: (id) => {
        const upload = get().uploads.get(id);
        if (!upload || !upload.videoUuid) return null;

        // Generate correct URL based on content type
        const basePath = upload.contentType === 'short' ? '/shorts/' : '/video/';
        return `https://taboo.tv${basePath}${upload.videoUuid}`;
      },

      hasActiveUploads: () => {
        return Array.from(get().uploads.values()).some(
          (u) => u.phase === 'uploading' || u.phase === 'preparing' || u.phase === 'processing'
        );
      },
    }),
    {
      name: 'taboo-uploads',
      storage: createJSONStorage(() => localStorage),

      // Serialize Map to array for JSON storage
      partialize: (state) => ({
        uploads: Array.from(state.uploads.entries()),
      }),

      // Deserialize array back to Map on hydration
      merge: (persisted, current) => {
        const persistedState = persisted as {
          uploads?: [string, ActiveUpload][];
        };
        return {
          ...current,
          uploads: new Map(persistedState.uploads || []),
        };
      },

      // Called when store is rehydrated from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          // Clean up orphaned uploads on hydration
          state.cleanupOrphaned();
          // Mark in-progress uploads as stale (no live TUS client)
          state.markHydratedUploadsStale();
        }
      },
    }
  )
);

/**
 * Selector hooks for optimized subscriptions
 * Use these to avoid unnecessary re-renders
 */
export const useActiveUploads = () => useUploadStore((state) => state.getActiveUploads());
export const useUploadingCount = () => useUploadStore((state) => state.getUploadingCount());
export const useHasActiveUploads = () => useUploadStore((state) => state.hasActiveUploads());
export const useUploadById = (id: string) => useUploadStore((state) => state.getUpload(id));
