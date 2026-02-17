'use client';

import { cn } from '@/shared/utils/formatting';
import { AlertTriangle } from 'lucide-react';

interface ContentRatingStepProps {
  isAdultContent: boolean;
  onToggle: () => void;
}

/**
 * Content rating step for marking age-restricted content
 */
export function ContentRatingStep({ isAdultContent, onToggle }: ContentRatingStepProps) {
  return (
    <div>
      <label className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:border-red-primary/40 cursor-pointer transition-all">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'relative w-12 h-6 rounded-full shrink-0 mt-0.5 transition-colors',
            isAdultContent ? 'bg-red-primary' : 'bg-white/20'
          )}
          aria-label={isAdultContent ? 'Disable adult content' : 'Enable adult content'}
        >
          <span
            className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              isAdultContent ? 'left-7' : 'left-1'
            )}
          />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <p className="text-text-primary font-medium">Age-restricted content (18+)</p>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Mark this video as not suitable for younger audiences. This content will require age
            verification before viewing.
          </p>
        </div>
      </label>

      <div className="mt-6 p-4 rounded-xl bg-white/5">
        <h3 className="text-sm font-medium text-text-primary mb-2">
          When to mark as age-restricted:
        </h3>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
          <li>Content with explicit language or themes</li>
          <li>Violence or graphic content</li>
          <li>Adult-oriented discussions or topics</li>
          <li>Content not suitable for minors</li>
        </ul>
      </div>
    </div>
  );
}
