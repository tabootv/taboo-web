'use client';

import { useToggleShortLike } from '@/api/mutations/shorts.mutations';
import { useShortsStore } from '@/shared/stores/shorts-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export interface UseShortsKeyboardOptions {
  /** Current short UUID for like action */
  currentUuid: string | undefined;
  /** Navigate to next short */
  goToNext: () => void;
  /** Navigate to previous short */
  goToPrevious: () => void;
  /** Whether keyboard shortcuts are enabled */
  enabled?: boolean;
}

/**
 * Keyboard shortcuts for shorts feed.
 *
 * Shortcuts:
 * - M: Toggle mute
 * - L: Toggle like
 * - ArrowDown / J: Next short
 * - ArrowUp / K: Previous short
 * - Escape: Go to home
 */
export function useShortsKeyboard({
  currentUuid,
  goToNext,
  goToPrevious,
  enabled = true,
}: UseShortsKeyboardOptions) {
  const { toggleMute } = useShortsStore();
  const toggleLike = useToggleShortLike();
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault();
          toggleMute();
          break;

        case 'l':
          e.preventDefault();
          if (currentUuid) {
            toggleLike.mutate(currentUuid, {
              onError: () => toast.error('Please login to like'),
            });
          }
          break;

        case 'arrowdown':
        case 'j':
          e.preventDefault();
          goToNext();
          break;

        case 'arrowup':
        case 'k':
          e.preventDefault();
          goToPrevious();
          break;

        case 'escape':
          e.preventDefault();
          router.push('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUuid, goToNext, goToPrevious, toggleMute, toggleLike, router, enabled]);
}
