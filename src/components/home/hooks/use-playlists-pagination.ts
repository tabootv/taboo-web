/**
 * Hook for managing playlists pagination and fetching
 */

import { useState, useCallback, useRef } from 'react';
import { playlistsClient as playlistsApi } from '@/api/client';
import type { Playlist, PaginatedResponse, Video } from '@/types';

interface PlaylistWithVideos extends Omit<Playlist, 'videos'> {
  videos: { data: Video[] };
  _videosLoaded: boolean;
  videos_current_page: number;
  videos_last_page: number | null;
  videos_loading: boolean;
}

interface UsePlaylistsPaginationReturn {
  playlistsList: PlaylistWithVideos[];
  setPlaylistsList: React.Dispatch<React.SetStateAction<PlaylistWithVideos[]>>;
  currentPage: number;
  lastPage: number | null;
  loadingPlaylists: boolean;
  fetchPlaylistsPage: () => Promise<void>;
  checkIfAllLoaded: () => boolean;
}

export function usePlaylistsPagination(
  onAllLoaded: () => void
): UsePlaylistsPaginationReturn {
  const [playlistsList, setPlaylistsList] = useState<PlaylistWithVideos[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const hasEmittedAllLoaded = useRef(false);

  const checkIfAllLoaded = useCallback(() => {
    if (loadingPlaylists) return false;
    if (!lastPage || currentPage <= lastPage) return false;
    const hasLoadingVideos = playlistsList.some((p) => p.videos_loading);
    if (hasLoadingVideos) return false;
    return true;
  }, [loadingPlaylists, lastPage, currentPage, playlistsList]);

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
      const response = await playlistsApi.list({ page: currentPage, per_page: 3 }) as PaginatedResponse<Playlist>;
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

  return {
    playlistsList,
    setPlaylistsList,
    currentPage,
    lastPage,
    loadingPlaylists,
    fetchPlaylistsPage,
    checkIfAllLoaded,
  };
}

