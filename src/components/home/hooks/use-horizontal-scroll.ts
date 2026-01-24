/**
 * Hook for managing horizontal scroll navigation with gradient indicators
 */

import { useState, useRef, useEffect, useCallback } from 'react';

export function useHorizontalScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftGradient(scrollLeft > 20);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 20);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => el.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, [handleScroll]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  return {
    scrollRef,
    showLeftGradient,
    showRightGradient,
    scroll,
  };
}

