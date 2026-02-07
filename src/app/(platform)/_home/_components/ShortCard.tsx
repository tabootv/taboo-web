/**
 * Individual short card component - simplified without video preview
 */

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import type { Video } from '@/types';

interface ShortCardProps {
  video: Video;
  index: number;
}

export function ShortCard({ video, index }: ShortCardProps) {
  const thumbnail = video.thumbnail || video.thumbnail_webp || video.card_thumbnail;

  return (
    <Link
      href={`/shorts/${video.uuid}`}
      className="flex-shrink-0 w-[130px] sm:w-[160px] md:w-[190px] group relative rounded-lg overflow-hidden cursor-pointer short-hover active:scale-[0.97] transition-transform"
    >
      <div className="relative aspect-[9/16]">
        {/* Thumbnail */}
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={video.title || 'Short video'}
            fill
            className="object-cover"
            priority={index < 6}
            sizes="(max-width: 640px) 130px, (max-width: 768px) 160px, 190px"
          />
        )}

        {/* Play icon overlay on hover/active */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
          <div className="p-2.5 sm:p-3 bg-red-primary rounded-full transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* Border on hover */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ring-2 ring-red-primary/60" />

        {/* Title at bottom */}
        {video.title && (
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
            <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 drop-shadow-lg">
              {video.title}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
