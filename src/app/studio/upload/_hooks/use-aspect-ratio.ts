'use client';

import { useState, useCallback } from 'react';

export interface AspectRatioResult {
  width: number;
  height: number;
  ratio: number;
  classification: 'video' | 'short';
}

export interface UseAspectRatioReturn {
  detectAspectRatio: (file: File) => Promise<AspectRatioResult>;
  isDetecting: boolean;
  result: AspectRatioResult | null;
  error: string | null;
}

/**
 * Threshold for classifying video orientation
 * ratio < 0.9 → Short (portrait/vertical, e.g., 9:16)
 * ratio >= 0.9 → Video (landscape/horizontal, e.g., 16:9)
 */
const ASPECT_RATIO_THRESHOLD = 0.9;

/**
 * Hook to detect video aspect ratio from file metadata
 * Used to auto-classify uploads as Video or Short based on dimensions
 */
export function useAspectRatio(): UseAspectRatioReturn {
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<AspectRatioResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectAspectRatio = useCallback(async (file: File): Promise<AspectRatioResult> => {
    setIsDetecting(true);
    setError(null);

    return new Promise((resolve, reject) => {
      // Create video element for metadata extraction
      const video = document.createElement('video');
      video.preload = 'metadata';

      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        video.remove();
      };

      video.onloadedmetadata = () => {
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (width === 0 || height === 0) {
          cleanup();
          const errorMsg = 'Could not determine video dimensions';
          setError(errorMsg);
          setIsDetecting(false);
          reject(new Error(errorMsg));
          return;
        }

        const ratio = width / height;
        const classification = ratio < ASPECT_RATIO_THRESHOLD ? 'short' : 'video';

        const aspectResult: AspectRatioResult = {
          width,
          height,
          ratio,
          classification,
        };

        cleanup();
        setResult(aspectResult);
        setIsDetecting(false);
        resolve(aspectResult);
      };

      video.onerror = () => {
        cleanup();
        const errorMsg = 'Failed to load video metadata';
        setError(errorMsg);
        setIsDetecting(false);
        reject(new Error(errorMsg));
      };

      // Set a timeout for loading metadata
      const timeout = setTimeout(() => {
        cleanup();
        const errorMsg = 'Timeout loading video metadata';
        setError(errorMsg);
        setIsDetecting(false);
        reject(new Error(errorMsg));
      }, 10000); // 10 second timeout

      video.onloadedmetadata = function () {
        clearTimeout(timeout);
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (width === 0 || height === 0) {
          cleanup();
          const errorMsg = 'Could not determine video dimensions';
          setError(errorMsg);
          setIsDetecting(false);
          reject(new Error(errorMsg));
          return;
        }

        const ratio = width / height;
        const classification = ratio < ASPECT_RATIO_THRESHOLD ? 'short' : 'video';

        const aspectResult: AspectRatioResult = {
          width,
          height,
          ratio,
          classification,
        };

        cleanup();
        setResult(aspectResult);
        setIsDetecting(false);
        resolve(aspectResult);
      };

      video.src = objectUrl;
    });
  }, []);

  return {
    detectAspectRatio,
    isDetecting,
    result,
    error,
  };
}

/**
 * Utility function to detect aspect ratio without hook state
 * Useful for one-off detection in callbacks
 */
export async function detectVideoAspectRatio(file: File): Promise<AspectRatioResult> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout loading video metadata'));
    }, 10000);

    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (width === 0 || height === 0) {
        cleanup();
        reject(new Error('Could not determine video dimensions'));
        return;
      }

      const ratio = width / height;
      const classification = ratio < ASPECT_RATIO_THRESHOLD ? 'short' : 'video';

      cleanup();
      resolve({ width, height, ratio, classification });
    };

    video.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error('Failed to load video metadata'));
    };

    video.src = objectUrl;
  });
}
