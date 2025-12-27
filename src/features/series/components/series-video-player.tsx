'use client';

import { VideoPlayer } from '@/features/video';
import type { Video } from '@/types';

interface SeriesVideoPlayerProps {
  currentVideo: Video;
  autoplayEnabled: boolean;
  onEnded: () => void;
}

export function SeriesVideoPlayer({ currentVideo, autoplayEnabled, onEnded }: SeriesVideoPlayerProps) {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-black">
      <VideoPlayer
        {...(currentVideo.thumbnail && { thumbnail: currentVideo.thumbnail })}
        hls_url={currentVideo.hls_url || currentVideo.url_hls || null}
        url_1440={currentVideo.url_1440 || null}
        url_1080={currentVideo.url_1080 || null}
        url_720={currentVideo.url_720 || null}
        url_480={currentVideo.url_480 || null}
        autoplay={autoplayEnabled}
        onEnded={onEnded}
      />
    </div>
  );
}

