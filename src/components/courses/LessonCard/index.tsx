'use client';

import { usePrefetch } from '@/lib/hooks/use-prefetch';
import { formatDuration } from '@/lib/utils';
import type { Channel, Video } from '@/types';
import { Clock, GraduationCap, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LessonCardProps {
  video: Video;
  lessonNumber: number;
  courseId: string;
  channel?: Channel;
}

export function LessonCard({ video, lessonNumber, courseId, channel }: LessonCardProps) {
  const { prefetchRoute } = usePrefetch();
  const href = `/courses/${courseId}/play/${video.uuid}`;

  // Try multiple thumbnail sources - API might return in different fields
  const thumbnail = video.thumbnail_webp || video.thumbnail || video.card_thumbnail || (video as Video & { poster?: string }).poster;

  return (
    <Link
      href={href}
      prefetch={true}
      onMouseEnter={() => prefetchRoute(href)}
      className="group block"
    >
      <div className="relative bg-surface/40 rounded-xl overflow-hidden transition-all duration-300 hover:bg-surface/70 hover:ring-1 hover:ring-red-primary/30 hover:shadow-xl hover:shadow-red-primary/5">
        <div className="flex flex-col sm:flex-row">
          <div className="hidden sm:flex items-center justify-center w-16 bg-surface/50 border-r border-white/5">
            <span className="text-2xl font-bold text-white/30 group-hover:text-red-primary transition-colors">
              {String(lessonNumber).padStart(2, '0')}
            </span>
          </div>

          <div className="relative w-full sm:w-48 aspect-video sm:aspect-auto sm:h-28 flex-shrink-0 overflow-hidden">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={video.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-surface to-background flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white/20" />
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-red-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-lg">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
            </div>

            {video.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-xs font-medium text-white">
                {formatDuration(video.duration)}
              </div>
            )}

            <div className="sm:hidden absolute top-2 left-2 px-2 py-1 bg-red-primary/90 backdrop-blur-sm rounded text-xs font-bold text-white">
              LESSON {lessonNumber}
            </div>
          </div>

          <div className="flex-1 p-3 sm:py-2.5 sm:px-4 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-red-primary/10 text-red-primary text-xs font-semibold rounded">
                    LESSON {lessonNumber}
                  </span>
                </div>
                <h3 className="text-white font-semibold line-clamp-1 group-hover:text-red-primary transition-colors text-base">
                  {video.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-white/40 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration || 0)}
                  </span>
                  {(video.channel?.name || channel?.name) && (
                    <>
                      <span>•</span>
                      <span className="truncate">
                        {video.channel?.name || channel?.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-white/40 group-hover:text-red-primary transition-colors">
                <span className="text-sm font-medium">Watch</span>
                <Play className="w-4 h-4 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
