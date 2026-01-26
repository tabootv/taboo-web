/**
 * Top result preview component (desktop only)
 */

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { formatDuration, getSeriesRoute } from '@/shared/utils/formatting';
import type { Video, Series } from '@/types';

interface TopResultPreviewProps {
  result: Video | Series;
  onClose: () => void;
}

export function TopResultPreview({ result, onClose }: TopResultPreviewProps) {
  const href =
    'videos_count' in result ? getSeriesRoute(result.id, result.title) : `/videos/${result.id}`;

  const thumbnail = ('thumbnail_webp' in result && result.thumbnail_webp) || result.thumbnail || '';

  return (
    <div className="hidden lg:block w-80 flex-shrink-0">
      <h3 className="text-sm font-medium text-text-secondary mb-3">Top Result</h3>
      <Link href={href} onClick={onClose} className="block group">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-surface">
          {thumbnail && (
            <Image
              src={thumbnail}
              alt={result.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-8 h-8 text-black fill-black ml-1" />
            </div>
          </div>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h4 className="font-bold text-white text-lg line-clamp-2">{result.title}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
              {'channel' in result && result.channel?.name && <span>{result.channel.name}</span>}
              {'videos_count' in result && <span>{result.videos_count} episodes</span>}
              {'duration' in result && result.duration && (
                <span>{formatDuration(result.duration)}</span>
              )}
            </div>
          </div>
        </div>
        {'description' in result && result.description && (
          <p className="text-sm text-text-secondary mt-3 line-clamp-2">{result.description}</p>
        )}
      </Link>
    </div>
  );
}
