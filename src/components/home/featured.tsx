'use client';;
import { useEffect, useState, useCallback } from 'react';
import { homeClient } from '@/api/client/home.client';
import type { Video } from '@/types';
import { RailRow } from '@/components/home/rail-row';
import { RailCard } from '@/components/home/rail-card';
import { MediaPreviewModal } from '@/components/home/media-preview-modal';

interface FeaturedSectionProps {
  initialVideos?: Video[];
}

export function FeaturedSection({ initialVideos }: FeaturedSectionProps) {
  const hasInitialData = initialVideos && initialVideos.length > 0;
  const [videos, setVideos] = useState<Video[]>(initialVideos || []);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  useEffect(() => {
    // Skip fetch if initial data was provided and has content
    if (initialVideos && initialVideos.length > 0) return;

    async function fetchVideos() {
      try {
        const data = await homeClient.getFeaturedVideos();
        setVideos(data || []);
      } catch (error) {
        console.error('Error fetching featured videos:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVideos();
  }, [initialVideos]);

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
          <div className="h-7 w-32 bg-surface rounded animate-pulse" />
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
      <RailRow title="Featured" href="/videos">
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
      <MediaPreviewModal
        video={previewVideo}
        onClose={handleClosePreview}
      />
    </>
  );
}
