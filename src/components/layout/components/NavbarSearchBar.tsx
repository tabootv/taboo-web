/**
 * Search bar component for navbar
 */

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarSearchBarProps {
  isSearchExpanded: boolean;
  searchQuery: string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggle: () => void;
  onClose: () => void;
}

export function NavbarSearchBar({
  isSearchExpanded,
  searchQuery,
  searchInputRef,
  onQueryChange,
  onSubmit,
  onToggle,
  onClose,
}: NavbarSearchBarProps) {
  return (
    <div
      className={cn(
        'flex items-center transition-all duration-300',
        isSearchExpanded ? 'flex-1 max-w-2xl' : 'w-auto'
      )}
    >
      <form onSubmit={onSubmit} className="flex-1">
        <div
          className={cn(
            'flex items-center transition-all duration-300',
            isSearchExpanded
              ? 'bg-surface border border-border rounded-full'
              : 'bg-transparent border-transparent'
          )}
        >
          {isSearchExpanded && (
            <div className="pl-4">
              <Search className="w-5 h-5 text-text-secondary" />
            </div>
          )}
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search..."
            className={cn(
              'transition-all duration-300 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none',
              isSearchExpanded
                ? 'flex-1 px-3 py-2 bg-transparent'
                : 'w-0 opacity-0 overflow-hidden'
            )}
          />
        </div>
      </form>

      {/* Toggle Button */}
      <button
        onClick={isSearchExpanded ? onClose : onToggle}
        className={cn(
          'p-2 rounded-full transition-colors border border-border',
          isSearchExpanded
            ? 'bg-red-primary/10 text-red-primary hover:bg-red-primary/20'
            : 'bg-transparent text-text-secondary hover:bg-hover hover:text-text-primary'
        )}
        aria-label={isSearchExpanded ? 'Collapse search' : 'Expand search'}
      >
        {isSearchExpanded ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </button>
    </div>
  );
}

