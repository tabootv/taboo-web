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
  /** Initial UUID from deep link (for validation) */
  initialUuid?: string | undefined;
}

/**
 * Simplified URL synchronization for shorts feed.
 * Uses History API for fast updates without Next.js router overhead.
 *
 * Features:
 * - Updates URL when currentIndex changes
 * - Handles browser back/forward via popstate
 * - Emits 'shorts:navigate' event for external navigation
 * - Skips first update if already on correct deep link path
 */
export function useShortsUrlSync({
  shorts,
  currentIndex,
  enabled,
  initialUuid,
}: UseShortsUrlSyncOptions) {
  const previousUuidRef = useRef<string | null>(null);
  const isFirstUpdateRef = useRef(true);
  const prevInitialUuidRef = useRef(initialUuid);

  // Reset refs when initialUuid changes (for navigation between deep links)
  useEffect(() => {
    if (prevInitialUuidRef.current !== initialUuid) {
      isFirstUpdateRef.current = true;
      previousUuidRef.current = null;
      prevInitialUuidRef.current = initialUuid;
    }
  }, [initialUuid]);

  // Update URL when index changes
  useEffect(() => {
    if (!enabled || shorts.length === 0) return;

    const currentUuid = shorts[currentIndex]?.uuid;

    // Safety guard: if we're supposed to show a specific initial short but it's not at position 0,
    // don't update the URL - the merge hasn't completed correctly yet
    if (initialUuid && currentIndex === 0 && shorts[0]?.uuid !== initialUuid) {
      return;
    }

    if (currentUuid && currentUuid !== previousUuidRef.current) {
      // On first update, check if URL already matches the current short
      // This prevents overwriting the deep link URL during initial load
      if (isFirstUpdateRef.current) {
        isFirstUpdateRef.current = false;
        const currentPath = window.location.pathname;
        if (currentPath === `/shorts/${currentUuid}`) {
          // URL already correct, just update refs without changing URL
          previousUuidRef.current = currentUuid;
          return;
        }
      }

      window.history.replaceState(
        { shortIndex: currentIndex, shortUuid: currentUuid },
        '',
        `/shorts/${currentUuid}`
      );
      previousUuidRef.current = currentUuid;
    }
  }, [currentIndex, shorts, enabled, initialUuid]);

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
