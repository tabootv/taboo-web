'use client';

import { cn } from '@/shared/utils/formatting';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  STATUS_OPTIONS,
  SORT_OPTIONS,
  type ContentFilters,
  type VideoStatusFilter,
  type VideoSortOption,
} from '../../content/_types/filters';

interface ContentFilterBarProps {
  filters: ContentFilters;
  onFilterChange: (updates: Partial<ContentFilters>) => void;
}

export function ContentFilterBar({ filters, onFilterChange }: ContentFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      {/* Status chips */}
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onFilterChange({ status: opt.id as VideoStatusFilter })}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm transition-colors',
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
