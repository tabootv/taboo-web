'use client';

import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { videoClient } from '@/api/client/video.client';
import { queryKeys } from '@/api/query-keys';

/**
 * Returns a function that prefetches video play data on hover.
 * Uses a Set to prevent duplicate prefetches for the same video.
 */
export function usePrefetchVideo() {
  const queryClient = useQueryClient();
  const prefetchedIds = useRef(new Set<string>());

  return useCallback(
    (videoId: string) => {
      if (prefetchedIds.current.has(videoId)) return;
      prefetchedIds.current.add(videoId);
      queryClient.prefetchQuery({
        queryKey: [...queryKeys.videos.detail(videoId), 'play'],
        queryFn: () => videoClient.play(videoId),
        staleTime: 1000 * 60 * 30,
      });
    },
    [queryClient]
  );
}
