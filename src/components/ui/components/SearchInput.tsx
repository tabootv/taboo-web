/**
 * Search input field component with debounce
 */

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/shared/utils/formatting';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  query: string;
  isLoading: boolean;
  isFocused: boolean;
  showDropdown: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClear: () => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
}

export function SearchInput({
  query,
  isLoading,
  isFocused,
  showDropdown,
  inputRef,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onClear,
  onSubmit,
  placeholder = 'Search',
}: SearchInputProps) {
  return (
    <form onSubmit={onSubmit}>
      <div
        className={cn(
          'flex items-center bg-surface border rounded-full overflow-hidden transition-all',
          isFocused ? 'border-red-primary ring-1 ring-red-primary/20' : 'border-border',
          showDropdown && 'rounded-b-none border-b-transparent'
        )}
      >
        <div className="pl-4 pr-2">
          <Search className="w-5 h-5 text-text-secondary" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 py-2.5 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
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
        <button
          type="submit"
          className="px-4 py-2.5 bg-hover border-l border-border hover:bg-surface-hover transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </form>
  );
}
