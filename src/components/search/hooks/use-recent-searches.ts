/**
 * Hook for managing recent searches in localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_KEY,
} from '@/components/search/constants/search-constants';

/**
 * Get recent searches from localStorage
 */
function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save a search query to recent searches
 */
function saveRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Remove a search query from recent searches
 */
function removeRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Hook for managing recent searches
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
  }, []);

  const removeSearch = useCallback((query: string) => {
    removeRecentSearch(query);
    setRecentSearches(getRecentSearches());
  }, []);

  const clearRecentSearches = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    removeSearch,
    clearRecentSearches,
  };
}
