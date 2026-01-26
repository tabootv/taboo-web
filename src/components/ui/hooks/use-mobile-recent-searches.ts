/**
 * Hook for managing mobile recent searches in localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MAX_MOBILE_RECENT_SEARCHES,
  MOBILE_RECENT_SEARCHES_KEY,
} from '@/components/search/constants/search-constants';

interface RecentSearch {
  query: string;
  timestamp: number;
}

export function useMobileRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(MOBILE_RECENT_SEARCHES_KEY);
        setRecentSearches(stored ? JSON.parse(stored) : []);
      } catch (error) {
        console.error('Failed to load recent searches from localStorage:', error);
      }
    }
  }, []);

  const saveRecentSearch = useCallback(
    (query: string) => {
      if (typeof window === 'undefined' || !query.trim()) return;
      try {
        const recent = recentSearches.filter((s) => s.query !== query);
        const updated = [{ query, timestamp: Date.now() }, ...recent].slice(
          0,
          MAX_MOBILE_RECENT_SEARCHES
        );
        localStorage.setItem(MOBILE_RECENT_SEARCHES_KEY, JSON.stringify(updated));
        setRecentSearches(updated);
      } catch (error) {
        console.error('Failed to save recent search to localStorage:', error);
      }
    },
    [recentSearches]
  );

  const removeRecentSearch = useCallback(
    (query: string) => {
      if (typeof window === 'undefined') return;
      try {
        const updated = recentSearches.filter((s) => s.query !== query);
        localStorage.setItem(MOBILE_RECENT_SEARCHES_KEY, JSON.stringify(updated));
        setRecentSearches(updated);
      } catch (error) {
        console.error('Failed to remove recent search from localStorage:', error);
      }
    },
    [recentSearches]
  );

  return { recentSearches, saveRecentSearch, removeRecentSearch };
}
