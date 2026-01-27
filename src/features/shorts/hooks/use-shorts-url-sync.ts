'use client';

import type { Video } from '@/types';
import { useEffect, useRef } from 'react';

export interface UseShortsUrlSyncOptions {
  /** Array of shorts */
  shorts: Video[];
  /** Current visible index */
  currentIndex: number;
  /** Whether URL sync is enabled */
  enabled: boolean;
}

/**
 * Simplified URL synchronization for shorts feed.
 * Uses History API for fast updates without Next.js router overhead.
 *
 * Features:
 * - Updates URL when currentIndex changes
 * - Handles browser back/forward via popstate
 * - Emits 'shorts:navigate' event for external navigation
 */
export function useShortsUrlSync({ shorts, currentIndex, enabled }: UseShortsUrlSyncOptions) {
  const previousUuidRef = useRef<string | null>(null);

  // Update URL when index changes
  useEffect(() => {
    if (!enabled || shorts.length === 0) return;

    const currentUuid = shorts[currentIndex]?.uuid;
    if (currentUuid && currentUuid !== previousUuidRef.current) {
      window.history.replaceState(
        { shortIndex: currentIndex, shortUuid: currentUuid },
        '',
        `/shorts/${currentUuid}`
      );
      previousUuidRef.current = currentUuid;
    }
  }, [currentIndex, shorts, enabled]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.shortIndex !== undefined) {
        // Emit custom event for useVerticalFeed to handle
        window.dispatchEvent(
          new CustomEvent('shorts:navigate', {
            detail: { index: event.state.shortIndex },
          })
        );
      } else if (event.state?.shortUuid) {
        // Find index by UUID if index not in state
        const index = shorts.findIndex((s) => s.uuid === event.state.shortUuid);
        if (index !== -1) {
          window.dispatchEvent(
            new CustomEvent('shorts:navigate', {
              detail: { index },
            })
          );
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [shorts]);
}
