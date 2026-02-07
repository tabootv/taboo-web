'use client';

import { useToggleBookmark } from '@/api/mutations';
import { Avatar } from '@/components/ui/avatar';
import { useCreatorById } from '@/hooks/use-creator-by-id';
import { useFeature } from '@/hooks/use-feature';
import { formatRelativeTime } from '@/shared/utils/formatting';
import type { Video } from '@/types';
import { Check, Play, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { NEW_THRESHOLD_DAYS } from '../constants';

interface VideoCardEnhancedProps {
  video: Video;
  priority?: boolean;
  onOpenPreview?: (video: Video) => void;
}

export function VideoCardEnhanced({
  video,
  priority = false,
  onOpenPreview,
}: VideoCardEnhancedProps) {
  const [isHovered, setIsHovered] = useState(false);

  const bookmarksEnabled = useFeature('BOOKMARK_SYSTEM');
  const toggleBookmark = useToggleBookmark();
  const saved = video.is_bookmarked || false;

  const href = `/videos/${video.uuid || video.id}`;
  const thumbnail = video.thumbnail_webp || video.thumbnail || video.card_thumbnail;
  const publishedLabel = formatRelativeTime(video.published_at);
  const isNew =
    video.published_at &&
    new Date(video.published_at).getTime() > Date.now() - NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!bookmarksEnabled) return;

    const videoIdentifier = video.uuid || video.id;
    if (!videoIdentifier) {
      console.error('Cannot bookmark video: missing uuid and id');
      return;
    }

    toggleBookmark.mutate(videoIdentifier, {
      onError: (error) => {
        console.error('Failed to toggle bookmark:', error);
      },
    });
  };

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenPreview?.(video);
  };

  const creator = useCreatorById(video.channel?.id);
  const creatorImage = creator?.dp;
  const creatorName = creator?.name || video.channel?.name;

  return (
    <Link
      href={href}
      className="group block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            className={`object-cover transition-all duration-300 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1400px) 25vw, 20vw"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-surface to-surface-hover flex items-center justify-center">
            <Play className="w-12 h-12 text-white/30" />
          </div>
        )}

        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="p-3 bg-red-primary rounded-full transform transition-transform hover:scale-110">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        {isNew && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-primary text-white text-[10px] font-bold rounded">
            NEW
          </div>
        )}

        <div
          className={`absolute bottom-2 left-2 flex items-center gap-1.5 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {bookmarksEnabled && (
            <button
              onClick={handleSave}
              disabled={toggleBookmark.isPending}
              className={`p-1.5 rounded-full border transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                saved
                  ? 'bg-white/20 border-white'
                  : 'bg-black/60 border-white/40 hover:border-white'
              }`}
              title={saved ? 'Remove from My List' : 'Add to My List'}
            >
              {saved ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          )}

          {onOpenPreview && (
            <button
              onClick={handleOpenPreview}
              className="px-2.5 py-1 bg-black/60 border border-white/40 hover:border-white rounded-full text-[10px] text-white font-medium transition-all hover:scale-105"
            >
              More Info
            </button>
          )}
        </div>
      </div>

      <div className="mt-2">
        <h3 className="font-medium text-white text-[12px] md:text-sm leading-snug line-clamp-2 group-hover:text-red-primary transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <Avatar
            src={creatorImage}
            alt={creatorName}
            size="sm"
            fallback={creatorName}
            className="shrink-0"
          />
          <div className="text-sm text-white/60 truncate flex items-center gap-2 min-w-0 justify-between w-full">
            {creatorName && (
              <span className="truncate hover:text-white transition-colors">{creatorName}</span>
            )}
            {publishedLabel && (
              <span className="text-white/40 text-xs shrink-0">{publishedLabel}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
