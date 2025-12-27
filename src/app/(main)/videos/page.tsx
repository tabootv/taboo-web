'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Film, Play, Plus, Check } from 'lucide-react';
import { videos as videosApi } from '@/lib/api';
import type { Video } from '@/types';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import { LoadingScreen } from '@/components/ui';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useSavedVideosStore, type SavedVideo } from '@/lib/stores/saved-videos-store';
import { MediaPreviewModal } from '@/components/home/media-preview-modal';

const PAGE_SIZE = 24;
const NEW_THRESHOLD_DAYS = 7;

type SortOption = 'newest' | 'oldest' | 'longest' | 'shortest';

export default function VideosPage() {
  const [videosList, setVideosList] = useState<Video[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  // Filters
  const [sort, setSort] = useState<SortOption>('newest');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastCardRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (pageNum: number, reset = false) => {
    try {
      setError(null);
      if (pageNum === 1 || reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await videosApi.getLongFormVideos(pageNum, PAGE_SIZE);
      const rawItems = response.data || [];

      // Defensive client guard: drop anything that looks like a short
      const items = rawItems.filter(
        (video) =>
          video?.short !== true &&
          (video as any)?.is_short !== true &&
          (video as any)?.type !== 'short'
      );

      setVideosList((prev) => (pageNum === 1 || reset ? items : [...prev, ...items]));

      const currentPage = response.current_page ?? pageNum;
      const lastPage = response.last_page ?? pageNum;
      setNextPage(currentPage + 1);
      setHasMore(currentPage < lastPage);
    } catch (err: unknown) {
      console.error('Failed to fetch videos', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || videosList.length === 0) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !isLoadingMore) {
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

  // Extract unique creators from loaded videos
  const creatorOptions = useMemo(() => {
    const names = new Set<string>();
    videosList.forEach((v) => {
      if (v.channel?.name) names.add(v.channel.name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [videosList]);

  // Extract unique tags from loaded videos
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

  // Filter and sort videos client-side
  const filteredVideos = useMemo(() => {
    let list = [...videosList];

    // Filter by creator
    if (creatorFilter !== 'all') {
      list = list.filter((v) => v.channel?.name === creatorFilter);
    }

    // Filter by tag
    if (tagFilter !== 'all') {
      list = list.filter((v) =>
        v.tags?.some((t) => t?.name === tagFilter || t?.slug === tagFilter)
      );
    }

    // Sort
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

  if (isLoading && videosList.length === 0) {
    return <LoadingScreen variant="feed" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* Filters */}
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
              label="Sort"
              value={sort}
              onChange={(val) => setSort(val as SortOption)}
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {filteredVideos.map((video, idx) => {
              const isLast = idx === filteredVideos.length - 1;
              return (
                <div
                  key={video.uuid || video.id || idx}
                  ref={isLast ? lastCardRef : null}
                >
                  <VideoCard video={video} priority={idx < 8} onOpenPreview={setPreviewVideo} />
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

        {!hasMore && filteredVideos.length > 0 && (
          <div className="flex justify-center mt-8 text-white/40 text-sm">
            You&apos;ve seen it all
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <MediaPreviewModal
        video={previewVideo}
        onClose={() => setPreviewVideo(null)}
      />
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

function VideoCard({ video, priority = false, onOpenPreview }: { video: Video; priority?: boolean; onOpenPreview?: (video: Video) => void }) {
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
    new Date(video.published_at).getTime() > Date.now() - NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

  const videoAny = video as Video & {
    channel?: { dp?: string; small_dp?: string };
    creator?: { dp?: string; channel?: { dp?: string } };
    user?: { dp?: string; small_dp?: string };
  };
  const profilePic =
    videoAny.channel?.dp ||
    videoAny.channel?.small_dp ||
    videoAny.creator?.dp ||
    videoAny.creator?.channel?.dp ||
    videoAny.user?.dp ||
    videoAny.user?.small_dp;

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

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenPreview?.(video);
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1400px) 25vw, 20vw"
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

          {/* More Info Button */}
          {onOpenPreview && (
            <button
              onClick={handleOpenPreview}
              className="px-2.5 py-1 bg-black/60 border border-white/40 hover:border-white rounded-full text-[10px] text-white font-medium transition-all hover:scale-105"
            >
              More Info
            </button>
          )}
        </div>
      </div>

      {/* Card Info */}
      <div className="mt-2">
        <h3 className="font-medium text-white text-sm leading-snug line-clamp-2 group-hover:text-red-primary transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-2 min-w-0">
            {profilePic ? (
              <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                <Image src={profilePic} alt="" fill className="object-cover" sizes="16px" />
              </div>
            ) : video.channel?.name ? (
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-primary/80 to-red-dark flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] text-white font-bold">
                  {video.channel.name.charAt(0)}
                </span>
              </div>
            ) : null}
            <p className="text-xs text-white/60 truncate hover:text-white transition-colors">
              {video.channel?.name}
            </p>
          </div>
          {publishedLabel && (
            <span className="text-white/40 text-[11px] flex-shrink-0">{publishedLabel}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface" />
      <div className="h-4 bg-surface mt-2 rounded" />
      <div className="h-3 bg-surface mt-1 rounded w-2/3" />
    </div>
  );
}
