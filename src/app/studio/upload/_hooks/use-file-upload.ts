'use client';

import { useCallback, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useFilePreview } from '@/hooks/use-file-preview';
import type { UploadConfig } from '../_config/types';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UseFileUploadOptions {
  config: UploadConfig;
  onVideoSelect?: (file: File) => void;
  onThumbnailSelect?: (file: File) => void;
}

export interface UseFileUploadReturn {
  // Video file state
  videoFile: File | null;
  videoPreviewUrl: string | null;
  setVideoFile: (file: File | null) => void;
  clearVideoFile: () => void;
  handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  videoInputRef: React.RefObject<HTMLInputElement | null>;

  // Thumbnail file state
  thumbnailFile: File | null;
  thumbnailPreviewUrl: string | null;
  setThumbnailFile: (file: File | null) => void;
  clearThumbnailFile: () => void;
  handleThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  thumbnailInputRef: React.RefObject<HTMLInputElement | null>;

  // Validation
  validateVideoFile: (file: File) => FileValidationResult;
  validateThumbnailFile: (file: File) => FileValidationResult;

  // Drag state
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

/**
 * Hook for managing file uploads with validation
 * Extends useFilePreview with validation and drag-and-drop support
 */
export function useFileUpload({
  config,
  onVideoSelect,
  onThumbnailSelect,
}: UseFileUploadOptions): UseFileUploadReturn {
  // File preview hooks
  const videoPreview = useFilePreview();
  const thumbnailPreview = useFilePreview();

  // Input refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Validate video file against config constraints
   */
  const validateVideoFile = useCallback(
    (file: File): FileValidationResult => {
      if (!file.type.startsWith('video/')) {
        return { valid: false, error: 'Please select a valid video file' };
      }

      if (file.size > config.file.maxFileSize) {
        return {
          valid: false,
          error: `${config.type === 'video' ? 'Video' : 'Short'} must be less than ${config.file.maxFileSizeLabel}`,
        };
      }

      return { valid: true };
    },
    [config]
  );

  /**
   * Validate thumbnail file against constraints
   */
  const validateThumbnailFile = useCallback(
    (file: File): FileValidationResult => {
      if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'Please select a valid image file' };
      }

      if (file.size > config.thumbnail.maxSize) {
        return {
          valid: false,
          error: `Thumbnail must be less than ${config.thumbnail.maxSizeLabel}`,
        };
      }

      return { valid: true };
    },
    [config]
  );

  /**
   * Handle video file selection from input
   */
  const handleVideoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = validateVideoFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      videoPreview.setFile(file);
      onVideoSelect?.(file);
    },
    [validateVideoFile, videoPreview, onVideoSelect]
  );

  /**
   * Handle video file drop
   */
  const handleVideoDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      const validation = validateVideoFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      videoPreview.setFile(file);
      onVideoSelect?.(file);
    },
    [validateVideoFile, videoPreview, onVideoSelect]
  );

  /**
   * Handle thumbnail file selection
   */
  const handleThumbnailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = validateThumbnailFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      thumbnailPreview.setFile(file);
      onThumbnailSelect?.(file);
    },
    [validateThumbnailFile, thumbnailPreview, onThumbnailSelect]
  );

  /**
   * Clear video file and reset input
   */
  const clearVideoFile = useCallback(() => {
    videoPreview.clearFile();
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }, [videoPreview]);

  /**
   * Clear thumbnail file and reset input
   */
  const clearThumbnailFile = useCallback(() => {
    thumbnailPreview.clearFile();
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  }, [thumbnailPreview]);

  return {
    // Video
    videoFile: videoPreview.file,
    videoPreviewUrl: videoPreview.previewUrl,
    setVideoFile: videoPreview.setFile,
    clearVideoFile,
    handleVideoChange,
    handleVideoDrop,
    videoInputRef,

    // Thumbnail
    thumbnailFile: thumbnailPreview.file,
    thumbnailPreviewUrl: thumbnailPreview.previewUrl,
    setThumbnailFile: thumbnailPreview.setFile,
    clearThumbnailFile,
    handleThumbnailChange,
    thumbnailInputRef,

    // Validation
    validateVideoFile,
    validateThumbnailFile,

    // Drag
    isDragging,
    setIsDragging,
  };
}
