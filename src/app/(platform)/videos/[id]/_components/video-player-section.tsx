'use client';

import { useVideoPlay } from '@/api/queries/video.queries';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { VideoPlayerSkeleton } from '@/features/video/components/VideoPlayerSkeleton';
import { LikeButton } from '@/features/video/components/like-button';
import { SaveButton } from '@/features/video/components/save-button';
import { useAuthStore } from '@/shared/stores/auth-store';
import { formatRelativeTime, getCreatorRoute } from '@/shared/utils/formatting';
import { normalizeTags } from '@/shared/utils/tags';
import type { Video } from '@/types';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const { user } = useAuthStore();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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

  const autoplayEnabled = user?.video_autoplay ?? true;

  const videoRef = useRef(video);
  const relatedVideosRef = useRef(relatedVideos);

  useEffect(() => {
    videoRef.current = video;
    relatedVideosRef.current = relatedVideos;
  }, [video, relatedVideos]);

  const playNextVideo = useCallback(() => {
    const currentVideo = videoRef.current;
    const videos = relatedVideosRef.current;
    if (!currentVideo || videos.length === 0) return;
    const currentKey = currentVideo.uuid || currentVideo.id;
    const currentIndex = videos.findIndex((v) => (v.uuid || v.id) === currentKey);
    if (currentIndex >= 0 && currentIndex < videos.length - 1) {
      const nextVideo = videos[currentIndex + 1];
      if (nextVideo) {
        const nextId = nextVideo.uuid || nextVideo.id;
        if (nextId) router.push(`/videos/${nextId}`);
      }
    } else if (videos.length > 0) {
      const firstVideo = videos[0];
      if (firstVideo) {
        const firstId = firstVideo.uuid || firstVideo.id;
        if (firstId) router.push(`/videos/${firstId}`);
      }
    }
  }, [router]);

  const handleVideoEnded = useCallback(() => {
    if (autoplayEnabled) {
      playNextVideo();
    }
  }, [autoplayEnabled, playNextVideo]);

  if (!video) return null;

  const shouldTruncateDescription = video.description && video.description.length > 200;

  return (
    <div className="flex-1 min-w-0">
      <div className="w-full rounded-lg overflow-hidden bg-black">
        <VideoPlayer
          {...(video.thumbnail && { thumbnail: video.thumbnail })}
          hls_url={video.hls_url || video.url_hls || null}
          url_1440={video.url_1440 || null}
          url_1080={video.url_1080 || null}
          url_720={video.url_720 || null}
          url_480={video.url_480 || null}
          autoplay={autoplayEnabled}
          onEnded={handleVideoEnded}
          isBunnyVideo={video.is_bunny_video}
          captions={video.captions}
          userProgress={video.user_progress}
          videoId={video.uuid}
          videoTitle={video.title}
          channelName={video.channel?.name}
          contentType="video"
          videoDuration={video.duration}
        />
      </div>

      <h1 className="font-medium text-white mt-3 leading-snug" style={{ fontSize: '24px' }}>
        {video.title}
      </h1>

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
        <div className="bg-surface/60 border border-border rounded-xl p-4">
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
