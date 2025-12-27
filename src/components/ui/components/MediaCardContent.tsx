/**
 * Content section component for MediaCard
 */

import Image from 'next/image';
import { Clock, Eye, Heart } from 'lucide-react';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import { MEDIA_CARD_SIZE_STYLES } from '../constants/media-card-constants';
import type { MediaCardProps } from '../media-card';

interface MediaCardContentProps {
  title: string;
  channel?: MediaCardProps['channel'] | undefined;
  views?: number | undefined;
  likes?: number | undefined;
  date?: string | undefined;
  size: MediaCardProps['size'];
}

export function MediaCardContent({
  title,
  channel,
  views,
  likes,
  date,
  size = 'md',
}: MediaCardContentProps) {
  const styles = MEDIA_CARD_SIZE_STYLES[size];

  return (
    <div className={styles.padding}>
      {/* Channel Info */}
      {channel && (
        <div className="flex items-start gap-2 mb-2">
          <div className={`${styles.avatar} relative rounded-full overflow-hidden flex-shrink-0 bg-surface`}>
            {channel.avatar ? (
              <Image
                src={channel.avatar}
                alt={channel.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {channel.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className={`title-card ${styles.title}`}>{title}</h3>

            {/* Channel Name */}
            <p className={`${styles.meta} text-text-secondary mt-0.5 truncate`}>
              {channel.name}
            </p>
          </div>
        </div>
      )}

      {/* Title without channel */}
      {!channel && (
        <h3 className={`title-card ${styles.title} mb-2`}>{title}</h3>
      )}

      {/* Metadata Row */}
      <div className={`flex items-center gap-3 ${styles.meta} text-text-secondary`}>
        {views !== undefined && (
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatNumber(views)}
          </span>
        )}
        {likes !== undefined && (
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {formatNumber(likes)}
          </span>
        )}
        {date && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatRelativeTime(date)}
          </span>
        )}
      </div>
    </div>
  );
}

