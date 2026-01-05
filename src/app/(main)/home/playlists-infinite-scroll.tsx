'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchHomeData } from '@/lib/api/home-data';
import { playlists as playlistsApi } from '@/lib/api';
import type { Playlist, Video } from '@/types';
import { RailRow } from '@/components/home/rail-row';
import { RailCard } from '@/components/home/rail-card';
import { MediaPreviewModal } from '@/components/home/media-preview-modal';

// ============================================
// Types
// ============================================

interface PlaylistWithVideos extends Omit<Playlist, 'videos'> {
  videos: { data: Video[] };
  _videosLoaded: boolean;
  videos_current_page: number;
  videos_last_page: number | null;
  videos_loading: boolean;
}

interface PlaylistsInfiniteScrollProps {
  initialPlaylists: Playlist[];
  initialCursor: number | null;
  isInitialLastPage: boolean;
}

// ============================================
// Component
// ============================================

/**
 * Playlists Infinite Scroll
 *
 * Handles infinite scroll loading for playlists section:
 * - Receives initial playlists from server (no client-side initial fetch)
 * - Uses IntersectionObserver to detect when to load more
 * - Proper observer management: only observes last sentinel
 * - Debounced to prevent double-triggers
 * - Each playlist lazy-loads its videos when scrolled into view
 */
export function PlaylistsInfiniteScroll({
  initialPlaylists,
  initialCursor,
  isInitialLastPage,
}: PlaylistsInfiniteScrollProps) {
  const hasInitialData = initialPlaylists && initialPlaylists.length > 0;

  // Initialize with server data
  const [playlistsList, setPlaylistsList] = useState<PlaylistWithVideos[]>(() =>
    initialPlaylists.map((p) => ({
      ...p,
      videos: { data: (p.videos as unknown as { data: Video[] })?.data || [] },
      _videosLoaded: Boolean((p.videos as unknown as { data: Video[] })?.data?.length),
      videos_current_page: 1,
      videos_last_page: null,
      videos_loading: false,
    }))
  );

  const [cursor, setCursor] = useState<number | null>(hasInitialData ? initialCursor : 1);
  const [isLastPage, setIsLastPage] = useState(hasInitialData ? isInitialLastPage : false);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const didInitialFetch = useRef(hasInitialData);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  // Refs for observer management
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef(false); // Guard against double-triggers
  const playlistObserversRef = useRef<Map<number, IntersectionObserver>>(new Map());
  const playlistsListRef = useRef(playlistsList); // Track latest playlists for observer callbacks
  playlistsListRef.current = playlistsList;

  // ============================================
  // Handlers
  // ============================================

  const handleOpenPreview = useCallback((video: Video) => {
    setPreviewVideo(video);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewVideo(null);
  }, []);

  // Load more playlists
  const loadMorePlaylists = useCallback(async () => {
    // Guards
    if (isLoadingRef.current) return;
    if (isLastPage) return;
    if (cursor === null) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const result = await fetchHomeData({ cursor, includeStatic: false });

      const newPlaylists: PlaylistWithVideos[] = result.playlists.map((p) => ({
        ...p,
        videos: { data: (p.videos as unknown as { data: Video[] })?.data || [] },
        _videosLoaded: Boolean((p.videos as unknown as { data: Video[] })?.data?.length),
        videos_current_page: 1,
        videos_last_page: null,
        videos_loading: false,
      }));

      setPlaylistsList((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = newPlaylists.filter((p) => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });

      setCursor(result.nextCursor);
      setIsLastPage(result.isLastPage);
    } catch (error) {
      console.error('Error loading more playlists:', error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [cursor, isLastPage]);

  // Fetch videos for a specific playlist
  const fetchPlaylistVideos = useCallback(async (playlist: PlaylistWithVideos, page = 1) => {
    if (!playlist || playlist.videos_loading) return;

    setPlaylistsList((prev) =>
      prev.map((p) => (p.id === playlist.id ? { ...p, videos_loading: true } : p))
    );

    try {
      const response = await playlistsApi.get(playlist.id, page);
      const videosData = response.videos?.data || [];

      setPlaylistsList((prev) =>
        prev.map((p) => {
          if (p.id !== playlist.id) return p;
          return {
            ...p,
            videos: {
              data: page === 1 ? videosData : [...p.videos.data, ...videosData],
            },
            videos_current_page: response.videos?.current_page || page,
            videos_last_page: response.videos?.last_page || null,
            _videosLoaded: true,
            videos_loading: false,
          };
        })
      );
    } catch {
      setPlaylistsList((prev) =>
        prev.map((p) => (p.id === playlist.id ? { ...p, videos_loading: false } : p))
      );
    }
  }, []);

  // ============================================
  // Observers
  // ============================================

  // Initial fetch if no server data was provided
  useEffect(() => {
    if (didInitialFetch.current) return;
    didInitialFetch.current = true;

    // Fetch initial playlists
    loadMorePlaylists();
  }, [loadMorePlaylists]);

  // Main sentinel observer for loading more playlists
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Don't observe if we're done
    if (isLastPage || cursor === null) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingRef.current) {
          loadMorePlaylists();
        }
      },
      {
        root: null,
        rootMargin: '400px',
        threshold: 0,
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLastPage, cursor, loadMorePlaylists]);

  // Register observer for individual playlist to lazy-load its videos
  const registerPlaylistObserver = useCallback(
    (el: HTMLDivElement | null, playlistId: number) => {
      if (!el || !playlistId) return;

      // Already has observer
      if (playlistObserversRef.current.has(playlistId)) return;

      // Use ref to get latest state and avoid stale closures
      const playlist = playlistsListRef.current.find((p) => p.id === playlistId);
      if (!playlist || playlist._videosLoaded) return;

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Use ref for latest state in async callback
              const currentPlaylist = playlistsListRef.current.find((p) => p.id === playlistId);
              if (currentPlaylist && !currentPlaylist._videosLoaded) {
                fetchPlaylistVideos(currentPlaylist);
              }
              obs.unobserve(entry.target);
              playlistObserversRef.current.delete(playlistId);
            }
          });
        },
        {
          root: null,
          rootMargin: '200px',
          threshold: 0.1,
        }
      );

      obs.observe(el);
      playlistObserversRef.current.set(playlistId, obs);
    },
    [fetchPlaylistVideos]
  );

  // Cleanup observers on unmount
  useEffect(() => {
    return () => {
      playlistObserversRef.current.forEach((obs) => obs.disconnect());
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // ============================================
  // Render
  // ============================================

  if (playlistsList.length === 0 && !isLoading) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
        {playlistsList.map((playlist) => (
          <div
            key={playlist.id}
            ref={(el) => registerPlaylistObserver(el, playlist.id)}
            data-playlist-id={playlist.id}
          >
            <PlaylistRail
              playlist={playlist}
              onOpenPreview={handleOpenPreview}
              onLoadMore={() => {
                if (
                  playlist.videos_current_page < (playlist.videos_last_page || 0) &&
                  !playlist.videos_loading
                ) {
                  fetchPlaylistVideos(playlist, playlist.videos_current_page + 1);
                }
              }}
            />
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center py-6 text-text-secondary">
            Loading more playlists...
          </div>
        )}

        {/* Sentinel for infinite scroll - only rendered if not on last page */}
        {!isLastPage && cursor !== null && (
          <div
            ref={sentinelRef}
            className="h-10 opacity-0 pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Preview Modal */}
      <MediaPreviewModal video={previewVideo} onClose={handleClosePreview} />
    </>
  );
}

// ============================================
// Playlist Rail Component
// ============================================

interface PlaylistRailProps {
  playlist: PlaylistWithVideos;
  onOpenPreview: (video: Video) => void;
  onLoadMore: () => void;
}

function PlaylistRail({ playlist, onOpenPreview, onLoadMore }: PlaylistRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Trigger load more when reaching end of rail
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft >= scrollWidth - clientWidth - 100) {
        onLoadMore();
      }
    }
  }, [onLoadMore]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, [handleScroll]);

  // Skeleton while videos are loading
  if (!playlist._videosLoaded) {
    return (
      <section className="relative">
        <div className="flex items-center mb-4">
          <div className="h-7 w-48 bg-surface rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[200px] md:w-[280px]">
              <div className="aspect-video rounded-lg bg-surface animate-pulse" />
              <div className="w-3/4 h-4 bg-surface rounded animate-pulse mt-2" />
              <div className="w-1/2 h-3 bg-surface rounded animate-pulse mt-2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Empty playlist
  if (playlist.videos.data.length === 0) {
    return null;
  }

  return (
    <RailRow title={playlist.description || playlist.name || 'Playlist'}>
      {playlist.videos.data.map((video, index) => (
        <RailCard
          key={video.uuid || video.id}
          video={video}
          onOpenPreview={onOpenPreview}
          priority={index < 4}
        />
      ))}
      {playlist.videos_loading && (
        <div className="flex-shrink-0 w-[200px] md:w-[280px] flex items-center justify-center">
          <div className="text-sm text-text-secondary">Loading...</div>
        </div>
      )}
    </RailRow>
  );
}
