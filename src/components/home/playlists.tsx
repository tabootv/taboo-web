'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Video } from '@/types';
import { MediaPreviewModal } from '@/components/home';
import { PlaylistRail } from './components/PlaylistRail';
import { usePlaylistsPagination } from './hooks/use-playlists-pagination';
import { usePlaylistVideos } from './hooks/use-playlist-videos';

interface PlaylistsSectionProps {
  instanceId: number | string;
  onAllLoaded: () => void;
}

export function PlaylistsSection({ instanceId, onAllLoaded }: PlaylistsSectionProps) {
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const observersRef = useRef<Map<number, IntersectionObserver>>(new Map());
  const sentinelObserverRef = useRef<IntersectionObserver | null>(null);

  const {
    playlistsList,
    setPlaylistsList,
    loadingPlaylists,
    fetchPlaylistsPage,
    checkIfAllLoaded,
  } = usePlaylistsPagination(onAllLoaded);

  const { fetchPlaylistVideos } = usePlaylistVideos(setPlaylistsList);

  const handleOpenPreview = useCallback((video: Video) => {
    setPreviewVideo(video);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewVideo(null);
  }, []);

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
        const entry = entries[0];
        if (entry?.isIntersecting) {
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
    if (checkIfAllLoaded()) {
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

