'use client';

import { CheckCircle, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatDuration, getSeriesPlayRoute } from '@/lib/utils';
import type { Video } from '@/types';

interface PlayerEpisodeCardProps {
  video: Video;
  episodeNumber: number;
  isCurrent: boolean;
  seriesId: string;
  seriesTitle?: string;
  isCourse: boolean;
}

export function PlayerEpisodeCard({
  video,
  episodeNumber,
  isCurrent,
  seriesId,
  seriesTitle,
  isCourse,
}: PlayerEpisodeCardProps) {
  const href = isCourse
    ? `/courses/${seriesId}/play/${video.uuid}`
    : getSeriesPlayRoute(seriesId, seriesTitle, video.uuid);

  return (
    <Link href={href}>
      <div
        className={cn(
          'group flex gap-3 p-2 rounded-xl transition-all',
          isCurrent ? 'bg-red-primary/10 ring-1 ring-red-primary/30' : 'hover:bg-surface/50'
        )}
      >
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

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all shadow-lg">
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            </div>
          </div>

          {video.duration && (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-medium text-white">
              {formatDuration(video.duration)}
            </div>
          )}

          {isCurrent && (
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-primary animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0 py-0.5">
          <span
            className={cn(
              'inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mb-1',
              isCurrent ? 'bg-red-primary text-white' : 'bg-surface text-white/70'
            )}
          >
            {isCourse ? 'EP' : 'PT'} {episodeNumber}
          </span>

          <p
            className={cn(
              'text-sm font-medium line-clamp-2 leading-tight',
              isCurrent ? 'text-white' : 'text-white/80 group-hover:text-white'
            )}
          >
            {video.title}
          </p>

          <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
            {video.channel?.name}
            <CheckCircle className="w-2.5 h-2.5 text-red-primary" />
          </p>
        </div>
      </div>
    </Link>
  );
}

