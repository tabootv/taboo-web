'use client';

import { useCallback, useRef } from 'react';

/**
 * Returns a stable callback for video prefetch on hover.
 *
 * Previously this called `videoClient.play(videoId)` via `queryClient.prefetchQuery`,
 * but that hit `GET /videos/{id}/play` which records a view on the backend as a
 * side-effect — causing phantom views from the homepage (and anywhere else the
 * hook was used) that corrupted watch-time analytics.
 *
 * The video page already fetches data server-side and passes `initialData` to the
 * client TanStack Query hook, so no client-side data prefetch is needed.
 */
export function usePrefetchVideo() {
  const prefetchedIds = useRef(new Set<string>());

  return useCallback((_videoId: string) => {
    if (prefetchedIds.current.has(_videoId)) return;
    prefetchedIds.current.add(_videoId);
    // No-op: removed videoClient.play() prefetch to prevent phantom view recording.
    // The video page uses server-side initialData hydration — no prefetch needed.
  }, []);
}
