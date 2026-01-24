import { cn, formatDuration } from '@/lib/utils';
import type { Video } from '@/types';
import { Lock, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LessonCardPlayerProps {
  video: Video;
  lessonNumber: number;
  isCurrent: boolean;
  courseId: string;
  hasAccess: boolean;
}

export function LessonCardPlayer({
  video,
  lessonNumber,
  isCurrent,
  courseId,
  hasAccess,
}: LessonCardPlayerProps) {
  const isLocked = !hasAccess && !video.is_free;
  const href = isLocked ? '#' : `/courses/${courseId}/play/${video.uuid}`;

  const handleClick = isLocked
    ? (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault()
    : undefined;

  return (
    <Link
      href={href}
      {...(handleClick && { onClick: handleClick })}
      className={isLocked ? 'cursor-not-allowed' : ''}
    >
      <div
        className={cn(
          'group flex gap-3 p-2 rounded-xl transition-all',
          isLocked ? 'opacity-50' : 'hover:ring-1 hover:ring-red-primary/50 hover:shadow-[0_0_15px_rgba(171,0,19,0.3)]'
        )}
      >
        <div className="relative w-[140px] h-[79px] shrink-0 rounded-lg overflow-hidden bg-surface">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail_webp || video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-surface to-background" />
          )}

          {isLocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Lock className="w-5 h-5 text-white/70" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all shadow-lg">
                <Play className="w-4 h-4 text-black fill-black ml-0.5" />
              </div>
            </div>
          )}

          {video.duration && (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-medium text-white">
              {formatDuration(video.duration)}
            </div>
          )}

          {isCurrent && (
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-primary animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'inline-block text-[10px] font-bold px-1.5 py-0.5 rounded',
                isCurrent ? 'bg-red-primary text-white' : 'bg-surface text-white/70'
              )}
            >
              LESSON {lessonNumber}
            </span>
            {video.is_free && !hasAccess && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                FREE
              </span>
            )}
          </div>

          <p
            className={cn(
              'text-sm font-medium leading-tight',
              isCurrent ? 'text-white' : 'text-white/80 group-hover:text-white'
            )}
          >
            {video.title}
          </p>

          {video.channel?.name && (
            <p className="text-xs text-white/40 mt-1">
              {video.channel.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
