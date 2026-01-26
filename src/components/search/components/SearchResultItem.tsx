/**
 * Individual search result item component
 */

import Image from 'next/image';
import { Film, Play, BookOpen, Users } from 'lucide-react';
import { cn } from '@/shared/utils/formatting';
import { highlightMatch } from '@/shared/utils/highlightMatch';
import { formatCompactNumber } from '@/shared/utils/formatting';
import type { Video, Series, Creator } from '@/types';

type ResultItem =
  | { type: 'video'; data: Video }
  | { type: 'short'; data: Video }
  | { type: 'series'; data: Series }
  | { type: 'creator'; data: Creator };

interface SearchResultItemProps {
  item: ResultItem;
  query: string;
  index: number;
  selectedIndex: number;
  onClick: () => void;
}

export function SearchResultItem({
  item,
  query,
  index,
  selectedIndex,
  onClick,
}: SearchResultItemProps) {
  const isSelected = selectedIndex === index;

  if (item.type === 'video') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
          isSelected ? 'bg-surface' : 'hover:bg-surface/50'
        )}
      >
        <div className="relative w-16 h-10 rounded overflow-hidden bg-black flex-shrink-0">
          {(item.data.thumbnail || item.data.thumbnail_webp) && (
            <Image
              src={item.data.thumbnail_webp || item.data.thumbnail || ''}
              alt={item.data.title}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-text-primary truncate">{highlightMatch(item.data.title, query)}</p>
          <p className="text-sm text-text-secondary truncate">{item.data.channel?.name}</p>
        </div>
        <Film className="w-4 h-4 text-text-secondary flex-shrink-0" />
      </button>
    );
  }

  if (item.type === 'short') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
          isSelected ? 'bg-surface' : 'hover:bg-surface/50'
        )}
      >
        <div className="relative w-8 h-14 rounded overflow-hidden bg-black flex-shrink-0">
          {(item.data.thumbnail || item.data.thumbnail_webp) && (
            <Image
              src={item.data.thumbnail_webp || item.data.thumbnail || ''}
              alt={item.data.title}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-text-primary truncate">{highlightMatch(item.data.title, query)}</p>
          <p className="text-sm text-text-secondary">Short</p>
        </div>
        <Play className="w-4 h-4 text-text-secondary flex-shrink-0" />
      </button>
    );
  }

  if (item.type === 'series') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
          isSelected ? 'bg-surface' : 'hover:bg-surface/50'
        )}
      >
        <div className="relative w-16 h-10 rounded overflow-hidden bg-black flex-shrink-0">
          {item.data.thumbnail && (
            <Image src={item.data.thumbnail} alt={item.data.title} fill className="object-cover" />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-text-primary truncate">{highlightMatch(item.data.title, query)}</p>
          <p className="text-sm text-text-secondary">{item.data.videos_count} episodes</p>
        </div>
        <BookOpen className="w-4 h-4 text-text-secondary flex-shrink-0" />
      </button>
    );
  }

  if (item.type === 'creator') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
          isSelected ? 'bg-surface' : 'hover:bg-surface/50'
        )}
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface flex-shrink-0">
          {item.data.dp && (
            <Image src={item.data.dp} alt={item.data.name} fill className="object-cover" />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-text-primary truncate">{highlightMatch(item.data.name, query)}</p>
          <p className="text-sm text-text-secondary">
            {formatCompactNumber(item.data.subscribers_count ?? 0)} subscribers
          </p>
        </div>
        <Users className="w-4 h-4 text-text-secondary flex-shrink-0" />
      </button>
    );
  }

  return null;
}
