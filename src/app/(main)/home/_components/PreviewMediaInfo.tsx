/**
 * Media information display component for preview modal
 */

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Check, Clock, Eye, Heart, ChevronDown } from 'lucide-react';
import {
  formatDuration,
  formatCompactNumber,
  formatRelativeTime,
  getCreatorRoute,
} from '@/shared/utils/formatting';
import type { Video } from '@/types';

interface PreviewMediaInfoProps {
  video: Video;
  saved: boolean;
  showFullDescription: boolean;
  description: string;
  onSave: () => void;
  onToggleDescription: () => void;
}

export function PreviewMediaInfo({
  video,
  saved,
  showFullDescription,
  description,
  onSave,
  onToggleDescription,
}: PreviewMediaInfoProps) {
  return (
    <div className="p-6">
      {/* Title & Actions Row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2 id="modal-title" className="text-xl md:text-2xl font-bold text-white leading-tight">
          {video.title}
        </h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onSave}
            className={`p-2.5 rounded-full border transition-all hover:scale-110 ${
              saved
                ? 'bg-white/20 border-white text-white'
                : 'bg-surface-hover border-white/30 hover:border-white text-white'
            }`}
            title={saved ? 'Remove from My List' : 'Add to My List'}
          >
            {saved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-white/70 mb-4">
        {video.duration && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatDuration(video.duration)}
          </span>
        )}
        {video.views_count !== undefined && (
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            {formatCompactNumber(video.views_count)} views
          </span>
        )}
        {video.likes_count !== undefined && video.likes_count > 0 && (
          <span className="flex items-center gap-1.5 text-red-400">
            <Heart className="w-4 h-4 fill-current" />
            {formatCompactNumber(video.likes_count)}
          </span>
        )}
        {video.published_at && (
          <span className="text-white/50">{formatRelativeTime(video.published_at)}</span>
        )}
      </div>

      {/* Channel Info */}
      {video.channel && (
        <Link
          href={getCreatorRoute(video.channel.handler)}
          className="inline-flex items-center gap-3 mb-4 group"
        >
          {video.channel.dp ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-red-primary/50 transition-all">
              <Image
                src={video.channel.dp}
                alt={video.channel.name || 'Channel'}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {video.channel.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-white group-hover:text-red-primary transition-colors">
              {video.channel.name}
            </p>
            {video.channel.subscribers_count !== undefined && (
              <p className="text-xs text-white/50">
                {formatCompactNumber(video.channel.subscribers_count)} subscribers
              </p>
            )}
          </div>
        </Link>
      )}

      {/* Description */}
      {description && (
        <div className="border-t border-white/10 pt-4">
          <p
            className={`text-sm text-white/70 leading-relaxed transition-all ${
              showFullDescription ? '' : 'line-clamp-3'
            }`}
          >
            {description}
          </p>
          {description.length > 200 && (
            <button
              onClick={onToggleDescription}
              className="flex items-center gap-1 mt-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFullDescription ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
      )}

      {/* Tags */}
      {video.tags && video.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {video.tags.slice(0, 6).map((tag) => (
            <span
              key={tag.id || tag.name}
              className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
