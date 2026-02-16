/**
 * Action buttons component for hover card
 */

import Image from 'next/image';
import { formatRelativeTime } from '@/shared/utils/formatting';
import type { Video } from '@/types';

interface HoverCardActionsProps {
  video: Video;
  showDate?: boolean | undefined;
}

export function HoverCardActions({ video, showDate }: HoverCardActionsProps) {
  return (
    <div className="mt-2">
      <h3 className="font-medium text-text-primary text-sm line-clamp-2 group-hover:text-red-primary transition-colors">
        {video.title}
      </h3>
      {showDate && video.published_at && (
        <p className="text-xs text-text-secondary mt-1">{formatRelativeTime(video.published_at)}</p>
      )}
      <div className="flex items-center gap-2 mt-1">
        {video.channel?.dp ? (
          <div className="relative w-4 h-4 rounded-full overflow-hidden">
            <Image
              src={video.channel.dp}
              alt={`${video.channel.name} profile`}
              fill
              sizes="16px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-primary/80 to-red-dark flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">
              {video.channel?.name?.charAt(0) || '?'}
            </span>
          </div>
        )}
        <p className="text-xs text-text-secondary truncate">{video.channel?.name}</p>
      </div>
    </div>
  );
}
