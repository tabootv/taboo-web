'use client';

import { useCallback, useRef, useState } from 'react';
import type { UploadPhase, TusUploadConfig } from '../_config/types';

// Type for tus upload instance
interface TusUploadInstance {
  start: () => void;
  abort: () => void;
  findPreviousUploads: () => Promise<{ size: number; uploadUrl?: string }[]>;
  resumeFromPreviousUpload: (previousUpload: { size: number; uploadUrl?: string }) => void;
}

export interface UploadProgressState {
  phase: UploadPhase;
  progress: number;
  bytesUploaded: number;
  bytesTotal: number;
  error: string | null;
}

export interface UseUploadProgressOptions {
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export interface UseUploadProgressReturn {
  state: UploadProgressState;
  startUpload: (file: File, tusConfig: TusUploadConfig) => void;
  pauseUpload: () => void;
  resumeUpload: () => void;
  cancelUpload: () => void;
  reset: () => void;
}

const initialState: UploadProgressState = {
  phase: 'idle',
  progress: 0,
  bytesUploaded: 0,
  bytesTotal: 0,
  error: null,
};

/**
 * Hook for managing TUS upload progress
 * Handles real progress tracking with tus-js-client
 */
export function useUploadProgress({
  onComplete,
  onError,
}: UseUploadProgressOptions = {}): UseUploadProgressReturn {
  const [state, setState] = useState<UploadProgressState>(initialState);

  // Store upload instance for pause/resume/cancel
  const uploadRef = useRef<{ start: () => void; abort: () => void } | null>(null);

  /**
   * Start a TUS upload
   */
  const startUpload = useCallback(
    async (file: File, tusConfig: TusUploadConfig) => {
      setState((prev) => ({
        ...prev,
        phase: 'preparing',
        progress: 0,
        error: null,
      }));

      try {
        // Dynamic import tus-js-client to keep it out of initial bundle
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tus = (await import('tus-js-client')) as any;

        const upload = new tus.Upload(file, {
          endpoint: tusConfig.endpoint,
          retryDelays: [0, 3000, 5000, 10000, 20000],
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
            const errorMessage = error.message || 'Upload failed';
            setState((prev) => ({
              ...prev,
              phase: 'error',
              error: errorMessage,
            }));
            onError?.(errorMessage);
          },
          onProgress: (bytesUploaded: number, bytesTotal: number) => {
            const percentage = bytesTotal > 0 ? (bytesUploaded / bytesTotal) * 100 : 0;
            setState((prev) => ({
              ...prev,
              phase: 'uploading',
              progress: Math.round(percentage),
              bytesUploaded,
              bytesTotal,
            }));
          },
          onSuccess: () => {
            setState((prev) => ({
              ...prev,
              phase: 'processing',
              progress: 100,
            }));

            // Short delay before marking complete
            setTimeout(() => {
              setState((prev) => ({
                ...prev,
                phase: 'complete',
              }));
              onComplete?.();
            }, 500);
          },
        }) as TusUploadInstance;

        uploadRef.current = upload;

        // Check for previous uploads to resume
        const previousUploads = await upload.findPreviousUploads();
        if (previousUploads.length > 0 && previousUploads[0]) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        setState((prev) => ({
          ...prev,
          phase: 'uploading',
          bytesTotal: file.size,
        }));

        upload.start();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start upload';
        setState((prev) => ({
          ...prev,
          phase: 'error',
          error: errorMessage,
        }));
        onError?.(errorMessage);
      }
    },
    [onComplete, onError]
  );

  /**
   * Pause the current upload
   */
  const pauseUpload = useCallback(() => {
    uploadRef.current?.abort();
  }, []);

  /**
   * Resume the upload (starts from where it left off)
   */
  const resumeUpload = useCallback(() => {
    uploadRef.current?.start();
  }, []);

  /**
   * Cancel the upload and reset state
   */
  const cancelUpload = useCallback(() => {
    uploadRef.current?.abort();
    uploadRef.current = null;
    setState(initialState);
  }, []);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    uploadRef.current = null;
    setState(initialState);
  }, []);

  return {
    state,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    reset,
  };
}
