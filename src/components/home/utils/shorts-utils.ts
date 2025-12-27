/**
 * Utility functions for shorts components
 */

import type { Video } from '@/types';

// Fisher-Yates shuffle for random order
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const temp = shuffled[i]!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}

/**
 * Shuffle shorts with recent ones first
 * Keeps the first N items (most recent) in their positions,
 * then shuffles the rest
 */
export function shuffleWithRecentFirst<T>(array: T[], recentCount: number = 3): T[] {
  if (array.length <= recentCount) {
    return [...array];
  }

  // Keep first N items (most recent)
  const recentItems = array.slice(0, recentCount);

  // Shuffle the rest
  const remainingItems = shuffleArray(array.slice(recentCount));

  return [...recentItems, ...remainingItems];
}

// Get best available video URL from a video object
export function getVideoUrl(video: Video | undefined | null): string | null {
  if (!video) return null;
  return video.url_480 || video.url_720 || video.url_1080 || video.url_hls || video.hls_url || null;
}
