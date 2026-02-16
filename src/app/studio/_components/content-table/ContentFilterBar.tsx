'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/shared/utils/formatting';
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type ContentFilters,
  type VideoSortOption,
  type VideoStatusFilter,
} from '../../content/_types/filters';

interface ContentFilterBarProps {
  filters: ContentFilters;
  onFilterChange: (updates: Partial<ContentFilters>) => void;
}

export function ContentFilterBar({ filters, onFilterChange }: ContentFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-8">
      {/* Status chips */}
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onFilterChange({ status: opt.id as VideoStatusFilter })}
            className={cn(
              'px-4 py-2 rounded-full text-sm transition-colors',
              filters.status === opt.id
                ? 'bg-white/10 text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-white/5'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <Select
        value={filters.sortBy}
        onValueChange={(v: VideoSortOption) => onFilterChange({ sortBy: v })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
