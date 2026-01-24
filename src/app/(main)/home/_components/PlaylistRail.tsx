/**
 * Individual playlist rail component
 */

import { useRef, useEffect, useCallback } from 'react';
import { RailRow } from './rail-row';
import { RailCard } from './rail-card';
import type { Video } from '@/types';

interface PlaylistWithVideos {
  id: number;
  name?: string;
  description?: string;
  videos: { data: Video[] };
  _videosLoaded: boolean;
  videos_current_page: number;
  videos_last_page: number | null;
  videos_loading: boolean;
}

interface PlaylistRailProps {
  playlist: PlaylistWithVideos;
  onOpenPreview: (video: Video) => void;
  onLoadMore: () => void;
}

export function PlaylistRail({ playlist, onOpenPreview, onLoadMore }: PlaylistRailProps) {
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
    return undefined;
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
          showDate
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

