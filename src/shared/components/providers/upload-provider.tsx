'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUploadStore, type ActiveUpload } from '@/shared/stores/upload-store';

/**
 * Delay before auto-clearing completed uploads (5 seconds)
 */
const AUTO_CLEAR_DELAY_MS = 5000;

interface UploadProviderProps {
  children: React.ReactNode;
}

/**
 * UploadProvider - Root-level provider for managing background uploads
 *
 * Responsibilities:
 * - Hydrates upload store from localStorage on mount
 * - Handles online/offline events for auto-pause/resume
 * - Invalidates TanStack Query caches when uploads complete
 * - Cleans up orphaned uploads
 * - Provides global upload state management
 */
export function UploadProvider({ children }: UploadProviderProps) {
  const queryClient = useQueryClient();
  const hasHydrated = useUploadStore((state) => state._hasHydrated);
  const uploads = useUploadStore((state) => state.uploads);
  const removeUpload = useUploadStore((state) => state.removeUpload);
  const cleanupOrphaned = useUploadStore((state) => state.cleanupOrphaned);

  // Track previous upload phases to detect completion
  const prevPhasesRef = useRef<Map<string, ActiveUpload['phase']>>(new Map());

  // Track auto-clear timers per upload ID
  const clearTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  /**
   * Schedule auto-removal of a completed upload
   */
  const scheduleAutoClear = useCallback(
    (uploadId: string) => {
      // Don't schedule if already pending
      if (clearTimersRef.current.has(uploadId)) return;

      const timer = setTimeout(() => {
        clearTimersRef.current.delete(uploadId);
        removeUpload(uploadId);
        console.log('[UploadProvider] Auto-cleared completed upload:', uploadId);
      }, AUTO_CLEAR_DELAY_MS);

      clearTimersRef.current.set(uploadId, timer);
    },
    [removeUpload]
  );

  /**
   * Handle upload completion - invalidate relevant queries
   */
  const handleUploadComplete = useCallback(
    (upload: ActiveUpload) => {
      // Invalidate studio content queries to show the new video
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'shorts'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'content'] });

      // Also invalidate user's channel videos
      if (upload.videoUuid) {
        queryClient.invalidateQueries({ queryKey: ['channel', 'videos'] });
      }

      console.log('[UploadProvider] Upload complete, invalidated queries:', upload.id);

      // Schedule auto-removal after delay (only if modal not open)
      if (!upload.hasOpenModal) {
        scheduleAutoClear(upload.id);
      } else {
        console.log('[UploadProvider] Skipping auto-clear, modal is open:', upload.id);
      }
    },
    [queryClient, scheduleAutoClear]
  );

  /**
   * Detect phase transitions and handle completion
   */
  useEffect(() => {
    if (!hasHydrated) return;

    uploads.forEach((upload, id) => {
      const prevPhase = prevPhasesRef.current.get(id);

      // Detect transition to 'complete' phase
      if (prevPhase !== 'complete' && upload.phase === 'complete') {
        handleUploadComplete(upload);
      }
      // Schedule auto-clear for already-completed uploads on hydration (no prevPhase)
      // Only if modal is not open
      else if (prevPhase === undefined && upload.phase === 'complete' && !upload.hasOpenModal) {
        scheduleAutoClear(id);
      }

      // Update tracked phase
      prevPhasesRef.current.set(id, upload.phase);
    });

    // Clean up tracking and timers for removed uploads
    prevPhasesRef.current.forEach((_, id) => {
      if (!uploads.has(id)) {
        prevPhasesRef.current.delete(id);
        // Clear any pending auto-clear timer
        const timer = clearTimersRef.current.get(id);
        if (timer) {
          clearTimeout(timer);
          clearTimersRef.current.delete(id);
        }
      }
    });
  }, [uploads, hasHydrated, handleUploadComplete, scheduleAutoClear]);

  /**
   * Handle online/offline events for upload pause/resume
   * Uses getState() for imperative access - prevents unnecessary re-renders
   */
  useEffect(() => {
    if (!hasHydrated) return;

    const handleOffline = () => {
      console.log('[UploadProvider] Network offline - pausing uploads');
      // Use getState() for imperative access - doesn't trigger re-renders
      const uploads = useUploadStore.getState().uploads;
      const pause = useUploadStore.getState().pauseUpload;
      uploads.forEach((upload, id) => {
        if (upload.phase === 'uploading' && !upload.isPaused) {
          pause(id);
        }
      });
    };

    const handleOnline = () => {
      console.log('[UploadProvider] Network online - resuming uploads');
      const uploads = useUploadStore.getState().uploads;
      const resume = useUploadStore.getState().resumeUpload;
      uploads.forEach((upload, id) => {
        if (upload.isPaused && upload.phase === 'uploading') {
          resume(id);
        }
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [hasHydrated]); // Removed uploads, pauseUpload, resumeUpload from deps

  /**
   * Clean up orphaned uploads on mount (after hydration)
   */
  useEffect(() => {
    if (hasHydrated) {
      cleanupOrphaned();
    }
  }, [hasHydrated, cleanupOrphaned]);

  /**
   * Log hydration status for debugging
   */
  useEffect(() => {
    if (hasHydrated) {
      const activeCount = Array.from(uploads.values()).filter(
        (u) => u.phase === 'uploading' || u.phase === 'preparing' || u.phase === 'processing'
      ).length;

      if (activeCount > 0) {
        console.log(`[UploadProvider] Hydrated with ${activeCount} active upload(s)`);
      }
    }
  }, [hasHydrated, uploads]);

  /**
   * Cleanup all auto-clear timers on unmount
   */
  useEffect(() => {
    return () => {
      clearTimersRef.current.forEach((timer) => clearTimeout(timer));
      clearTimersRef.current.clear();
    };
  }, []);

  /**
   * Global beforeunload warning - warns user if ANY upload is active
   * Works regardless of whether UploadModal is open
   */
  useEffect(() => {
    const hasActiveUploads = Array.from(uploads.values()).some((u) =>
      ['preparing', 'uploading', 'processing'].includes(u.phase)
    );

    if (!hasActiveUploads) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [uploads]);

  return <>{children}</>;
}
