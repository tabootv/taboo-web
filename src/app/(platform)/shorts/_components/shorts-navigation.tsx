'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

interface ShortsNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function ShortsNavigation({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: ShortsNavigationProps) {
  return (
    <div className="shorts-navigation">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="shorts-nav-button"
        aria-label="Previous short"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="shorts-nav-button"
        aria-label="Next short"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </div>
  );
}
