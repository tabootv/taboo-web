'use client';
import { useState, useCallback } from 'react';
import { useRecommendedVideos } from '@/api/queries/home.queries';
import type { Video } from '@/types';
import { RailRow } from './rail-row';
import { RailCard } from './rail-card';
import { MediaPreviewModal } from './media-preview-modal';

interface RecommendedSectionProps {
  initialVideos?: Video[];
}

export function RecommendedSection({ initialVideos }: RecommendedSectionProps) {
  const { data: videos = [], isLoading } = useRecommendedVideos(
    initialVideos ? { initialData: initialVideos } : {}
  );
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  const handleOpenPreview = useCallback((video: Video) => {
    setPreviewVideo(video);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewVideo(null);
  }, []);

  if (isLoading) {
    return (
      <section className="relative">
        <div className="flex items-center mb-4">
          <div className="h-7 w-48 bg-surface rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
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

  if (videos.length === 0) return null;

  return (
    <>
      <RailRow title="Newest Side Quests" href="/videos">
        {videos.map((video, index) => (
          <RailCard
            key={video.uuid || video.id}
            video={video}
            onOpenPreview={handleOpenPreview}
            showDate
            priority={index < 4}
          />
        ))}
      </RailRow>

      {/* Preview Modal - rendered via portal */}
      <MediaPreviewModal video={previewVideo} onClose={handleClosePreview} />
    </>
  );
}
