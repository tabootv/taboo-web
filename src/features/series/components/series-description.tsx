'use client';

import { cn } from '@/shared/utils/formatting';

interface SeriesDescriptionProps {
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
  shouldTruncate: boolean;
}

export function SeriesDescription({
  description,
  isExpanded,
  onToggle,
  shouldTruncate,
}: SeriesDescriptionProps) {
  return (
    <button
      type="button"
      className="mt-4 w-full text-left bg-surface/50 hover:bg-surface/70 rounded-xl p-4 transition-colors"
      onClick={onToggle}
    >
      <p
        className={cn(
          'text-sm text-white/80 whitespace-pre-wrap leading-relaxed',
          !isExpanded && shouldTruncate && 'line-clamp-2'
        )}
      >
        {description}
      </p>
      {shouldTruncate && (
        <span className="block text-sm font-medium text-white/60 hover:text-white mt-2">
          {isExpanded ? 'Show less' : 'Show more'}
        </span>
      )}
    </button>
  );
}

