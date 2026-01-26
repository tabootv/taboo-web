'use client';

import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { usePrefetch } from '@/hooks/use-prefetch';
import { getSeriesRoute } from '@/shared/utils/formatting';
import type { Series } from '@/types';
import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SeriesPremiumCardProps {
  series: Series;
}

export function SeriesPremiumCard({ series }: SeriesPremiumCardProps) {
  const { prefetchRoute } = usePrefetch();
  const thumbnail = series.trailer_thumbnail || series.thumbnail || series.card_thumbnail;
  const url = getSeriesRoute(series.id, series.title);
  const videoCount = series.videos_count || 0;

  return (
    <Link
      href={url}
      prefetch={true}
      onMouseEnter={() => prefetchRoute(url)}
      className="series-card-clean group"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={series.title}
            fill
            className="object-cover w-full h-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-red-dark to-red-primary" />
        )}

        <div className="absolute top-3 left-3 series-type-badge">
          <Play className="w-3 h-3 fill-white" />
          Series
        </div>
      </div>

      <div className="p-4 flex flex-col">
        <h3 className="text-base font-medium text-white line-clamp-2 min-h-12 mb-3">
          {series.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              {series.channel?.dp ? (
                <Image
                  src={series.channel.dp}
                  alt={series.channel.name || 'Creator'}
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-red-primary to-red-dark flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(series.channel?.name || 'C').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5">
                <VerifiedBadge />
              </div>
            </div>
            <span className="text-sm text-text-secondary truncate">
              {series.channel?.name || 'Creator'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
            <Play className="w-3 h-3 text-red-primary fill-red-primary" />
            <span className="text-xs font-medium text-white/80">
              {videoCount} {videoCount === 1 ? 'episode' : 'episodes'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
