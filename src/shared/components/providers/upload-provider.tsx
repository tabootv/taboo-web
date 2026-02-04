'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUploadStore, type ActiveUpload } from '@/shared/stores/upload-store';

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
  const pauseUpload = useUploadStore((state) => state.pauseUpload);
  const resumeUpload = useUploadStore((state) => state.resumeUpload);
  const cleanupOrphaned = useUploadStore((state) => state.cleanupOrphaned);

  // Track previous upload phases to detect completion
  const prevPhasesRef = useRef<Map<string, ActiveUpload['phase']>>(new Map());

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
    },
    [queryClient]
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

      // Update tracked phase
      prevPhasesRef.current.set(id, upload.phase);
    });

    // Clean up tracking for removed uploads
    prevPhasesRef.current.forEach((_, id) => {
      if (!uploads.has(id)) {
        prevPhasesRef.current.delete(id);
      }
    });
  }, [uploads, hasHydrated, handleUploadComplete]);

  /**
   * Handle online/offline events for upload pause/resume
   */
  useEffect(() => {
    if (!hasHydrated) return;

    const handleOffline = () => {
      console.log('[UploadProvider] Network offline - pausing uploads');
      uploads.forEach((upload, id) => {
        if (upload.phase === 'uploading' && !upload.isPaused) {
          pauseUpload(id);
        }
      });
    };

    const handleOnline = () => {
      console.log('[UploadProvider] Network online - resuming uploads');
      uploads.forEach((upload, id) => {
        if (upload.isPaused && upload.phase === 'uploading') {
          resumeUpload(id);
        }
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [hasHydrated, uploads, pauseUpload, resumeUpload]);

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

  return <>{children}</>;
}
