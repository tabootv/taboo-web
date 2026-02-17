'use client';

import { useStudioVideoPlay } from '@/api/queries/studio.queries';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { VideoPlayerSkeleton } from '@/features/video/components/VideoPlayerSkeleton';
import { useAuthStore } from '@/shared/stores/auth-store';
import { formatRelativeTime, getCreatorRoute } from '@/shared/utils/formatting';
import type { Video } from '@/types';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { LatestUploadsSidebar } from './latest-uploads-sidebar';
import { VideoProcessingState } from './video-processing-state';

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

interface StudioWatchPlayerProps {
  videoUuid: string;
}

function hasPlaybackUrls(video: Video): boolean {
  return !!(video.hls_url || video.url_hls || video.url_1080 || video.url_720 || video.url_480);
}

export function StudioWatchPlayer({ videoUuid }: StudioWatchPlayerProps) {
  const { data: video, isLoading } = useStudioVideoPlay(videoUuid);
  const user = useAuthStore((s) => s.user);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-white/10 rounded mb-4" />
        <div className="aspect-video bg-white/5 rounded-lg" />
        <div className="h-6 w-3/4 bg-white/10 rounded mt-4" />
        <div className="h-4 w-1/2 bg-white/5 rounded mt-3" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-text-secondary text-lg">Video not found</p>
          <Link
            href="/studio/content"
            className="text-red-primary hover:underline mt-2 inline-block"
          >
            Back to Studio
          </Link>
        </div>
      </div>
    );
  }

  const isShort = !!(video.is_short || video.short);
  const shouldTruncateDescription = video.description && video.description.length > 200;

  return (
    <>
      {/* Two-column flex matching public video page */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: player + info */}
        <div className="flex-1 min-w-0">
          {/* Player or processing state */}
          {hasPlaybackUrls(video) ? (
            <div className="relative w-full rounded-lg overflow-hidden bg-black">
              <VideoPlayer
                {...(video.thumbnail && { thumbnail: video.thumbnail })}
                hls_url={video.hls_url || video.url_hls || null}
                url_1080={video.url_1080 || null}
                url_720={video.url_720 || null}
                url_480={video.url_480 || null}
                {...(video.is_bunny_video !== undefined && { isBunnyVideo: video.is_bunny_video })}
                {...(video.captions && { captions: video.captions })}
                videoId={video.uuid}
                videoTitle={video.title}
                channelName={video.channel?.name}
                contentType={isShort ? 'short' : 'video'}
                {...(video.duration !== undefined && { videoDuration: video.duration })}
              />
            </div>
          ) : (
            <VideoProcessingState
              {...(video.thumbnail && { thumbnail: video.thumbnail })}
              isShort={isShort}
            />
          )}

          {/* Title */}
          <div className="flex flex-col items-start gap-1">
            <h1 className="font-medium text-white mt-3 leading-snug text-[1.5rem]!">
              {video.title}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 text-amber-400 rounded-full text-xs font-medium">
              Private
            </span>
          </div>

          {/* Channel info */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 mt-3 pb-4">
            <div className="flex items-center gap-3">
              {(video.channel || user) && (
                <>
                  <Link href={getCreatorRoute(video?.channel?.handler) || '#'} className="shrink-0">
                    <div className="relative size-10 rounded-full overflow-hidden">
                      {video?.channel?.dp || user?.dp ? (
                        <Image
                          src={video?.channel?.dp || user?.dp || ''}
                          alt={video?.channel?.name || user?.display_name || 'Channel'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center bg-surface text-white font-semibold">
                          {video?.channel?.name?.charAt(0) || user?.display_name?.charAt(0) || 'C'}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={getCreatorRoute(video?.channel?.handler) || '#'}
                      className="flex items-center gap-1 group"
                    >
                      <span className="font-medium text-white group-hover:text-text-secondary transition-colors truncate">
                        {video?.channel?.name || user?.display_name}
                      </span>
                      <span className="shrink-0">
                        <VerifiedBadge size={14} />
                      </span>
                    </Link>
                    <p className="text-xs text-text-secondary">
                      {video?.humans_publish_at || formatRelativeTime(video?.published_at)}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Edit Video button */}
            <Link
              href={`/studio/content?edit=${videoUuid}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-surface hover:bg-[#2e2e2e] rounded-lg transition-colors"
            >
              Edit video
            </Link>
          </div>

          {/* Description */}
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

        {/* Right column: latest uploads */}
        <LatestUploadsSidebar currentVideoUuid={videoUuid} />
      </div>
    </>
  );
}
