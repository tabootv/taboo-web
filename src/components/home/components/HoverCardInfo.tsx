/**
 * Info panel component for hover card (expanded state)
 */

import Image from 'next/image';
import { Play, Plus, Check, ChevronDown } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import type { Video } from '@/types';

interface HoverCardInfoProps {
  video: Video;
  isNew: boolean;
  description: string;
  saved: boolean;
  showFullDescription: boolean;
  onPlay: (e: React.MouseEvent) => void;
  onSave: (e: React.MouseEvent) => void;
  onToggleDescription: (e: React.MouseEvent) => void;
}

export function HoverCardInfo({
  video,
  isNew,
  description,
  saved,
  showFullDescription,
  onPlay,
  onSave,
  onToggleDescription,
}: HoverCardInfoProps) {
  return (
    <div className="netflix-card-info bg-surface rounded-b-lg p-3 shadow-lg border-t-0">
      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={onPlay}
          className="netflix-action-btn-primary p-2 rounded-full bg-white hover:bg-white/90 transition-all hover:scale-110"
          title="Play"
        >
          <Play className="w-4 h-4 text-black" fill="black" />
        </button>
        <button
          onClick={onSave}
          className={`netflix-action-btn p-2 rounded-full border transition-all hover:scale-110 ${
            saved
              ? 'bg-white/20 border-white text-white'
              : 'bg-surface/80 border-white/40 hover:border-white text-white'
          }`}
          title={saved ? 'Remove from My List' : 'Add to My List'}
        >
          {saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onToggleDescription}
          className={`netflix-action-btn p-2 rounded-full border transition-all hover:scale-110 ml-auto ${
            showFullDescription
              ? 'bg-white/20 border-white'
              : 'bg-surface/80 border-white/40 hover:border-white'
          }`}
          title="More Info"
        >
          <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${showFullDescription ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Video meta info */}
      <div className="flex items-center gap-2 text-[10px] mb-1.5 flex-wrap">
        {isNew && (
          <span className="text-green-400 font-semibold">New</span>
        )}
        {video.duration && (
          <span className="text-white/70">{formatDuration(video.duration)}</span>
        )}
        {video.views_count !== undefined && (
          <span className="text-white/70">{video.views_count.toLocaleString()} views</span>
        )}
        {video.likes_count !== undefined && video.likes_count > 0 && (
          <span className="text-red-400">♥ {video.likes_count.toLocaleString()}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-white text-[12px] line-clamp-1 mb-1">
        {video.title}
      </h3>

      {/* Description - Netflix Style */}
      <p className={`text-[10px] text-white/70 leading-relaxed mb-2 transition-all duration-200 ${
        showFullDescription ? 'line-clamp-none max-h-24 overflow-y-auto' : 'line-clamp-2'
      }`}>
        {description}
      </p>

      {/* Channel info */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
        {video.channel?.dp ? (
          <div className="relative w-4 h-4 rounded-full overflow-hidden ring-1 ring-white/20">
            <Image src={video.channel.dp} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">
              {video.channel?.name?.charAt(0) || '?'}
            </span>
          </div>
        )}
        <p className="text-[10px] text-white/60 truncate flex-1">
          {video.channel?.name}
        </p>
      </div>

      {/* Tags if available */}
      {video.tags && video.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {video.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id || tag.name}
              className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded text-white/60"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

