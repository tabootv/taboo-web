/**
 * Hook for managing video preview URL
 * Note: API fetch disabled - previews require HLS streams which aren't available
 * for most videos (they're MP4). Only use URLs already present on the video object.
 */

import { useCallback } from 'react';
import type { Video } from '@/types';

interface UseVideoPreviewOptions {
  video: Video;
  initialUrl?: string | null;
}

/**
 * Hook for managing video preview URL
 */
export function useVideoPreview({ video, initialUrl }: UseVideoPreviewOptions) {
  // Get video URL for preview (prefer lower quality for preview, fallback to HLS)
  const previewUrl = initialUrl || video.url_480 || video.url_720 || video.url_1080 || video.url_hls || video.hls_url || null;

  // No-op fetch function - API fetch disabled to avoid unnecessary requests
  const fetchPreviewUrl = useCallback(() => {}, []);

  return {
    previewUrl,
    fetchedPreviewUrl: null,
    isFetchingUrl: false,
    fetchPreviewUrl,
  };
}

