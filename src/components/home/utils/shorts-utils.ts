/**
 * Utility functions for shorts components
 */

import type { Video } from '@/types';

// Fisher-Yates shuffle for random order
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get best available video URL from a video object
export function getVideoUrl(video: Video | undefined | null): string | null {
  if (!video) return null;
  return video.url_480 || video.url_720 || video.url_1080 || video.url_hls || video.hls_url || null;
}

