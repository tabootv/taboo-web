'use client';

import { useVideoPlay } from '@/api/queries/video.queries';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { UpNextOverlay } from '@/features/series/components/up-next-overlay';
import { useUpNextCountdown } from '@/features/series/hooks/use-up-next-countdown';
import { LikeButton } from '@/features/video/components/like-button';
import { SaveButton } from '@/features/video/components/save-button';
import type { PlayerNavigationControls } from '@/features/video/components/shaka-player/types';
import { VideoPlayerSkeleton } from '@/features/video/components/VideoPlayerSkeleton';
import { useAuthStore } from '@/shared/stores/auth-store';
import { formatRelativeTime, getCreatorRoute } from '@/shared/utils/formatting';
import { normalizeTags } from '@/shared/utils/tags';
import type { Video } from '@/types';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

const VideoPlayer = dynamic(
  () =>
    import('@/features/video/components/video-player').then((mod) => ({
      default: mod.VideoPlayer,
    })),
  {
    loading: () => <VideoPlayerSkeleton />,
    ssr: false,
  }
);

interface VideoPlayerSectionProps {
  initialPlayData: { video: Video; videos: Video[] };
  videoId: string;
}

export function VideoPlayerSection({ initialPlayData, videoId }: VideoPlayerSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(user?.video_autoplay ?? true);
  const [showUpNext, setShowUpNext] = useState(false);

  const isAutoplayNavigation = searchParams.get('autoplay') === 'true';

  const { data: playData } = useVideoPlay(videoId, { initialData: initialPlayData });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [videoId]);

  const video = playData?.video
    ? { ...playData.video, tags: normalizeTags(playData.video.tags) }
    : null;

  const relatedVideos = (playData?.videos || []).map((v) => ({
    ...v,
    tags: normalizeTags(v.tags),
  }));

  const nextVideo = useMemo(() => {
    if (!video || relatedVideos.length === 0) return null;
    const currentKey = video.uuid || video.id;
    const currentIndex = relatedVideos.findIndex((v) => (v.uuid || v.id) === currentKey);
    if (currentIndex >= 0 && currentIndex < relatedVideos.length - 1) {
      return relatedVideos[currentIndex + 1] ?? null;
    }
    return relatedVideos[0] ?? null;
  }, [video, relatedVideos]);

  const navigateToNext = useCallback(() => {
    if (!nextVideo) return;
    const nextId = nextVideo.uuid || nextVideo.id;
    if (nextId) {
      setShowUpNext(false);
      router.push(`/videos/${nextId}?autoplay=true`);
    }
  }, [nextVideo, router]);

  const countdown = useUpNextCountdown({ onComplete: navigateToNext });

  const handleCancelUpNext = useCallback(() => {
    countdown.cancel();
    setShowUpNext(false);
  }, [countdown]);

  // Reset overlay when video changes
  useEffect(() => {
    setShowUpNext(false);
    countdown.cancel();
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVideoEnded = useCallback(() => {
    if (autoplayEnabled && nextVideo) {
      setShowUpNext(true);
      countdown.start();
    }
  }, [autoplayEnabled, nextVideo, countdown]);

  const navigationControls: PlayerNavigationControls = useMemo(
    () => ({
      autoplayEnabled,
      onAutoplayChange: setAutoplayEnabled,
    }),
    [autoplayEnabled]
  );

  if (!video) return null;

  const shouldTruncateDescription = video.description && video.description.length > 200;

  return (
    <div className="flex-1 min-w-0">
      <div className="relative w-full rounded-lg overflow-hidden bg-black">
        <VideoPlayer
          {...(!isAutoplayNavigation && video.thumbnail && { thumbnail: video.thumbnail })}
          hls_url={video.hls_url || video.url_hls || null}
          url_1440={video.url_1440 || null}
          url_1080={video.url_1080 || null}
          url_720={video.url_720 || null}
          url_480={video.url_480 || null}
          autoplay={autoplayEnabled || isAutoplayNavigation}
          onEnded={handleVideoEnded}
          isBunnyVideo={video.is_bunny_video}
          captions={video.captions}
          userProgress={video.user_progress}
          videoId={video.uuid}
          videoTitle={video.title}
          channelName={video.channel?.name}
          contentType="video"
          videoDuration={video.duration}
          navigationControls={navigationControls}
        />
        {showUpNext && nextVideo && (
          <UpNextOverlay
            nextVideo={nextVideo}
            countdown={countdown.countdown}
            onCancel={handleCancelUpNext}
            onPlayNow={countdown.playNow}
          />
        )}
      </div>

      <h1 className="font-medium text-white mt-3 leading-snug text-[1.5rem]!">{video.title}</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-3 pb-4">
        <div className="flex items-center gap-3">
          <Link href={getCreatorRoute(video.channel?.handler)} className="shrink-0">
            <div className="relative size-10 rounded-full overflow-hidden">
              {video.channel?.dp ? (
                <Image
                  src={video.channel.dp}
                  alt={video.channel.name || 'Channel'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center bg-surface text-white font-semibold">
                  {video.channel?.name?.charAt(0) || 'C'}
                </div>
              )}
            </div>
          </Link>
          <div className="min-w-0">
            <Link
              href={getCreatorRoute(video.channel?.handler)}
              className="flex items-center gap-1 group"
            >
              <span className="font-medium text-white group-hover:text-text-secondary transition-colors truncate">
                {video.channel?.name}
              </span>
              <span className="shrink-0">
                <VerifiedBadge size={14} />
              </span>
            </Link>
            <p className="text-xs text-text-secondary">
              {video.humans_publish_at || formatRelativeTime(video.published_at)}
            </p>
          </div>
          {video.channel?.paypal_link && (
            <a
              href={video.channel.paypal_link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2"
            >
              <Button variant="default" size="sm" className="rounded-full px-4 font-medium text-sm">
                Donate
              </Button>
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <LikeButton
            video={video}
            onUpdate={() => {
              // Video state is managed by TanStack Query, mutations handle cache updates
            }}
          />
          <SaveButton video={video} />
        </div>
      </div>

      {video.description && (
        <div className="bg-surface/60 rounded-xl p-4">
          <button
            type="button"
            className="w-full text-left"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            <p
              className={`text-sm text-text-secondary whitespace-pre-wrap ${
                !isDescriptionExpanded && shouldTruncateDescription ? 'line-clamp-2' : ''
              }`}
            >
              {video.description}
            </p>
            {shouldTruncateDescription && (
              <span className="block text-sm font-medium text-white mt-2">
                {isDescriptionExpanded ? 'Show less' : 'Show more'}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
