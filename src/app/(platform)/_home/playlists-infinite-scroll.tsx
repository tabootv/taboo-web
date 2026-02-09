'use client';

import { playlistsClient as playlistsApi } from '@/api/client/playlists.client';
import { useHomePlaylistsInfinite } from '@/api/queries/home.queries';
import { EndOfContentMessage } from './_components/end-of-content-message';
import { MediaPreviewModal } from './_components/media-preview-modal';
import { PlaylistRail, type PlaylistWithVideos } from './_components/playlist-rail';
import type { Playlist, Video } from '@/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

// ============================================
// Types
// ============================================

interface PlaylistsInfiniteScrollProps {
  initialPlaylists: Playlist[];
  initialCursor: number | null;
  isInitialLastPage: boolean;
  onLastPageReached?: (isLast: boolean) => void;
}

// ============================================
// Error Retry Component
// ============================================

interface ErrorRetryProps {
  message: string;
  onRetry: () => void;
}

function ErrorRetry({ message, onRetry }: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
      <p className="text-text-secondary mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover rounded-lg text-white transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function PlaylistsInfiniteScroll({
  initialPlaylists,
  initialCursor,
  isInitialLastPage,
  onLastPageReached,
}: PlaylistsInfiniteScrollProps) {
  // TanStack Query for playlists pagination
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError, refetch } =
    useHomePlaylistsInfinite({
      initialPlaylists,
      initialCursor,
      isInitialLastPage,
    });

  // Track when all playlists have been loaded
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Local state for video loading within playlists
  const [playlistVideosState, setPlaylistVideosState] = useState<
    Map<number, { currentPage: number; lastPage: number | null; loading: boolean; videos: Video[] }>
  >(() => new Map());

  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  // Refs for intersection observers
  const sentinelRef = useRef<HTMLDivElement>(null);
  const mainObserverRef = useRef<IntersectionObserver | null>(null);
  const playlistObserverRef = useRef<IntersectionObserver | null>(null);
  const loadedPlaylistIds = useRef(new Set<number>());

  // ============================================
  // Derived Data
  // ============================================

  // Transform query data into the format needed for rendering
  const pages = data?.pages;
  const playlistsList = useMemo<PlaylistWithVideos[]>(() => {
    if (!pages) return [];

    const allPlaylists: PlaylistWithVideos[] = [];
    const seenIds = new Set<number>();

    for (const page of pages) {
      for (const p of page.playlists) {
        if (seenIds.has(p.id)) continue;
        seenIds.add(p.id);

        const videosData = (p.videos as unknown as { data: Video[] })?.data || [];
        const localState = playlistVideosState.get(p.id);

        allPlaylists.push({
          ...p,
          videos: { data: localState?.videos ?? videosData },
          _videosLoaded: Boolean(videosData.length > 0) || Boolean(localState?.videos?.length),
          videos_current_page: localState?.currentPage ?? 1,
          videos_last_page: localState?.lastPage ?? null,
          videos_loading: localState?.loading ?? false,
        });
      }
    }

    return allPlaylists;
  }, [pages, playlistVideosState]);

  const isLastPage = !hasNextPage;

  // ============================================
  // Handlers
  // ============================================

  const handleOpenPreview = useCallback((video: Video) => {
    setPreviewVideo(video);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewVideo(null);
  }, []);

  const fetchPlaylistVideos = useCallback(
    async (playlistId: number, page = 1) => {
      // Check if already loading
      const currentState = playlistVideosState.get(playlistId);
      if (currentState?.loading) return;

      setPlaylistVideosState((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(playlistId);
        newMap.set(playlistId, {
          currentPage: existing?.currentPage ?? 1,
          lastPage: existing?.lastPage ?? null,
          loading: true,
          videos: existing?.videos ?? [],
        });
        return newMap;
      });

      try {
        const response = await playlistsApi.get(playlistId, page);
        const videosData = response.videos?.data || [];

        setPlaylistVideosState((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(playlistId);
          newMap.set(playlistId, {
            currentPage: response.videos?.current_page || page,
            lastPage: response.videos?.last_page || null,
            loading: false,
            videos: page === 1 ? videosData : [...(existing?.videos ?? []), ...videosData],
          });
          return newMap;
        });
      } catch {
        setPlaylistVideosState((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(playlistId);
          if (existing) {
            newMap.set(playlistId, { ...existing, loading: false });
          }
          return newMap;
        });
      }
    },
    [playlistVideosState]
  );

  const handleLoadMoreVideos = useCallback(
    (playlist: PlaylistWithVideos) => {
      if (
        playlist.videos_current_page < (playlist.videos_last_page || 0) &&
        !playlist.videos_loading
      ) {
        fetchPlaylistVideos(playlist.id, playlist.videos_current_page + 1);
      }
    },
    [fetchPlaylistVideos]
  );

  // ============================================
  // Effects
  // ============================================

  // Track when last page is reached
  useEffect(() => {
    if (isLastPage) setHasReachedEnd(true);
    onLastPageReached?.(isLastPage);
  }, [isLastPage, onLastPageReached]);

  // Main sentinel observer for loading more playlists
  useEffect(() => {
    if (mainObserverRef.current) {
      mainObserverRef.current.disconnect();
    }

    if (isLastPage || !hasNextPage) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    mainObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '400px',
        threshold: 0,
      }
    );

    mainObserverRef.current.observe(sentinel);

    return () => {
      mainObserverRef.current?.disconnect();
    };
  }, [isLastPage, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Single observer for lazy-loading playlist videos
  // Uses data-playlist-id attribute to avoid stale closure issues
  useEffect(() => {
    if (playlistObserverRef.current) {
      playlistObserverRef.current.disconnect();
    }

    playlistObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const playlistId = Number((entry.target as HTMLElement).dataset.playlistId);
            if (playlistId && !loadedPlaylistIds.current.has(playlistId)) {
              // Find the playlist in current data
              const playlist = playlistsList.find((p) => p.id === playlistId);
              if (playlist && !playlist._videosLoaded) {
                loadedPlaylistIds.current.add(playlistId);
                fetchPlaylistVideos(playlistId);
              }
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    // Observe all playlist containers
    const containers = document.querySelectorAll('[data-playlist-id]');
    containers.forEach((el) => {
      playlistObserverRef.current?.observe(el);
    });

    return () => {
      playlistObserverRef.current?.disconnect();
    };
  }, [playlistsList, fetchPlaylistVideos]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mainObserverRef.current?.disconnect();
      playlistObserverRef.current?.disconnect();
    };
  }, []);

  // ============================================
  // Render
  // ============================================

  if (playlistsList.length === 0 && !isFetchingNextPage && !isError) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
        {playlistsList.map((playlist) => (
          <div key={playlist.id} data-playlist-id={playlist.id}>
            <PlaylistRail
              playlist={playlist}
              onOpenPreview={handleOpenPreview}
              onLoadMore={() => handleLoadMoreVideos(playlist)}
            />
          </div>
        ))}

        {/* Error state */}
        {isError && <ErrorRetry message="Failed to load playlists" onRetry={() => refetch()} />}

        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div className="text-center py-6 text-text-secondary">Loading more playlists...</div>
        )}

        {/* Sentinel for infinite scroll */}
        {hasNextPage && (
          <div
            ref={sentinelRef}
            className="h-10 opacity-0 pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>

      {hasReachedEnd && <EndOfContentMessage onScrollToTop={handleScrollToTop} />}

      {/* Preview Modal */}
      <MediaPreviewModal video={previewVideo} onClose={handleClosePreview} />
    </>
  );
}
