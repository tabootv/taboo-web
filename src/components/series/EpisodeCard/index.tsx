'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Play } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { usePrefetch } from '@/lib/hooks/use-prefetch';
import type { Channel, Video } from '@/types';

interface EpisodeCardProps {
  video: Video;
  episodeNumber: number;
  seriesId: string;
  channel?: Channel;
  isCourse: boolean;
}

export function EpisodeCard({
  video,
  episodeNumber,
  seriesId,
  channel,
  isCourse,
}: EpisodeCardProps) {
  const { prefetchRoute } = usePrefetch();
  const href = isCourse
    ? `/courses/${seriesId}/play/${video.uuid}`
    : `/series/${seriesId}/play/${video.uuid}`;

  return (
    <Link
      href={href}
      prefetch={true}
      onMouseEnter={() => prefetchRoute(href)}
      className="group block"
    >
      <div className="relative bg-surface/40 rounded-xl overflow-hidden transition-all duration-300 hover:bg-surface/70 hover:ring-1 hover:ring-white/10 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30">
        <div className="relative aspect-video overflow-hidden">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail_webp || video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-surface to-background" />
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-lg">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-black fill-black ml-0.5" />
            </div>
          </div>

          {video.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-medium text-white">
              {formatDuration(video.duration)}
            </div>
          )}

          <div className="absolute top-2 left-2 px-2.5 py-1 bg-red-primary/90 backdrop-blur-sm rounded text-xs font-bold text-white">
            {isCourse ? 'EP' : 'PART'} {episodeNumber}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="text-white font-medium line-clamp-2 mb-2 group-hover:text-red-primary transition-colors text-sm sm:text-base">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-white/50 text-xs sm:text-sm line-clamp-2 mb-3">
              {video.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <span className="truncate">{video.channel?.name || channel?.name}</span>
            <CheckCircle className="w-3 h-3 text-red-primary shrink-0" />
          </div>
        </div>
      </div>
    </Link>
  );
}

