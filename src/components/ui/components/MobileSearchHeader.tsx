/**
 * Header component for mobile search modal
 */

import { Search, X, ArrowLeft } from 'lucide-react';
import { Spinner } from '../spinner';

interface MobileSearchHeaderProps {
  query: string;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function MobileSearchHeader({
  query,
  isLoading,
  inputRef,
  onQueryChange,
  onClear,
  onSubmit,
  onClose,
}: MobileSearchHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-2 h-14 border-b border-border">
      <button
        onClick={onClose}
        className="p-2 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <form onSubmit={onSubmit} className="flex-1">
        <div className="flex items-center bg-surface border border-border rounded-full">
          <div className="pl-4">
            <Search className="w-5 h-5 text-text-secondary" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search TabooTV"
            className="flex-1 px-3 py-2.5 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
          {isLoading && (
            <div className="pr-2">
              <Spinner size="sm" />
            </div>
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={onClear}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

