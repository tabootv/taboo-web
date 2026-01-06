/**
 * Hook for fetching playlist videos
 */

import { useCallback } from 'react';
import { playlistsClient as playlistsApi } from '@/api/client';
import type { Playlist, Video } from '@/types';

interface PlaylistWithVideos extends Omit<Playlist, 'videos'> {
  videos: { data: Video[] };
  _videosLoaded: boolean;
  videos_current_page: number;
  videos_last_page: number | null;
  videos_loading: boolean;
}

interface UsePlaylistVideosReturn {
  fetchPlaylistVideos: (
    playlist: PlaylistWithVideos,
    page?: number
  ) => Promise<void>;
}

export function usePlaylistVideos(
  setPlaylistsList: React.Dispatch<React.SetStateAction<PlaylistWithVideos[]>>
): UsePlaylistVideosReturn {
  const fetchPlaylistVideos = useCallback(
    async (playlist: PlaylistWithVideos, page = 1) => {
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
                data: page === 1 ? videosData : [...(p.videos?.data || []), ...videosData],
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
    },
    [setPlaylistsList]
  );

  return { fetchPlaylistVideos };
}

