/**
 * Recent searches list component
 */

import { Clock, X } from 'lucide-react';
import { cn } from '@/shared/utils/formatting';

interface RecentSearchesProps {
  searches: string[];
  selectedIndex: number;
  onSearchClick: (query: string) => void;
  onRemove: (e: React.MouseEvent, query: string) => void;
}

export function RecentSearches({
  searches,
  selectedIndex,
  onSearchClick,
  onRemove,
}: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
        <Clock className="w-4 h-4" />
        Recent Searches
      </h3>
      <div className="space-y-1">
        {searches.map((search, index) => (
          <button
            key={search}
            onClick={() => onSearchClick(search)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group',
              selectedIndex === index ? 'bg-surface' : 'hover:bg-surface/50'
            )}
          >
            <Clock className="w-4 h-4 text-text-secondary flex-shrink-0" />
            <span className="flex-1 text-left text-text-primary">{search}</span>
            <button
              onClick={(e) => onRemove(e, search)}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-hover rounded transition-all"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}
