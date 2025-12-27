'use client';

import dynamic from 'next/dynamic';
import { VideoComments } from '@/features/video';
import { PlayerPageSkeleton } from '@/components/series';
import { VideoPlayerSkeleton } from '@/components/video';
import { auth, series as seriesApi, videos as videosApi } from '@/lib/api';
import { cn, formatDuration, formatRelativeTime } from '@/lib/utils';
import type { Series, Video } from '@/types';
import {
  ChevronRight,
  Clock,
  Play,
  SkipForward,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useRef, useState } from 'react';

const VideoPlayer = dynamic(
  () => import('@/features/video').then((mod) => ({ default: mod.VideoPlayer })),
  {
    loading: () => <VideoPlayerSkeleton />,
    ssr: false,
  }
);

export default function SeriesPlayerPage({
  params,
}: {
  params: Promise<{ id: string; videoUuid: string }>;
}) {
  const { id: seriesId, videoUuid } = use(params);
  const router = useRouter();
  const episodesRef = useRef<HTMLDivElement>(null);

  const [seriesData, setSeriesData] = useState<Series | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [episodes, setEpisodes] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Find current episode index
  const currentEpisodeIndex = episodes.findIndex((v) => v.uuid === currentVideo?.uuid);
  const nextEpisode =
    currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1
      ? episodes[currentEpisodeIndex + 1]
      : null;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch user for autoplay setting
        try {
          const meResponse = await auth.me();
          setAutoplayEnabled(meResponse.user.video_autoplay || false);
        } catch {
          // Not logged in
        }

        // Fetch current video and series data
        const [playData, seriesDetail] = await Promise.all([
          seriesApi.playVideo(videoUuid),
          seriesApi.getSeriesDetail(seriesId),
        ]);

        setCurrentVideo(playData.video);
        setSeriesData(seriesDetail);
        setEpisodes(seriesDetail?.videos || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push(`/series`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [videoUuid, seriesId, router]);

  // Scroll to current episode in sidebar
  useEffect(() => {
    if (episodesRef.current && currentEpisodeIndex >= 0) {
      const currentCard = episodesRef.current.children[currentEpisodeIndex] as HTMLElement;
      if (currentCard) {
        currentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentEpisodeIndex]);

  const handleVideoEnded = useCallback(() => {
    if (autoplayEnabled && nextEpisode) {
      router.push(`/series/${seriesId}/play/${nextEpisode.uuid}`);
    }
  }, [autoplayEnabled, nextEpisode, seriesId, router]);

  const playNextVideo = () => {
    if (nextEpisode) {
      router.push(`/series/${seriesId}/play/${nextEpisode.uuid}`);
    }
  };

  const handleToggleAutoplay = async () => {
    try {
      const response = await videosApi.toggleAutoplay();
      setAutoplayEnabled(response.video_autoplay);
    } catch {
      setAutoplayEnabled(!autoplayEnabled);
    }
  };

  const handleLike = async () => {
    if (!currentVideo) return;
    try {
      const response = await videosApi.toggleLike(videoUuid);
      setCurrentVideo({
        ...currentVideo,
        has_liked: response.has_liked,
        likes_count: response.likes_count,
        has_disliked: response.has_liked ? false : currentVideo.has_disliked ?? false,
      });
    } catch {
      console.error('Failed to like video');
    }
  };

  const handleDislike = async () => {
    if (!currentVideo) return;
    try {
      const response = await videosApi.toggleDislike(videoUuid);
      setCurrentVideo({
        ...currentVideo,
        has_disliked: response.has_disliked,
        dislikes_count: response.dislikes_count,
        has_liked: response.has_disliked ? false : currentVideo.has_liked,
      });
    } catch {
      console.error('Failed to dislike video');
    }
  };

  const isCourse = seriesData?.type === 'course' || seriesData?.module_type === 'course';

  if (isLoading) {
    return <PlayerPageSkeleton />;
  }

  if (!seriesData || !currentVideo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Episode not found</h1>
          <Link href="/series" className="text-red-primary hover:underline">
            Back to series
          </Link>
        </div>
      </div>
    );
  }

  const shouldTruncateDescription =
    currentVideo.description && currentVideo.description.length > 200;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-4">
          <Link href="/series" className="hover:text-white transition-colors">
            Series
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={`/series/${seriesId}`}
            className="hover:text-white transition-colors truncate max-w-[200px]"
          >
            {seriesData.title}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white/70 truncate">
            {isCourse ? 'Episode' : 'Part'} {currentEpisodeIndex + 1}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Video Player */}
            <div className="w-full rounded-xl overflow-hidden bg-black">
              <VideoPlayer
                {...(currentVideo.thumbnail && { thumbnail: currentVideo.thumbnail })}
                hls_url={currentVideo.hls_url || currentVideo.url_hls || null}
                url_1440={currentVideo.url_1440 || null}
                url_1080={currentVideo.url_1080 || null}
                url_720={currentVideo.url_720 || null}
                url_480={currentVideo.url_480 || null}
                autoplay={autoplayEnabled}
                onEnded={handleVideoEnded}
              />
            </div>

            {/* Video Title */}
            <h1 className="text-lg md:text-xl font-semibold text-white mt-4 leading-snug">
              {isCourse ? seriesData.title : currentVideo.title}
            </h1>

            {/* Episode Indicator */}
            <div className="flex items-center gap-3 mt-2 text-sm text-white/60">
              <span className="px-2 py-0.5 bg-red-primary/20 text-red-primary rounded font-medium">
                {isCourse ? 'Episode' : 'Part'} {currentEpisodeIndex + 1} of {episodes.length}
              </span>
              {currentVideo.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(currentVideo.duration)}
                </span>
              )}
            </div>

            {/* Channel Info & Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pb-4 border-b border-white/10">
              {/* Channel Info */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/creators/creator-profile/${
                    currentVideo.channel?.uuid || currentVideo.channel?.id
                  }`}
                  className="shrink-0"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    {currentVideo.channel?.dp ? (
                      <Image
                        src={currentVideo.channel.dp}
                        alt={currentVideo.channel.name || 'Channel'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface text-white font-semibold">
                        {currentVideo.channel?.name?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/creators/creator-profile/${
                      currentVideo.channel?.uuid || currentVideo.channel?.id
                    }`}
                    className="flex items-center gap-1.5 group"
                  >
                    <span className="font-medium text-white group-hover:text-red-primary transition-colors truncate">
                      {currentVideo.channel?.name}
                    </span>
                    <span className="shrink-0"><VerifiedBadge size={14} /></span>
                  </Link>
                  <p className="text-xs text-white/50">
                    {currentVideo.humans_publish_at ||
                      formatRelativeTime(currentVideo.published_at)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Like/Dislike */}
                <div className="flex items-center bg-surface rounded-full overflow-hidden">
                  <button
                    onClick={handleLike}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 transition-colors',
                      currentVideo.has_liked
                        ? 'text-red-primary bg-red-primary/10'
                        : 'text-white hover:bg-white/10'
                    )}
                  >
                    <ThumbsUp className={cn('w-5 h-5', currentVideo.has_liked && 'fill-current')} />
                    <span className="text-sm font-medium">{currentVideo.likes_count || 0}</span>
                  </button>
                  <div className="w-px h-6 bg-white/10" />
                  <button
                    onClick={handleDislike}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 transition-colors',
                      currentVideo.has_disliked
                        ? 'text-red-primary bg-red-primary/10'
                        : 'text-white hover:bg-white/10'
                    )}
                  >
                    <ThumbsDown
                      className={cn('w-5 h-5', currentVideo.has_disliked && 'fill-current')}
                    />
                  </button>
                </div>

                {/* Autoplay Toggle */}
                <button
                  onClick={handleToggleAutoplay}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium',
                    autoplayEnabled
                      ? 'bg-red-primary text-white'
                      : 'bg-surface text-white hover:bg-surface/80'
                  )}
                >
                  <SkipForward className="w-4 h-4" />
                  <span className="hidden sm:inline">Autoplay</span>
                </button>

                {/* Next Episode Button */}
                {nextEpisode && (
                  <button
                    onClick={playNextVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-full transition-all hover:bg-white/90 text-sm"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span className="hidden sm:inline">Next</span>
                  </button>
                )}
              </div>
            </div>

            {/* Description Box */}
            {currentVideo.description && (
              <button
                type="button"
                className="mt-4 w-full text-left bg-surface/50 hover:bg-surface/70 rounded-xl p-4 transition-colors"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                <p
                  className={cn(
                    'text-sm text-white/80 whitespace-pre-wrap leading-relaxed',
                    !isDescriptionExpanded && shouldTruncateDescription && 'line-clamp-2'
                  )}
                >
                  {currentVideo.description}
                </p>
                {shouldTruncateDescription && (
                  <span className="block text-sm font-medium text-white/60 hover:text-white mt-2">
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </span>
                )}
              </button>
            )}

            {/* Comments Section */}
            <div className="mt-6">
              <VideoComments video={currentVideo} initialComments={currentVideo.comments || []} />
            </div>
          </div>

          {/* Sidebar - Episodes */}
          <div className="w-full lg:w-[400px] shrink-0">
            {/* Series Info Header */}
            <Link
              href={`/series/${seriesId}`}
              className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl mb-4 group hover:bg-surface/70 transition-colors"
            >
              <div className="relative w-16 h-9 rounded-lg overflow-hidden shrink-0">
                {seriesData.thumbnail && (
                  <Image
                    src={seriesData.thumbnail}
                    alt={seriesData.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50 mb-0.5">{isCourse ? 'Course' : 'Series'}</p>
                <h3 className="text-sm font-medium text-white truncate group-hover:text-red-primary transition-colors">
                  {seriesData.title}
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
            </Link>

            {/* Episodes Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                {isCourse ? 'Episodes' : 'All Parts'}
              </h2>
              <span className="text-sm text-white/50">
                {currentEpisodeIndex + 1}/{episodes.length}
              </span>
            </div>

            {/* Episode List */}
            <div
              ref={episodesRef}
              className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar"
            >
              {episodes.map((video, index) => (
                <EpisodeCard
                  key={video.uuid}
                  video={video}
                  episodeNumber={index + 1}
                  isCurrent={video.uuid === currentVideo.uuid}
                  seriesId={seriesId}
                  isCourse={isCourse}
                />
              ))}
            </div>

            {episodes.length === 0 && (
              <div className="text-center py-12 text-white/40">No episodes available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Episode Card Component
function EpisodeCard({
  video,
  episodeNumber,
  isCurrent,
  seriesId,
  isCourse,
}: {
  video: Video;
  episodeNumber: number;
  isCurrent: boolean;
  seriesId: string;
  isCourse: boolean;
}) {
  const href = isCourse
    ? `/courses/${seriesId}/play/${video.uuid}`
    : `/series/${seriesId}/play/${video.uuid}`;

  return (
    <Link href={href}>
      <div
        className={cn(
          'group flex gap-3 p-2 rounded-xl transition-all',
          'hover:ring-1 hover:ring-red-primary/50 hover:shadow-[0_0_15px_rgba(171,0,19,0.3)]'
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-[140px] h-[79px] shrink-0 rounded-lg overflow-hidden bg-surface">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail_webp || video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-surface to-background" />
          )}

          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all shadow-lg">
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            </div>
          </div>

          {/* Duration */}
          {video.duration && (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-medium text-white">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Current Indicator */}
          {isCurrent && (
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-primary animate-pulse" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          {/* Episode Number */}
          <span
            className={cn(
              'inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mb-1',
              isCurrent ? 'bg-red-primary text-white' : 'bg-surface text-white/70'
            )}
          >
            {isCourse ? 'EP' : 'PT'} {episodeNumber}
          </span>

          {/* Title */}
          <p
            className={cn(
              'text-sm font-medium leading-tight',
              isCurrent ? 'text-white' : 'text-white/80 group-hover:text-white'
            )}
          >
            {video.title}
          </p>

          {/* Channel - kept clean without verification badge */}
          <p className="text-xs text-white/40 mt-1">
            {video.channel?.name}
          </p>
        </div>
      </div>
    </Link>
  );
}

