'use client';

import { cn, formatDuration } from '@/shared/utils/formatting';
import { getCountryName } from '@/shared/utils/country';
import Image from 'next/image';
import Link from 'next/link';
import type { CreatorVideoGridProps } from './types';

export function CreatorVideoGrid({
  videos,
  variant = 'grid',
  showAll = false,
}: CreatorVideoGridProps) {
  if (videos.length === 0) {
    return <div className="text-white/40 text-sm py-10 text-center">No videos found.</div>;
  }

  if (variant === 'rail') {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
        {videos.slice(0, 7).map((video) => (
          <Link
            key={video.uuid}
            href={`/videos/${video.uuid}`}
            rel="noopener noreferrer"
            className={cn(
              'shrink-0 text-inherit no-underline',
              'w-[170px] sm:w-[200px] md:w-[260px]',
              'transition-all duration-250',
              'hover:-translate-y-1 hover:scale-[1.02]',
              'hover:shadow-[0_8px_30px_rgba(171,0,19,0.2)]'
            )}
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-[#111]">
              <Image
                src={video.thumbnail_webp || video.thumbnail || ''}
                alt={video.title}
                width={260}
                height={146}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {getCountryName(video.country) && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/75 rounded text-[10px] text-[#ccc] uppercase tracking-wide">
                  {getCountryName(video.country)}
                </div>
              )}
              {video.duration && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                  {formatDuration(video.duration)}
                </div>
              )}
            </div>

            <h4 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white mt-2.5 line-clamp-2">
              {video.title}
            </h4>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('grid gap-5', 'grid-cols-1 sm:grid-cols-2', 'lg:grid-cols-3 xl:grid-cols-4')}
    >
      {(showAll ? videos : videos.slice(0, 18)).map((video) => (
        <a
          key={video.uuid}
          href={`/videos/${video.uuid}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'text-inherit no-underline',
            'transition-all duration-250',
            'hover:-translate-y-1 hover:scale-[1.02]',
            'hover:shadow-[0_8px_30px_rgba(171,0,19,0.2)]'
          )}
        >
          <div className="relative aspect-video rounded-lg overflow-hidden bg-[#111]">
            <Image
              src={video.thumbnail_webp || video.thumbnail || ''}
              alt={video.title}
              width={400}
              height={225}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {getCountryName(video.country) && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/75 rounded text-[10px] text-[#ccc] uppercase tracking-wide">
                {getCountryName(video.country)}
              </div>
            )}
            {video.duration && (
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>
          <h4 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mt-2.5 line-clamp-2">
            {video.title}
          </h4>
        </a>
      ))}
    </div>
  );
}
