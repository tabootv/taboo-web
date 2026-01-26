'use client';

import { Button } from '@/components/ui/button';
import { cn, formatDuration } from '@/shared/utils/formatting';
import type { Video } from '@/types';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface UpNextOverlayProps {
  nextVideo: Video;
  countdown: number;
  onCancel: () => void;
  onPlayNow: () => void;
}

export function UpNextOverlay({ nextVideo, countdown, onCancel, onPlayNow }: UpNextOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-40 bg-black/80 backdrop-blur-sm',
        'flex flex-col items-center justify-center',
        'animate-in fade-in slide-in-from-bottom-4 duration-300'
      )}
    >
      <div className="flex flex-col items-center gap-6 max-w-sm px-4">
        {/* Countdown text */}
        <div className="text-center">
          <p className="text-white/70 text-sm mb-1">Up next in</p>
          <div className="relative w-16 h-16 mx-auto">
            {/* Circular progress */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/20"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-red-primary transition-all duration-1000 ease-linear"
                strokeDasharray={175.93}
                strokeDashoffset={175.93 * (1 - countdown / 5)}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
              {countdown}
            </span>
          </div>
        </div>

        {/* Next video card */}
        <div className="flex gap-3 p-3 rounded-xl bg-surface/90 w-full">
          <div className="relative w-[140px] h-[79px] shrink-0 rounded-lg overflow-hidden bg-surface">
            {nextVideo.thumbnail ? (
              <Image
                src={nextVideo.thumbnail_webp || nextVideo.thumbnail}
                alt={nextVideo.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-surface to-background" />
            )}
            {nextVideo.duration && (
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-medium text-white">
                {formatDuration(nextVideo.duration)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <p className="text-sm font-medium line-clamp-2 text-white leading-tight">
              {nextVideo.title}
            </p>
            {nextVideo.channel?.name && (
              <p className="text-xs text-white/50 mt-1">{nextVideo.channel.name}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <Button
            variant="secondary"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-red-primary hover:bg-red-primary/90 text-white"
            onClick={onPlayNow}
          >
            <Play className="w-4 h-4 fill-current" />
            Play Now
          </Button>
        </div>
      </div>
    </div>
  );
}
