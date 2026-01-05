'use client';

import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { home, publicContent } from '@/lib/api';
import type { Video, PaginatedResponse } from '@/types';
import { RailRow, RailCard, MediaPreviewModal } from '@/components/home';

interface RecommendedSectionProps {
  initialVideos?: Video[];
}

export const RecommendedSection = memo(function RecommendedSection({ initialVideos }: RecommendedSectionProps) {
  const hasInitialData = initialVideos && initialVideos.length > 0;
  const [videos, setVideos] = useState<Video[]>(initialVideos || []);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isExhausted, setIsExhausted] = useState(false);
  const desiredMinItems = 14;
  const topUpRequested = useRef(false);

  useEffect(() => {
    // Skip fetch if initial data was provided and has content
    if (initialVideos && initialVideos.length > 0) return;

    async function fetchVideos() {
      try {
        const data = await home.getRecommendedVideos();
        setVideos(data || []);
      } catch (error) {
        console.error('Error fetching recommended videos:', error);
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

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || isExhausted) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const resp = await publicContent.getVideos({ page: nextPage, per_page: 24 });
      const payload = (resp as PaginatedResponse<Video>).data || (resp as any).videos || (resp as any).data || [];
      const newItems = Array.isArray(payload) ? payload : [];

      const existingIds = new Set(videos.map((v) => v.id || v.uuid));
      const merged = [...videos, ...newItems.filter((v) => !existingIds.has(v.id || v.uuid))];
      setVideos(merged);
      setPage(nextPage);

      const current = (resp as PaginatedResponse<Video>).current_page || nextPage;
      const last = (resp as PaginatedResponse<Video>).last_page || current;
      if (current >= last || newItems.length === 0) {
        setIsExhausted(true);
      }
    } catch (error) {
      console.error('Error loading more recommended videos:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, isExhausted, page, videos]);

  // Auto-load until we reach a comfortable minimum count
  useEffect(() => {
    if (isLoading || isLoadingMore || isExhausted) return;
    if (videos.length >= desiredMinItems) return;
    handleLoadMore();
  }, [videos.length, isLoading, isLoadingMore, isExhausted, handleLoadMore, desiredMinItems]);

  // Top-up from page 1 with a larger batch if we still have too few items
  useEffect(() => {
    if (topUpRequested.current) return;
    if (isLoading || isLoadingMore) return;
    if (videos.length >= desiredMinItems) return;

    topUpRequested.current = true;
    (async () => {
      try {
        setIsLoadingMore(true);
        const resp = await publicContent.getVideos({ page: 1, per_page: 40 });
        const payload = (resp as PaginatedResponse<Video>).data || (resp as any).videos || (resp as any).data || [];
        const newItems = Array.isArray(payload) ? payload : [];
        const existingIds = new Set(videos.map((v) => v.id || v.uuid));
        const merged = [...videos, ...newItems.filter((v) => !existingIds.has(v.id || v.uuid))];
        setVideos(merged);

        const current = (resp as PaginatedResponse<Video>).current_page || 1;
        const last = (resp as PaginatedResponse<Video>).last_page || current;
        setPage(Math.max(page, current));
        if (current >= last || newItems.length === 0) {
          setIsExhausted(true);
        }
      } catch (error) {
        console.error('Error topping up recommended videos:', error);
      } finally {
        setIsLoadingMore(false);
      }
    })();
  }, [videos.length, isLoading, isLoadingMore, desiredMinItems, page]);

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
      <RailRow
        title="Newest Side Quests"
        href="/videos"
        fullBleed
        cardWidth={220}
        cardWidthMobile={170}
        onEndReached={handleLoadMore}
        loadingMore={isLoadingMore}
      >
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
});
