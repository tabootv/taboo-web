'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_DEBOUNCE_MS = 800;
const DEFAULT_TOUCH_THRESHOLD = 50;
const WHEEL_DELTA_THRESHOLD = 10;

export interface UseVerticalFeedOptions {
  /** Total number of items in feed */
  itemCount: number;
  /** Initial index to start at (for deep linking) */
  initialIndex?: number;
  /** Debounce time in ms for scroll transitions (default: 800) */
  debounceMs?: number;
  /** Touch swipe threshold in pixels (default: 50) */
  touchThreshold?: number;
  /** Callback when index changes */
  onIndexChange?: (index: number) => void;
}

export type SlideClass = 'active' | 'prev' | 'next' | 'hidden';

export interface UseVerticalFeedReturn {
  /** Current visible index */
  currentIndex: number;
  /** CSS transform value for wrapper */
  transform: string;
  /** Whether currently transitioning */
  isTransitioning: boolean;
  /** Ref to attach to the container element (for native wheel listener) */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Handlers to spread on container */
  containerProps: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
  };
  /** Navigate to specific index */
  goToIndex: (index: number) => void;
  /** Navigate to next item */
  goToNext: () => void;
  /** Navigate to previous item */
  goToPrevious: () => void;
  /** Get animation class for an item */
  getSlideClass: (index: number) => SlideClass;
}

/**
 * Core vertical feed navigation hook.
 * Translated from Vue PostFeed.vue pattern - uses CSS transforms instead of Swiper.
 *
 * Features:
 * - Debounced scroll/touch navigation (800ms default)
 * - Touch gesture support with 50px threshold
 * - Wheel scroll support
 * - Smooth transitions via CSS
 */
export function useVerticalFeed({
  itemCount,
  initialIndex = 0,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  touchThreshold = DEFAULT_TOUCH_THRESHOLD,
  onIndexChange,
}: UseVerticalFeedOptions): UseVerticalFeedReturn {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs for debouncing (don't cause re-renders)
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const touchStartRef = useRef(0);
  // Container ref for native wheel event listener (passive: false)
  const containerRef = useRef<HTMLDivElement>(null);
  // Track if we've already applied the initial index (to prevent resets during fast scrolling)
  const hasAppliedInitialIndexRef = useRef(false);
  // Track the last applied initial index to detect if it actually changed
  const lastInitialIndexRef = useRef(initialIndex);

  // Fire onIndexChange via effect (not inside state updaters - React anti-pattern)
  const onIndexChangeRef = useRef<UseVerticalFeedOptions['onIndexChange']>(undefined);

  // Keep ref in sync with latest callback without updating during render
  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  }, [onIndexChange]);

  useEffect(() => {
    onIndexChangeRef.current?.(currentIndex);
  }, [currentIndex]);

  // Computed transform (from Vue computed())
  const transform = useMemo(() => `translateY(-${currentIndex * 100}%)`, [currentIndex]);

  // Navigate to specific index with bounds checking
  const goToIndex = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, itemCount - 1));
      if (clampedIndex !== currentIndex && !isScrollingRef.current) {
        isScrollingRef.current = true;
        setIsTransitioning(true);
        setCurrentIndex(clampedIndex);

        setTimeout(() => {
          isScrollingRef.current = false;
          setIsTransitioning(false);
        }, debounceMs);
      }
    },
    [currentIndex, itemCount, debounceMs]
  );

  // Navigate to next item
  const goToNext = useCallback(() => {
    if (currentIndex < itemCount - 1) {
      goToIndex(currentIndex + 1);
    }
  }, [currentIndex, itemCount, goToIndex]);

  // Navigate to previous item
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      goToIndex(currentIndex - 1);
    }
  }, [currentIndex, goToIndex]);

  // Wheel scroll handler - uses native WheelEvent (not React synthetic)
  // to support { passive: false } for proper preventDefault()
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();

      const now = Date.now();
      if (now - lastScrollTimeRef.current < debounceMs) return;
      if (isScrollingRef.current) return;
      // Filter out trackpad inertia micro-events (intentional scrolls produce deltaY >= 10)
      if (Math.abs(event.deltaY) < WHEEL_DELTA_THRESHOLD) return;

      const delta = event.deltaY;

      if (delta > 0 && currentIndex < itemCount - 1) {
        lastScrollTimeRef.current = now;
        isScrollingRef.current = true;
        setIsTransitioning(true);
        setCurrentIndex(currentIndex + 1);
        setTimeout(() => {
          isScrollingRef.current = false;
          setIsTransitioning(false);
        }, debounceMs);
      } else if (delta < 0 && currentIndex > 0) {
        lastScrollTimeRef.current = now;
        isScrollingRef.current = true;
        setIsTransitioning(true);
        setCurrentIndex(currentIndex - 1);
        setTimeout(() => {
          isScrollingRef.current = false;
          setIsTransitioning(false);
        }, debounceMs);
      }
    },
    [currentIndex, itemCount, debounceMs]
  );

  // Attach wheel handler natively with { passive: false } so preventDefault() works.
  // React's onWheel is passive by default (React 17+), which silently ignores preventDefault().
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Touch start handler (from Vue handleTouchStart)
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (touch) {
      touchStartRef.current = touch.clientY;
    }
  }, []);

  // Touch move handler (from Vue handleTouchMove)
  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      event.preventDefault();

      const now = Date.now();
      if (now - lastScrollTimeRef.current < debounceMs) return;
      if (isScrollingRef.current) return;

      const touch = event.touches[0];
      if (!touch) return;

      const touchEnd = touch.clientY;
      const delta = touchStartRef.current - touchEnd;

      // Ignore small gestures
      if (Math.abs(delta) < touchThreshold) return;

      if (delta > 0 && currentIndex < itemCount - 1) {
        // Swiping up - go to next
        lastScrollTimeRef.current = now;
        isScrollingRef.current = true;
        setIsTransitioning(true);
        setCurrentIndex(currentIndex + 1);
        setTimeout(() => {
          isScrollingRef.current = false;
          setIsTransitioning(false);
        }, debounceMs);
      } else if (delta < 0 && currentIndex > 0) {
        // Swiping down - go to previous
        lastScrollTimeRef.current = now;
        isScrollingRef.current = true;
        setIsTransitioning(true);
        setCurrentIndex(currentIndex - 1);
        setTimeout(() => {
          isScrollingRef.current = false;
          setIsTransitioning(false);
        }, debounceMs);
      }

      // Update for continuous tracking
      touchStartRef.current = touchEnd;
    },
    [currentIndex, itemCount, touchThreshold, debounceMs]
  );

  // Get animation class for a slide (from Vue template :class binding)
  const getSlideClass = useCallback(
    (index: number): SlideClass => {
      if (index === currentIndex) return 'active';
      if (index === currentIndex - 1) return 'prev';
      if (index === currentIndex + 1) return 'next';
      return 'hidden';
    },
    [currentIndex]
  );

  // Listen for external navigation events (from URL sync)
  useEffect(() => {
    const handleExternalNavigation = (event: CustomEvent<{ index: number }>) => {
      if (event.detail?.index !== undefined) {
        goToIndex(event.detail.index);
      }
    };

    window.addEventListener('shorts:navigate', handleExternalNavigation as EventListener);
    return () => {
      window.removeEventListener('shorts:navigate', handleExternalNavigation as EventListener);
    };
  }, [goToIndex]);

  // Clamp currentIndex when itemCount changes to prevent out-of-bounds
  // This preserves the current index when new pages load (fast scrolling)
  useEffect(() => {
    if (itemCount === 0) return;
    setCurrentIndex((prevIndex) => {
      const clampedIndex = Math.max(0, Math.min(prevIndex, itemCount - 1));
      // Only update if actually clamped (prevents unnecessary re-renders)
      return clampedIndex !== prevIndex ? clampedIndex : prevIndex;
    });
  }, [itemCount]); // Only run when itemCount changes

  // Update index when initialIndex changes (for deep linking)
  // Only apply on first mount or when initialIndex actually changes (not on itemCount changes)
  useEffect(() => {
    if (itemCount === 0) return;

    // Check if initialIndex actually changed (not just itemCount)
    const initialIndexChanged = lastInitialIndexRef.current !== initialIndex;

    // Only apply initialIndex if:
    // 1. We haven't applied it yet (first mount or itemCount just became valid), OR
    // 2. The initialIndex actually changed (deep link navigation)
    // But NOT when itemCount changes during fast scrolling (hasAppliedInitialIndexRef prevents this)
    if (initialIndex >= 0 && initialIndex < itemCount) {
      if (!hasAppliedInitialIndexRef.current) {
        // First mount or itemCount just became valid - apply initial index
        hasAppliedInitialIndexRef.current = true;
        lastInitialIndexRef.current = initialIndex;
        setCurrentIndex((prevIndex) => {
          return prevIndex !== initialIndex ? initialIndex : prevIndex;
        });
      } else if (initialIndexChanged) {
        // Initial index changed (e.g., new deep link) - apply it
        // Reset scroll state to allow immediate index update without debounce blocking
        isScrollingRef.current = false;
        setIsTransitioning(false);
        lastInitialIndexRef.current = initialIndex;
        setCurrentIndex((prevIndex) => {
          return prevIndex !== initialIndex ? initialIndex : prevIndex;
        });
      }
      // If initialIndex hasn't changed and we've already applied it, do nothing
      // This preserves current position during fast scrolling when itemCount changes
    }
  }, [initialIndex, itemCount]); // Run when initialIndex or itemCount changes, but hasAppliedInitialIndexRef prevents unwanted resets

  return {
    currentIndex,
    transform,
    isTransitioning,
    containerRef,
    containerProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
    },
    goToIndex,
    goToNext,
    goToPrevious,
    getSlideClass,
  };
}
