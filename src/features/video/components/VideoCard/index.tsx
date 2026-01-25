'use client';

import { formatDuration, formatRelativeTime } from '@/shared/utils/formatting';
import { usePrefetch } from '@/hooks/use-prefetch';
import type { Video } from '@/types';
import { Clock, Film } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const NEW_THRESHOLD_DAYS = 7;

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const { prefetchRoute } = usePrefetch();
  const href = `/videos/${video.uuid || video.id}`;
  const thumbnail = video.thumbnail_webp || video.thumbnail || video.card_thumbnail;
  const durationLabel = video.duration ? formatDuration(video.duration) : null;
  const publishedLabel = formatRelativeTime(video.published_at);
  const isNew = (() => {
    if (!video.published_at) return false;
    const publishedDate = new Date(video.published_at).getTime();
    const days = (Date.now() - publishedDate) / (1000 * 60 * 60 * 24);
    return days <= NEW_THRESHOLD_DAYS;
  })();

  return (
    <Link
      href={href}
      prefetch={true}
      onMouseEnter={() => prefetchRoute(href)}
      className="group block"
    >
      <div className="relative aspect-video rounded-[10px] overflow-hidden border border-white/8 bg-surface transition-all duration-200 shadow-none group-hover:-translate-y-0.5 group-hover:border-white/25 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] group-hover:scale-[1.02]">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
            <Film className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
        {isNew && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-red-primary text-white text-[11px] font-semibold shadow">
            NEW
          </div>
        )}
        {durationLabel && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-full text-[11px] text-white font-medium">
            <Clock className="w-3.5 h-3.5" />
            {durationLabel}
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-white text-[13px] md:text-[14px] leading-snug line-clamp-3 group-hover:text-red-primary transition-colors">
          {video.title}
        </h3>
        <div className="text-sm text-white/60 mt-0.5 truncate flex items-center gap-2">
          {video.channel?.name && (
            <span className="truncate hover:text-white transition-colors">
              {video.channel.name}
            </span>
          )}
          {publishedLabel && (
            <span className="text-white/40 text-xs shrink-0">{publishedLabel}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
