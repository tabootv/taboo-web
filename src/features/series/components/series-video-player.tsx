'use client';

import { VideoPlayer } from '@/features/video/components/video-player';
import type { Video } from '@/types';
import { useSearchParams } from 'next/navigation';
import { UpNextOverlay } from './up-next-overlay';

interface SeriesVideoPlayerProps {
  currentVideo: Video;
  autoplayEnabled: boolean;
  onEnded: () => void;
  nextVideo: Video | null;
  showUpNext: boolean;
  countdown: number;
  onCancelUpNext: () => void;
  onPlayNow: () => void;
}

export function SeriesVideoPlayer({
  currentVideo,
  autoplayEnabled,
  onEnded,
  nextVideo,
  showUpNext,
  countdown,
  onCancelUpNext,
  onPlayNow,
}: SeriesVideoPlayerProps) {
  const searchParams = useSearchParams();
  const forceAutoplay = searchParams.get('autoplay') === 'true';

  // Override autoplay when coming from Up Next navigation
  const shouldAutoplay = forceAutoplay || autoplayEnabled;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black">
      <VideoPlayer
        {...(currentVideo.thumbnail && !forceAutoplay && { thumbnail: currentVideo.thumbnail })}
        hls_url={currentVideo.hls_url || currentVideo.url_hls || null}
        url_1440={currentVideo.url_1440 || null}
        url_1080={currentVideo.url_1080 || null}
        url_720={currentVideo.url_720 || null}
        url_480={currentVideo.url_480 || null}
        autoplay={shouldAutoplay}
        onEnded={onEnded}
      />
      {showUpNext && nextVideo && (
        <UpNextOverlay
          nextVideo={nextVideo}
          countdown={countdown}
          onCancel={onCancelUpNext}
          onPlayNow={onPlayNow}
        />
      )}
    </div>
  );
}
