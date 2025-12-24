/**
 * Hook for managing search input expansion state
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSearchExpansionOptions {
  onExpand?: () => void;
  onCollapse?: () => void;
}

/**
 * Hook for managing search expansion state
 */
export function useSearchExpansion(options?: UseSearchExpansionOptions) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const expand = useCallback(() => {
    setIsExpanded(true);
    options?.onExpand?.();
  }, [options]);

  const collapse = useCallback(() => {
    setIsExpanded(false);
    options?.onCollapse?.();
  }, [options]);

  const toggle = useCallback(() => {
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  }, [isExpanded, expand, collapse]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return {
    isExpanded,
    expand,
    collapse,
    toggle,
    inputRef,
  };
}

