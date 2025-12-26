'use client';

import { LoadingScreen } from '@/components/ui';
import { VideoCardSkeleton, VideoEmptyState } from '@/components/video';
import { videos as videosApi } from '@/lib/api';
import { useInfiniteScrollPagination } from '@/lib/hooks/use-infinite-scroll-pagination';
import type { Video } from '@/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PAGE_SIZE } from './constants';
import { Clock, Play, Plus, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useSavedVideosStore, type SavedVideo } from '@/lib/stores/saved-videos-store';

/**
 * Videos Page - LONG-FORM ONLY
 *
 * This page shows ONLY long-form videos.
 * Shorts are NEVER shown here.
 *
 * The backend guarantees short=false via /public/videos endpoint.
 * If shorts appear, it's a backend bug (caught by dev assertion in API layer).
 */
export default function VideosPage() {
  const skeletonKeyCounterRef = useRef(0);
  const [sort, setSort] = useState<'newest' | 'oldest' | 'longest' | 'shortest'>('newest');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');

  const {
    items: videosList,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMoreRef,
  } = useInfiniteScrollPagination<Video>({
    fetchPage: async (pageNum) => {
      const page = typeof pageNum === 'number' ? pageNum : 1;
      // Use ONLY the canonical long-form videos endpoint
      // NO home APIs, NO recommendations, NO mixed feeds
      const response = await videosApi.getLongFormVideos(page, PAGE_SIZE);

      return {
        data: response.data || [],
        currentPage: response.current_page ?? page,
        lastPage: response.last_page ?? page,
      };
    },
    initialPage: 1,
    rootMargin: '600px',
    threshold: 0,
  });

  const creatorOptions = useMemo(() => {
    const names = new Set<string>();
    videosList.forEach((v) => {
      if (v.channel?.name) names.add(v.channel.name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [videosList]);

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    videosList.forEach((v) => {
      v.tags?.forEach((t) => {
        if (t?.name) tags.add(t.name);
        else if (t?.slug) tags.add(t.slug);
      });
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [videosList]);

  const filteredVideos = useMemo(() => {
    let list = [...videosList];

    if (creatorFilter !== 'all') {
      list = list.filter((v) => v.channel?.name === creatorFilter);
    }

    if (tagFilter !== 'all') {
      list = list.filter((v) => v.tags?.some((t) => t?.name === tagFilter || t?.slug === tagFilter));
    }

    list.sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      }
      if (sort === 'oldest') {
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      }
      const ad = a.duration || 0;
      const bd = b.duration || 0;
      if (sort === 'longest') return bd - ad;
      if (sort === 'shortest') return ad - bd;
      return 0;
    });

    return list;
  }, [videosList, creatorFilter, tagFilter, sort]);

  if (isLoading) {
    return <LoadingScreen variant="feed" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <SelectFilter
              label="Creator"
              value={creatorFilter}
              onChange={setCreatorFilter}
              options={[
                { label: 'All creators', value: 'all' },
                ...creatorOptions.map((c) => ({ label: c, value: c })),
              ]}
            />

            <SelectFilter
              label="Tags"
              value={tagFilter}
              onChange={setTagFilter}
              options={[
                { label: 'All tags', value: 'all' },
                ...tagOptions.map((t) => ({ label: t, value: t })),
              ]}
            />

            <SelectFilter
              label="Videos"
              value={sort}
              onChange={(val) => setSort(val as typeof sort)}
              options={[
                { label: 'Newest', value: 'newest' },
                { label: 'Oldest', value: 'oldest' },
                { label: 'Longest', value: 'longest' },
                { label: 'Shortest', value: 'shortest' },
              ]}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {filteredVideos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
              {filteredVideos.map((video, idx) => (
                <div key={video.uuid || video.id || idx}>
                  <VideoCard video={video} priority={idx < 8} />
                </div>
              ))}
              {isLoadingMore &&
                (() => {
                  skeletonKeyCounterRef.current += 1;
                  return Array.from({ length: 6 }).map((_, i) => (
                    <VideoCardSkeleton
                      key={`skeleton-${skeletonKeyCounterRef.current}-${i}`}
                    />
                  ));
                })()}
            </div>

            <div ref={loadMoreRef} className="h-1" />
          </>
        ) : (
          <VideoEmptyState />
        )}

        {!hasMore && filteredVideos.length > 0 && (
          <div className="flex justify-center mt-8 text-white/40 text-sm">You've seen it all</div>
        )}
      </div>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
      <span className="text-[11px] uppercase tracking-wide text-white/50">{label}</span>
      <NativeSelect
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs md:text-sm text-white font-semibold border-none shadow-none pr-7 h-8"
        size="sm"
      >
        {options.map((opt) => (
          <NativeSelectOption key={opt.value} value={opt.value}>
            {opt.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

function VideoCard({ video, priority = false }: { video: Video; priority?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isSaved, toggleSave } = useSavedVideosStore();

  // Check saved state on mount
  useEffect(() => {
    if (video.id) {
      setSaved(isSaved(video.id));
    }
  }, [isSaved, video.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const href = `/videos/${video.uuid || video.id}`;
  const thumbnail = video.thumbnail_webp || video.thumbnail || video.card_thumbnail;
  const previewUrl = video.url_480 || video.url_720;
  const durationLabel = video.duration ? formatDuration(video.duration) : null;
  const publishedLabel = formatRelativeTime(video.published_at);
  const isNew =
    video.published_at &&
    new Date(video.published_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

  const handleMouseEnter = () => {
    setIsHovered(true);

    // Delayed video preview (500ms like Netflix)
    if (previewUrl) {
      hoverTimeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play()
            .then(() => setIsVideoPlaying(true))
            .catch(() => {});
        }
      }, 500);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsVideoPlaying(false);
    setIsVideoReady(false);

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!video.id) return;

    const savedVideo: SavedVideo = {
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail_webp || video.thumbnail || null,
      channelName: video.channel?.name || null,
      savedAt: Date.now(),
    };
    const newState = toggleSave(savedVideo);
    setSaved(newState);
  };

  return (
    <Link
      href={href}
      className="group block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
        {/* Thumbnail */}
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            className={`object-cover transition-all duration-300 ${
              isHovered ? 'scale-105' : 'scale-100'
            } ${isVideoPlaying && isVideoReady ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-hover flex items-center justify-center">
            <Play className="w-12 h-12 text-white/30" />
          </div>
        )}

        {/* Video Preview */}
        {previewUrl && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isVideoPlaying && isVideoReady ? 'opacity-100' : 'opacity-0'
            }`}
            muted
            loop
            playsInline
            preload="none"
            onLoadedData={() => setIsVideoReady(true)}
          >
            <source src={previewUrl} type="video/mp4" />
          </video>
        )}

        {/* Hover Overlay with Play Button */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isHovered && !isVideoPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="p-3 bg-red-primary rounded-full transform transition-transform hover:scale-110">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        {/* NEW Badge */}
        {isNew && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-primary text-white text-[10px] font-bold rounded">
            NEW
          </div>
        )}

        {/* Duration Badge */}
        {durationLabel && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {durationLabel}
          </div>
        )}

        {/* Hover Action Buttons */}
        <div
          className={`absolute bottom-2 left-2 flex items-center gap-1.5 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`p-1.5 rounded-full border transition-all hover:scale-110 ${
              saved
                ? 'bg-white/20 border-white'
                : 'bg-black/60 border-white/40 hover:border-white'
            }`}
            title={saved ? 'Remove from My List' : 'Add to My List'}
          >
            {saved ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Plus className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="mt-2">
        <h3 className="font-medium text-white text-sm line-clamp-2 leading-snug group-hover:text-red-primary transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {video.channel?.dp ? (
            <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={video.channel.dp}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          ) : video.channel?.name && (
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-primary/80 to-red-dark flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] text-white font-bold">
                {video.channel.name.charAt(0)}
              </span>
            </div>
          )}
          <p className="text-xs text-white/50 truncate">
            {video.channel?.name}
          </p>
        </div>
        {publishedLabel && (
          <p className="text-xs text-white/40 mt-0.5">
            {publishedLabel}
          </p>
        )}
      </div>
    </Link>
  );
}
