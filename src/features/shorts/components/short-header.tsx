'use client';

import Image from 'next/image';
import type { Video } from '@/types';
import { formatRelativeTime } from '@/shared/utils/formatting';

interface ShortHeaderProps {
  video: Video;
}

// Tick/Verified icon component
function TickIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 0L9.79611 1.52786L12.1244 1.52786L12.7023 3.76393L14.7023 5.04508L14.0489 7.29814L14.7023 9.55119L12.7023 10.8323L12.1244 13.0684L9.79611 13.0684L8 14.5963L6.20389 13.0684L3.87564 13.0684L3.29772 10.8323L1.29772 9.55119L1.95106 7.29814L1.29772 5.04508L3.29772 3.76393L3.87564 1.52786L6.20389 1.52786L8 0Z"
        fill="#AB0013"
      />
      <path
        d="M5.5 7.5L7 9L10.5 5.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShortHeader({ video }: ShortHeaderProps) {
  // Filter tags to show (only those with should_show)
  const visibleTags = video.tags?.filter((tag) => tag.should_show) || [];

  return (
    <div>
      {/* Channel info row */}
      <div className="flex items-center gap-1">
        {video.channel?.dp && (
          <Image
            src={video.channel.dp}
            alt={video.channel.name || 'Channel'}
            width={32}
            height={32}
            className="size-8 rounded-full hidden md:inline"
          />
        )}
        <span className="text-[14px] font-bold">{video.channel?.name}</span>
        <TickIcon />
        <span className="ml-1 text-xs text-white/60">{formatRelativeTime(video.published_at)}</span>
      </div>

      {/* Title */}
      <p className="text-sm md:text-[16px] text-white break-words line-clamp-2 mt-4">{video.title}</p>

      {/* Tags */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {visibleTags.map((tag) => (
            <span
              key={tag.id}
              className="bg-red-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
