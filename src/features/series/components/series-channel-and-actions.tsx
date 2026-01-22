'use client';

import type { Video } from '@/types';
import { useSeriesPlayerHandlers } from '../hooks/use-series-player-handlers';
import { SeriesActionButtons } from './series-action-buttons';
import { SeriesChannelInfo } from './series-channel-info';

interface SeriesChannelAndActionsProps {
  currentVideo: Video;
  autoplayEnabled: boolean;
  nextEpisode: Video | null;
  handlers: ReturnType<typeof useSeriesPlayerHandlers>;
}

export function SeriesChannelAndActions({
  currentVideo,
  autoplayEnabled,
  nextEpisode,
  handlers,
}: SeriesChannelAndActionsProps) {
  const channelHandler = currentVideo.channel?.handler;
  const channelName = currentVideo.channel?.name;
  const channelDp = currentVideo.channel?.dp;
  const publishedAt = currentVideo.humans_publish_at || currentVideo.published_at;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pb-4 border-b border-white/10">
      <SeriesChannelInfo
        {...(channelHandler && { channelHandler })}
        {...(channelName && { channelName })}
        {...(channelDp && { channelDp })}
        {...(publishedAt && { publishedAt })}
      />

      <SeriesActionButtons
        currentVideo={currentVideo}
        autoplayEnabled={autoplayEnabled}
        nextEpisode={nextEpisode}
        handlers={handlers}
      />
    </div>
  );
}

