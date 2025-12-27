'use client';

import { useEffect } from 'react';

export function useEpisodeScroll(episodesRef: React.RefObject<HTMLDivElement | null>, currentEpisodeIndex: number) {
  useEffect(() => {
    if (episodesRef.current && currentEpisodeIndex >= 0) {
      const currentCard = episodesRef.current.children[currentEpisodeIndex] as HTMLElement;
      if (currentCard) {
        currentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [episodesRef, currentEpisodeIndex]);
}

