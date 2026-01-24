'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { CreatorShortsGridProps } from './types';

export function CreatorShortsGrid({
  shorts,
  variant = 'grid',
}: CreatorShortsGridProps) {
  if (shorts.length === 0) {
    return (
      <div className="text-white/40 text-sm py-10 text-center">No shorts found.</div>
    );
  }

  if (variant === 'rail') {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
        {shorts.slice(0, 8).map((short, index) => (
          <a
            key={short.uuid || short.id || index}
            href={`/shorts/${short.uuid}`}
            rel="noopener noreferrer"
            className={cn(
              'flex-shrink-0 text-inherit no-underline',
              'w-[120px] sm:w-[140px] md:w-[160px]',
              'h-[214px] sm:h-[249px]',
              'rounded-lg overflow-hidden relative bg-[#1a1a1a]',
              'transition-all duration-250',
              'hover:scale-105 hover:shadow-[0_8px_25px_rgba(171,0,19,0.25)]'
            )}
          >
            <Image
              src={short.thumbnail_webp || short.thumbnail || ''}
              alt={short.title || ''}
              width={160}
              height={249}
              className="w-full h-full object-cover absolute top-0 left-0"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)',
              }}
            />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-3.5',
        'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
        'lg:grid-cols-5 xl:grid-cols-6'
      )}
    >
      {shorts.map((short, index) => (
        <a
          key={short.uuid || short.id || index}
          href={`/shorts/${short.uuid}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'aspect-[9/16] rounded-lg overflow-hidden relative block bg-[#1a1a1a] min-h-[200px]',
            'transition-all duration-250',
            'hover:scale-105 hover:shadow-[0_8px_25px_rgba(171,0,19,0.25)]'
          )}
        >
          <Image
            src={short.thumbnail_webp || short.thumbnail || ''}
            alt={short.title || ''}
            width={160}
            height={249}
            className="w-full h-full object-cover absolute top-0 left-0"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)',
            }}
          />
        </a>
      ))}
    </div>
  );
}
