'use client';

import { useState, useCallback, useRef } from 'react';
import { studioClient } from '@/api/client/studio.client';
import type { TusUploadConfig, UploadPhase, PublishMode } from '../_config/types';
import { detectVideoAspectRatio, type AspectRatioResult } from './use-aspect-ratio';

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
  error: string | null;
}

export interface ImmediateUploadFormData {
  title: string;
  description?: string;
  tags?: number[];
  isAdultContent?: boolean;
  countryId?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  thumbnailPath?: string;
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
  startUpload: (file: File) => Promise<void>;
  updateMetadata: (data: Partial<ImmediateUploadFormData>) => void;
  publish: (visibility: 'public' | 'private' | 'unlisted') => Promise<void>;
  cancel: () => void;
  reset: () => void;
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
  error: null,
};

/**
 * Mock mode for testing UI flows without API calls
 * Enable with NEXT_PUBLIC_MOCK_UPLOAD=true
 */
const MOCK_MODE =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MOCK_UPLOAD === 'true';

/**
 * Hook for immediate upload flow (YouTube Studio pattern)
 *
 * Flow:
 * 1. User drops/selects file
 * 2. Detect aspect ratio → auto-classify as video/short
 * 3. Call API to prepare upload (creates draft)
 * 4. Start TUS upload in background
 * 5. User fills form while upload progresses
 * 6. User clicks Publish → update metadata + visibility
 */
export function useImmediateUpload({
  onUploadComplete,
  onPublishComplete,
  onError,
}: UseImmediateUploadOptions = {}): UseImmediateUploadReturn {
  const [state, setState] = useState<ImmediateUploadState>(initialState);
  const uploadRef = useRef<{ abort: () => void } | null>(null);
  const formDataRef = useRef<ImmediateUploadFormData>({ title: '' });

  /**
   * Start the immediate upload process
   */
  const startUpload = useCallback(
    async (file: File) => {
      setState((prev) => ({
        ...prev,
        uploadPhase: 'preparing',
        error: null,
      }));

      try {
        // Step 1: Detect aspect ratio
        const aspectRatio = await detectVideoAspectRatio(file);
        const detectedType = aspectRatio.classification;

        setState((prev) => ({
          ...prev,
          detectedType,
          aspectRatio,
        }));

        // Auto-fill title from filename
        const titleFromFile = file.name.replace(/\.[^/.]+$/, '');
        formDataRef.current.title = titleFromFile;

        // Mock mode: simulate upload progress without API calls
        if (MOCK_MODE) {
          const mockVideoId = Math.floor(Math.random() * 10000);
          const mockVideoUuid = `mock-${Date.now()}-${mockVideoId}`;

          setState((prev) => ({
            ...prev,
            uploadId: `mock-bunny-${mockVideoId}`,
            videoId: mockVideoId,
            videoUuid: mockVideoUuid,
            uploadPhase: 'uploading',
            bytesTotal: file.size,
          }));

          // Simulate upload progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            const bytesUploaded = Math.floor((progress / 100) * file.size);

            setState((prev) => ({
              ...prev,
              uploadProgress: progress,
              bytesUploaded,
            }));

            if (progress >= 100) {
              clearInterval(interval);
              setState((prev) => ({
                ...prev,
                uploadPhase: 'processing',
              }));

              // Simulate processing delay
              setTimeout(() => {
                setState((prev) => ({
                  ...prev,
                  uploadPhase: 'complete',
                  canPublish: true,
                }));
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
          // Draft mode - not published yet
        });

        setState((prev) => ({
          ...prev,
          uploadId: prepareResponse.bunny_video_id,
          videoId: prepareResponse.video_id,
          videoUuid: prepareResponse.video_uuid,
        }));

        // Step 3: Start TUS upload
        setState((prev) => ({
          ...prev,
          uploadPhase: 'uploading',
          bytesTotal: file.size,
        }));

        await startTusUpload(
          file,
          prepareResponse.upload_config,
          prepareResponse.video_id,
          prepareResponse.video_uuid
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to start upload';
        setState((prev) => ({
          ...prev,
          uploadPhase: 'error',
          error: errorMsg,
        }));
        onError?.(errorMsg);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startTusUpload is stable and defined in same render
    [onError, onUploadComplete]
  );

  /**
   * Internal: Start TUS upload
   */
  const startTusUpload = useCallback(
    async (file: File, tusConfig: TusUploadConfig, videoId: number, videoUuid: string) => {
      try {
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
            const errorMsg = error.message || 'Upload failed';
            setState((prev) => ({
              ...prev,
              uploadPhase: 'error',
              error: errorMsg,
            }));
            onError?.(errorMsg);
          },
          onProgress: (bytesUploaded: number, bytesTotal: number) => {
            const percentage = bytesTotal > 0 ? (bytesUploaded / bytesTotal) * 100 : 0;
            setState((prev) => ({
              ...prev,
              uploadProgress: Math.round(percentage),
              bytesUploaded,
              bytesTotal,
            }));
          },
          onSuccess: () => {
            setState((prev) => ({
              ...prev,
              uploadPhase: 'processing',
              uploadProgress: 100,
            }));

            // After short delay, mark as ready
            setTimeout(() => {
              setState((prev) => ({
                ...prev,
                uploadPhase: 'complete',
                canPublish: true,
              }));
              onUploadComplete?.(videoId, videoUuid);
            }, 500);
          },
        });

        uploadRef.current = upload;

        // Check for previous uploads to resume
        const previousUploads = await upload.findPreviousUploads();
        if (previousUploads.length > 0 && previousUploads[0]) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        upload.start();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to start upload';
        setState((prev) => ({
          ...prev,
          uploadPhase: 'error',
          error: errorMsg,
        }));
        onError?.(errorMsg);
      }
    },
    [onError, onUploadComplete]
  );

  /**
   * Update form metadata (while upload is in progress)
   */
  const updateMetadata = useCallback((data: Partial<ImmediateUploadFormData>) => {
    formDataRef.current = { ...formDataRef.current, ...data };
  }, []);

  /**
   * Publish the video (update metadata and visibility)
   */
  const publish = useCallback(
    async (visibility: 'public' | 'private' | 'unlisted') => {
      const { videoId, detectedType } = state;
      if (!videoId) {
        onError?.('No video to publish');
        return;
      }

      // Mock mode: simulate publish without API calls
      if (MOCK_MODE) {
        console.log('[Mock Mode] Publishing with:', {
          videoId,
          visibility,
          metadata: formDataRef.current,
          detectedType,
        });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setState((prev) => ({
          ...prev,
          isDraft: false,
        }));

        onPublishComplete?.();
        return;
      }

      try {
        // Update metadata first - only include defined values
        const formData = formDataRef.current;
        const metadataPayload: Record<string, unknown> = { title: formData.title };
        if (formData.description !== undefined) metadataPayload.description = formData.description;
        if (formData.tags !== undefined) metadataPayload.tags = formData.tags;
        if (formData.isAdultContent !== undefined)
          metadataPayload.is_adult_content = formData.isAdultContent;
        if (formData.countryId !== undefined) metadataPayload.country_id = formData.countryId;
        if (formData.location !== undefined) metadataPayload.location = formData.location;
        if (formData.latitude !== undefined) metadataPayload.latitude = formData.latitude;
        if (formData.longitude !== undefined) metadataPayload.longitude = formData.longitude;
        if (formData.thumbnailPath !== undefined)
          metadataPayload.thumbnail_path = formData.thumbnailPath;

        await studioClient.updateVideoMetadata(
          videoId,
          metadataPayload as Parameters<typeof studioClient.updateVideoMetadata>[1]
        );

        // Update visibility
        const isShort = detectedType === 'short';
        if (isShort) {
          await studioClient.updateShortVisibility(videoId, { visibility });
        } else {
          await studioClient.updateVideoVisibility(videoId, { visibility });
        }

        setState((prev) => ({
          ...prev,
          isDraft: false,
        }));

        onPublishComplete?.();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to publish';
        onError?.(errorMsg);
      }
    },
    [state, onError, onPublishComplete]
  );

  /**
   * Cancel the upload
   */
  const cancel = useCallback(() => {
    uploadRef.current?.abort();
    uploadRef.current = null;
    setState(initialState);
    formDataRef.current = { title: '' };
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    uploadRef.current = null;
    setState(initialState);
    formDataRef.current = { title: '' };
  }, []);

  return {
    state,
    startUpload,
    updateMetadata,
    publish,
    cancel,
    reset,
  };
}
