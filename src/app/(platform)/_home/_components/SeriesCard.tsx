/**
 * Individual series card component for the vertical list
 */

import { cn, getSeriesRoute } from '@/shared/utils/formatting';
import type { Series } from '@/types';
import { ChevronRight, Film, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SeriesCardProps {
  item: Series;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export function SeriesCard({ item, index, isSelected, onClick }: SeriesCardProps) {
  const thumbnail = item.card_thumbnail || item.thumbnail || item.trailer_thumbnail;
  const isNew = item.latest;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex-shrink-0 w-[140px] lg:w-full snap-start lg:snap-align-none flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-lg transition-all duration-200 text-left border border-transparent',
        isSelected
          ? 'bg-white/10 border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.25)]'
          : 'bg-transparent hover:bg-white/5'
      )}
    >
      <div className="relative w-full lg:w-20 aspect-video lg:aspect-[16/10] rounded-md overflow-hidden flex-shrink-0">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 140px, 80px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-hover flex items-center justify-center">
            <Film className="w-5 h-5 text-white/30" />
          </div>
        )}

        <div className="lg:hidden absolute top-1 left-1 w-4 h-4 bg-black/70 rounded flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">{index + 1}</span>
        </div>

        {isNew && (
          <div className="absolute top-1 right-1 px-1 py-0.5 bg-red-primary text-white text-[7px] font-bold rounded">
            NEW
          </div>
        )}

        {isSelected && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-3 h-3 text-black fill-black ml-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="hidden lg:flex items-center gap-1.5 mb-0.5">
          <span
            className={cn(
              'text-sm font-bold transition-colors',
              isSelected ? 'text-white' : 'text-white/30'
            )}
          >
            #{index + 1}
          </span>
        </div>

        <h3
          className={cn(
            'font-medium text-xs lg:text-sm line-clamp-2 lg:line-clamp-1 transition-colors',
            isSelected ? 'text-white' : 'text-white/70 group-hover:text-white'
          )}
        >
          {item.title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <p className="text-[10px] lg:text-xs text-white/60">{item.videos_count || 0} episodes</p>
          {item.channel?.name && (
            <span className="text-[10px] lg:text-xs text-white/40 truncate">
              {item.channel.name}
            </span>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 mt-2">
          <Link
            href={getSeriesRoute(item.id, item.title)}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-[11px] font-medium transition-colors"
          >
            View series
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <ChevronRight
        className={cn(
          'hidden lg:block w-4 h-4 shrink-0 transition-all',
          isSelected
            ? 'text-white opacity-100 translate-x-0'
            : 'text-white/20 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
        )}
      />
    </button>
  );
}
