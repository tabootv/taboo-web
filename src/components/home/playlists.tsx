'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { playlists as playlistsApi } from '@/lib/api';
import type { Playlist, Video, PaginatedResponse } from '@/types';
import { RailRow } from './rail-row';
import { RailCard } from './rail-card';
import { MediaPreviewModal } from './media-preview-modal';

interface PlaylistWithVideos extends Omit<Playlist, 'videos'> {
  videos: { data: Video[] };
  _videosLoaded: boolean;
  videos_current_page: number;
  videos_last_page: number | null;
  videos_loading: boolean;
}

interface PlaylistsSectionProps {
  instanceId: number | string;
  onAllLoaded: () => void;
}

export function PlaylistsSection({ instanceId, onAllLoaded }: PlaylistsSectionProps) {
  const [playlistsList, setPlaylistsList] = useState<PlaylistWithVideos[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  const observersRef = useRef<Map<number, IntersectionObserver>>(new Map());
  const sentinelObserverRef = useRef<IntersectionObserver | null>(null);
  const hasEmittedAllLoaded = useRef(false);

  const handleOpenPreview = useCallback((video: Video) => {
    setPreviewVideo(video);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewVideo(null);
  }, []);

  const checkIfAllLoaded = useCallback(() => {
    if (loadingPlaylists) return false;
    if (!lastPage || currentPage <= lastPage) return false;
    const hasLoadingVideos = playlistsList.some((p) => p.videos_loading);
    if (hasLoadingVideos) return false;
    return true;
  }, [loadingPlaylists, lastPage, currentPage, playlistsList]);

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

  const fetchPlaylistsPage = useCallback(async () => {
    if (loadingPlaylists) return;
    if (lastPage !== null && currentPage > lastPage) {
      if (checkIfAllLoaded() && !hasEmittedAllLoaded.current) {
        hasEmittedAllLoaded.current = true;
        onAllLoaded();
      }
      return;
    }

    setLoadingPlaylists(true);
    try {
      const response = await playlistsApi.list(currentPage, 3) as PaginatedResponse<Playlist>;
      const items = response.data || [];

      const enhancedItems: PlaylistWithVideos[] = items.map((p) => ({
        ...p,
        videos: { data: [] },
        _videosLoaded: false,
        videos_current_page: 1,
        videos_last_page: null,
        videos_loading: false,
      }));

      setPlaylistsList((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newItems = enhancedItems.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newItems];
      });
      setLastPage(response.last_page ?? null);
      setCurrentPage((prev) => prev + 1);
    } catch {
      // silent
    } finally {
      setLoadingPlaylists(false);
    }
  }, [loadingPlaylists, lastPage, currentPage, checkIfAllLoaded, onAllLoaded]);

  // Initial fetch
  useEffect(() => {
    fetchPlaylistsPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sentinel observer for loading more playlists
  useEffect(() => {
    const sentinelId = `playlists-end-${instanceId}`;
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;

    sentinelObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPlaylistsPage();
        }
      },
      {
        root: null,
        rootMargin: '400px',
        threshold: 0,
      }
    );

    sentinelObserverRef.current.observe(sentinel);

    return () => {
      if (sentinelObserverRef.current) {
        sentinelObserverRef.current.disconnect();
      }
    };
  }, [instanceId, fetchPlaylistsPage]);

  // Cleanup observers on unmount
  useEffect(() => {
    return () => {
      observersRef.current.forEach((obs) => obs.disconnect());
      if (sentinelObserverRef.current) {
        sentinelObserverRef.current.disconnect();
      }
    };
  }, []);

  // Check allLoaded when playlists or loading state changes
  useEffect(() => {
    if (checkIfAllLoaded() && !hasEmittedAllLoaded.current) {
      hasEmittedAllLoaded.current = true;
      onAllLoaded();
    }
  }, [checkIfAllLoaded, onAllLoaded, playlistsList, loadingPlaylists]);

  const registerPlaylistObserver = useCallback(
    (el: HTMLDivElement | null, id: number) => {
      if (!el || !id || observersRef.current.has(id)) return;

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const playlist = playlistsList.find((p) => p.id === id);
              if (playlist && !playlist._videosLoaded) {
                fetchPlaylistVideos(playlist);
              }
              obs.unobserve(entry.target);
              observersRef.current.delete(id);
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
      observersRef.current.set(id, obs);
    },
    [playlistsList, fetchPlaylistVideos]
  );

  return (
    <>
      <div className="flex flex-col gap-10 mt-8">
        {playlistsList.map((playlist) => (
          <div
            key={playlist.id}
            data-playlist-id={playlist.id}
            ref={(el) => registerPlaylistObserver(el, playlist.id)}
            className="w-full"
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

        {loadingPlaylists && (
          <div className="text-center py-6 text-text-secondary">
            Loading more playlists...
          </div>
        )}

        <div
          id={`playlists-end-${instanceId}`}
          className="h-10 opacity-0 pointer-events-none"
        />
      </div>

      {/* Preview Modal - rendered via portal */}
      <MediaPreviewModal
        video={previewVideo}
        onClose={handleClosePreview}
      />
    </>
  );
}

interface PlaylistRailProps {
  playlist: PlaylistWithVideos;
  onOpenPreview: (video: Video) => void;
  onLoadMore: () => void;
}

function PlaylistRail({ playlist, onOpenPreview, onLoadMore }: PlaylistRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Trigger load more when reaching end
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
  }, [handleScroll]);

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
