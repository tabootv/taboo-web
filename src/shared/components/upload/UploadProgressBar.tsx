'use client';

import { cn } from '@/shared/utils/formatting';
import type { UploadPhase } from '@/shared/stores/upload-store';

interface UploadProgressBarProps {
  phase: UploadPhase;
  progress: number;
  isPaused: boolean;
  isStale?: boolean;
  className?: string;
  /** Height of the progress bar. Defaults to 'md' */
  size?: 'sm' | 'md';
}

/**
 * Shared progress bar component for upload UI consistency.
 * Used by both UploadModal and GlobalUploadIndicator.
 */
export function UploadProgressBar({
  phase,
  progress,
  isPaused,
  isStale = false,
  className,
  size = 'md',
}: UploadProgressBarProps) {
  const getBarColor = () => {
    if (phase === 'error') return 'bg-red-500';
    if (phase === 'complete') return 'bg-green-500';
    if (isStale) return 'bg-orange-500';
    if (isPaused) return 'bg-yellow-500';
    return 'bg-red-primary';
  };

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={cn(heightClass, 'bg-white/10 rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', getBarColor())}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
