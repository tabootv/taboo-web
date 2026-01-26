/**
 * Recent searches list component for mobile search
 */

import { Clock, X } from 'lucide-react';

interface RecentSearch {
  query: string;
  timestamp: number;
}

interface MobileRecentSearchesProps {
  recentSearches: RecentSearch[];
  onItemClick: (query: string) => void;
  onRemove: (e: React.MouseEvent, query: string) => void;
}

export function MobileRecentSearches({
  recentSearches,
  onItemClick,
  onRemove,
}: MobileRecentSearchesProps) {
  if (recentSearches.length === 0) return null;

  return (
    <div className="p-4">
      <p className="px-2 py-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
        Recent Searches
      </p>
      {recentSearches.map((search) => (
        <button
          key={search.query}
          onClick={() => onItemClick(search.query)}
          className="w-full flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-hover transition-colors group"
        >
          <Clock className="w-5 h-5 text-text-secondary flex-shrink-0" />
          <span className="flex-1 text-left text-text-primary truncate">{search.query}</span>
          <button
            onClick={(e) => onRemove(e, search.query)}
            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-surface rounded-full transition-all"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </button>
      ))}
    </div>
  );
}
