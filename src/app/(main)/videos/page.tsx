'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Film } from 'lucide-react';
import { videos as videosApi } from '@/lib/api';
import type { Video } from '@/types';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import { LoadingScreen } from '@/components/ui';

const PAGE_SIZE = 24;
const NEW_THRESHOLD_DAYS = 7;

export default function VideosPage() {
  const [videosList, setVideosList] = useState<Video[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastCardRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      setError(null);
      pageNum === 1 ? setIsLoading(true) : setIsLoadingMore(true);

      const response = await videosApi.getLongForm(pageNum, PAGE_SIZE);
      let items = response.data || [];

      if (process.env.NODE_ENV === 'development') {
        console.log('VIDEOS REQUEST', {
          url: `/public/videos?page=${pageNum}&limit=${PAGE_SIZE}&short=false&type=video&published=true`,
          sample: items.slice(0, 5).map((v: any) => ({
            id: v?.id,
            uuid: v?.uuid,
            short: v?.short,
            is_short: v?.is_short,
            type: v?.type,
            published_at: v?.published_at,
          })),
        });
        const leaked = items.find(
          (v: any) =>
            v?.short === true || v?.is_short === true || v?.type === 'short'
        );
        if (leaked) {
          console.error('SHORT CONTENT LEAKED INTO /videos', leaked);
          throw new Error('SHORT CONTENT LEAKED INTO /videos');
        }
      }

      items = items.filter(
        (v: any) =>
          v?.short === false ||
          v?.is_short === false ||
          v?.type === 'video' ||
          v?.short === undefined
      );

      setVideosList((prev) => (pageNum === 1 ? items : [...prev, ...items]));

      const currentPage = response.current_page ?? pageNum;
      const lastPage = response.last_page ?? pageNum;
      setNextPage(currentPage + 1);
      setHasMore(currentPage < lastPage);
    } catch (err: any) {
      console.error('Failed to fetch videos', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || videosList.length === 0) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          fetchPage(nextPage);
        }
      },
      { rootMargin: '600px', threshold: 0 }
    );

    if (lastCardRef.current) {
      observerRef.current.observe(lastCardRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [fetchPage, hasMore, isLoading, isLoadingMore, nextPage, videosList.length]);

  if (isLoading) {
    return <LoadingScreen variant="feed" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm md:text-base font-semibold text-white/80 tracking-tight">
            Videos
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {videosList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {videosList.map((video, idx) => {
              const isLast = idx === videosList.length - 1;
              return (
                <div
                  key={video.uuid || video.id || idx}
                  ref={isLast ? lastCardRef : null}
                >
                  <VideoCard video={video} />
                </div>
              );
            })}
            {isLoadingMore &&
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Film className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">No videos found</p>
          </div>
        )}

        {!hasMore && videosList.length > 0 && (
          <div className="flex justify-center mt-8 text-white/40 text-sm">
            You've seen it all
          </div>
        )}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  const thumbnail = video.thumbnail_webp || video.thumbnail || video.card_thumbnail;
  const durationLabel = video.duration ? formatDuration(video.duration) : null;
  const publishedLabel = formatRelativeTime(video.published_at);
  const isNew = (() => {
    if (!video.published_at) return false;
    const publishedDate = new Date(video.published_at).getTime();
    const days = (Date.now() - publishedDate) / (1000 * 60 * 60 * 24);
    return days <= NEW_THRESHOLD_DAYS;
  })();

  return (
    <Link href={`/videos/${video.uuid || video.id}`} className="group block">
      <div className="relative aspect-video rounded-[10px] overflow-hidden border border-white/8 bg-surface transition-all duration-200 shadow-none group-hover:-translate-y-0.5 group-hover:border-white/25 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] group-hover:scale-[1.02]">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
            <Film className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
        {isNew && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-red-primary text-white text-[11px] font-semibold shadow">
            NEW
          </div>
        )}
        {durationLabel && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-full text-[11px] text-white font-medium">
            <Clock className="w-3.5 h-3.5" />
            {durationLabel}
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-white text-[12px] md:text-sm leading-snug line-clamp-2 group-hover:text-red-primary transition-colors">
          {video.title}
        </h3>
        <div className="text-sm text-white/60 mt-0.5 truncate flex items-center gap-2">
          {video.channel?.name && (
            <span className="truncate hover:text-white transition-colors">
              {video.channel.name}
            </span>
          )}
          {publishedLabel && (
            <span className="text-white/40 text-xs flex-shrink-0">{publishedLabel}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-video rounded-[10px] overflow-hidden bg-surface" />
      <div className="h-4 bg-surface mt-2 rounded" />
      <div className="h-3 bg-surface mt-1 rounded w-2/3" />
    </div>
  );
}
