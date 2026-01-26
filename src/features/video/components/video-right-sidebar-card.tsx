'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import type { Video } from '@/types';

interface VideoRightSidebarCardProps {
  video: Video;
  currentVideoId?: number;
  actionButtons?: boolean;
}

export function VideoRightSidebarCard({
  video,
  currentVideoId,
  actionButtons: _actionButtons = false,
}: VideoRightSidebarCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const isCurrentVideo = video.id === currentVideoId;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !video) {
    return (
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-b from-red-primary/30 to-surface/20 border border-white/10">
        <div className="h-[155px] bg-surface animate-pulse" />
        <div className="py-2 px-3">
          <div className="h-[18px] w-full bg-surface rounded animate-pulse mb-5" />
          <div className="flex items-center gap-1">
            <div className="h-[18px] w-1/2 bg-surface rounded animate-pulse" />
            <div className="h-[18px] w-1/2 bg-surface rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Filter tags to show (exclude +18, 18+, Sensitive)
  const visibleTags =
    video.tags?.filter(
      (tag) =>
        tag.should_show && tag.name !== '+18' && tag.name !== '18+' && tag.name !== 'Sensitive'
    ) || [];

  return (
    <Link
      href={`/videos/${video.id}`}
      prefetch={false}
      className={`relative block rounded-lg overflow-hidden bg-gradient-to-b from-red-primary/30 to-surface/20 border border-white/10 hover:opacity-85 transition-opacity ${
        isCurrentVideo ? 'ring-2 ring-red-primary' : ''
      }`}
    >
      <div className="relative h-[155px]">
        {video.thumbnail && (
          <Image
            src={video.thumbnail_webp || video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="py-2 px-3">
        <p
          className="text-lg font-normal w-full mb-1 line-clamp-2 leading-[30px]"
          style={{ wordBreak: 'break-word' }}
        >
          {video.title}
        </p>

        {/* Tags */}
        {(visibleTags.length > 0 || video.is_adult_content) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {visibleTags.map((tag) => (
              <span
                key={tag.id}
                className="bg-red-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide"
              >
                {tag.name}
              </span>
            ))}
            {video.is_adult_content && (
              <span className="bg-red-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide">
                After Hours
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          <p className="text-sm font-normal text-text-secondary">{video.channel?.name}</p>
          <VerifiedBadge size={12} />
        </div>
      </div>
    </Link>
  );
}
