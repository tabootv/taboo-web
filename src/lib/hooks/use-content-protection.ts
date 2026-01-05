'use client';

import { useEffect } from 'react';

/**
 * Hook to prevent casual content copying and downloading.
 * Blocks common keyboard shortcuts used to save/download content.
 *
 * Note: This is not bulletproof - determined users can still bypass.
 * For true content protection, consider Bunny MediaCage DRM.
 */
export function useContentProtection() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.key) return;
      const key = e.key.toLowerCase();

      // Block F12 (Dev Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }

      // Block Ctrl/Cmd + Shift + I/J/C (Dev Tools shortcuts)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (['i', 'j', 'c'].includes(key)) {
          e.preventDefault();
          return;
        }
      }

      // Block Ctrl/Cmd + S (Save page)
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        return;
      }

      // Block Ctrl/Cmd + U (View source)
      if ((e.ctrlKey || e.metaKey) && key === 'u') {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

/**
 * Context menu handler for protecting media elements.
 * Use on the body element to prevent right-click on videos and images.
 */
export function handleProtectedContextMenu(e: React.MouseEvent) {
  const target = e.target as HTMLElement;

  // Block right-click on video elements
  if (target.tagName === 'VIDEO') {
    e.preventDefault();
    return;
  }

  // Block right-click on images
  if (target.tagName === 'IMG') {
    e.preventDefault();
    return;
  }

  // Block right-click inside video containers
  if (target.closest('video')) {
    e.preventDefault();
    return;
  }

  // Block right-click on elements marked as protected
  if (target.closest('[data-protected]')) {
    e.preventDefault();
    return;
  }
}
