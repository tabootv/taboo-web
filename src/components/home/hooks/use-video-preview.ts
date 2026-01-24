/**
 * Hook for managing video preview URL fetching and state
 */

import { useState, useCallback } from 'react';
import { videoClient as videosApi } from '@/api/client/video.client';
import type { Video } from '@/types';

interface UseVideoPreviewOptions {
  video: Video;
  initialUrl?: string | null;
}

/**
 * Hook for managing video preview URL
 */
export function useVideoPreview({ video, initialUrl }: UseVideoPreviewOptions) {
  const [fetchedPreviewUrl, setFetchedPreviewUrl] = useState<string | null>(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  // Get video URL for preview (prefer lower quality for preview, fallback to HLS or fetched URL)
  const initialPreviewUrl = initialUrl || video.url_480 || video.url_720 || video.url_1080 || video.url_hls || video.hls_url;
  const previewUrl = initialPreviewUrl || fetchedPreviewUrl;

  const fetchPreviewUrl = useCallback(async () => {
    // If no preview URL available, fetch it from the API
    if (!initialPreviewUrl && !fetchedPreviewUrl && !isFetchingUrl && video.id) {
      setIsFetchingUrl(true);
      try {
        const videoDetails = await videosApi.get(video.id);
        const url = videoDetails.url_480 || videoDetails.url_720 || videoDetails.url_1080 || videoDetails.url_hls || videoDetails.hls_url;
        if (url) {
          setFetchedPreviewUrl(url);
        }
      } catch (error) {
        console.error('Failed to fetch video preview URL:', error);
      } finally {
        setIsFetchingUrl(false);
      }
    }
  }, [initialPreviewUrl, fetchedPreviewUrl, isFetchingUrl, video.id]);

  return {
    previewUrl,
    fetchedPreviewUrl,
    isFetchingUrl,
    fetchPreviewUrl,
  };
}

