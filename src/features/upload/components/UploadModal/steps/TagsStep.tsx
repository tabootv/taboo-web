'use client';

import type { TagOption } from '@/api/client/public.client';
import { cn } from '@/shared/utils/formatting';
import { Check, Loader2, Tag } from 'lucide-react';
import { MIN_TAGS_FOR_VIDEO, SELECTED_STYLE } from '../constants';

interface TagsContentProps {
  isLoadingTags: boolean;
  tagsError: string | null;
  availableTags: TagOption[];
  selectedTags: number[];
  onTagToggle: (tagId: number) => void;
  onRetry: () => void;
}

/**
 * Tags content - displays loading, error, or tag list
 */
function TagsContent({
  isLoadingTags,
  tagsError,
  availableTags,
  selectedTags,
  onTagToggle,
  onRetry,
}: TagsContentProps): React.ReactNode {
  if (isLoadingTags) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-red-primary animate-spin" />
      </div>
    );
  }
  if (tagsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-2">{tagsError}</p>
        <button type="button" onClick={onRetry} className="text-red-primary hover:underline">
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {availableTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagToggle(tag.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              'flex items-center gap-1.5',
              isSelected
                ? SELECTED_STYLE
                : 'bg-surface border border-white/10 text-text-secondary hover:border-red-primary/40 hover:text-text-primary'
            )}
          >
            {isSelected && <Check className="w-3 h-3" />}
            {tag.name}
            {tag.count > 0 && <span className="text-xs opacity-60">({tag.count})</span>}
          </button>
        );
      })}
    </div>
  );
}

interface TagsStepProps {
  tags: number[];
  isLoadingTags: boolean;
  tagsError: string | null;
  availableTags: TagOption[];
  onTagToggle: (tagId: number) => void;
  onRetry: () => void;
}

/**
 * Tags step for selecting video tags
 */
export function TagsStep({
  tags,
  isLoadingTags,
  tagsError,
  availableTags,
  onTagToggle,
  onRetry,
}: TagsStepProps): React.ReactNode {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
        <Tag className="w-4 h-4" />
        Select Tags
        <span className="text-text-tertiary text-xs font-normal">
          ({tags.length} selected, min {MIN_TAGS_FOR_VIDEO})
        </span>
      </label>

      <TagsContent
        isLoadingTags={isLoadingTags}
        tagsError={tagsError}
        availableTags={availableTags}
        selectedTags={tags}
        onTagToggle={onTagToggle}
        onRetry={onRetry}
      />

      {tags.length < MIN_TAGS_FOR_VIDEO && (
        <p className="mt-4 text-sm text-yellow-500">
          Please select at least {MIN_TAGS_FOR_VIDEO} tags to continue
        </p>
      )}
    </div>
  );
}
