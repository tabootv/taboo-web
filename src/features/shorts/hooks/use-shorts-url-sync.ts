/**
 * useShortsUrlSync Hook
 *
 * Manages bidirectional synchronization between Swiper state and URL.
 * Uses a state machine to prevent race conditions and infinite loops.
 *
 * State Machine:
 * - 'loading': Initial state, URL changes and Swiper events are ignored
 * - 'ready': Data loaded, waiting to enable sync
 * - 'syncing': Active state, Swiper changes update URL
 *
 * Transitions:
 * - loading → ready: When shorts are loaded AND Swiper is initialized
 * - ready → syncing: After requestAnimationFrame delay
 * - syncing → loading: When navigating to different UUID (external)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import type { ShortVideo } from '@/api/types';

type SyncState = 'loading' | 'ready' | 'syncing';

interface UseShortsUrlSyncOptions {
  /** List of shorts in the feed */
  shorts: ShortVideo[];
  /** Initial UUID from URL (for deep linking) */
  initialUuid: string;
  /** Initial index of the short in the list */
  initialIndex: number;
  /** Whether shorts data is still loading */
  isLoading: boolean;
}

interface UseShortsUrlSyncReturn {
  /** Current sync state machine state */
  syncState: SyncState;
  /** Current video index */
  currentIndex: number;
  /** Current video UUID */
  currentUuid: string | undefined;
  /** Whether sync is ready (loading complete) */
  isReady: boolean;
  /** Handler for Swiper initialization */
  handleSwiperInit: (swiper: SwiperType) => void;
  /** Handler for Swiper slide changes */
  handleSlideChange: (swiper: SwiperType) => void;
  /** Ref to the Swiper instance */
  swiperRef: React.MutableRefObject<SwiperType | null>;
}

/**
 * Hook to synchronize Swiper state with URL
 */
export function useShortsUrlSync(options: UseShortsUrlSyncOptions): UseShortsUrlSyncReturn {
  const { shorts, initialUuid, initialIndex, isLoading } = options;

  // State machine
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refs
  const swiperRef = useRef<SwiperType | null>(null);
  const previousUuidRef = useRef<string>(initialUuid);
  const initializationCompleteRef = useRef(false);

  // Current video UUID based on index
  const currentUuid = shorts[currentIndex]?.uuid;

  // Handle external UUID change (navigation from outside)
  useEffect(() => {
    // Detect if URL UUID changed externally (e.g., browser back/forward)
    if (
      syncState === 'syncing' &&
      initialUuid !== previousUuidRef.current &&
      shorts.length > 0
    ) {
      // Find the new index
      const newIndex = shorts.findIndex((s) => s.uuid === initialUuid);
      if (newIndex >= 0 && newIndex !== currentIndex) {
        // External navigation - update Swiper position
        swiperRef.current?.slideTo(newIndex, 0, false);
        setCurrentIndex(newIndex);
      }
      previousUuidRef.current = initialUuid;
    }
  }, [initialUuid, syncState, shorts, currentIndex]);

  // Transition: loading → ready
  // When shorts are loaded and Swiper is initialized
  useEffect(() => {
    if (
      syncState === 'loading' &&
      !isLoading &&
      shorts.length > 0 &&
      swiperRef.current &&
      !initializationCompleteRef.current
    ) {
      // Mark initialization as complete to prevent re-running
      initializationCompleteRef.current = true;

      // Set Swiper to initial position WITHOUT triggering slide change
      swiperRef.current.slideTo(initialIndex, 0, false);
      setCurrentIndex(initialIndex);
      previousUuidRef.current = shorts[initialIndex]?.uuid || initialUuid;

      // Transition to ready
      setSyncState('ready');
    }
  }, [syncState, isLoading, shorts, initialIndex, initialUuid]);

  // Transition: ready → syncing
  // Use requestAnimationFrame to ensure one render cycle has completed
  useEffect(() => {
    if (syncState === 'ready') {
      const frameId = requestAnimationFrame(() => {
        setSyncState('syncing');
      });
      return () => cancelAnimationFrame(frameId);
    }
    return undefined;
  }, [syncState]);

  // Handle Swiper initialization
  const handleSwiperInit = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
  }, []);

  // Handle slide changes from Swiper
  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      // Only process in 'syncing' state to prevent race conditions
      if (syncState !== 'syncing') {
        return;
      }

      const newIndex = swiper.activeIndex;
      const newShort = shorts[newIndex];

      if (!newShort) {
        return;
      }

      // Update local state
      setCurrentIndex(newIndex);

      // Update URL using History API (faster than Next.js router)
      if (newShort.uuid !== previousUuidRef.current) {
        const newUrl = `/shorts/${newShort.uuid}`;
        window.history.replaceState(
          { shortIndex: newIndex, shortUuid: newShort.uuid },
          '',
          newUrl
        );
        previousUuidRef.current = newShort.uuid;
      }
    },
    [syncState, shorts]
  );

  // Reset sync state when loading changes (new navigation)
  useEffect(() => {
    if (isLoading && syncState !== 'loading') {
      setSyncState('loading');
      initializationCompleteRef.current = false;
    }
  }, [isLoading, syncState]);

  return {
    syncState,
    currentIndex,
    currentUuid,
    isReady: syncState !== 'loading',
    handleSwiperInit,
    handleSlideChange,
    swiperRef,
  };
}
