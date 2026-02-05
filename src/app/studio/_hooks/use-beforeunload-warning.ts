'use client';

import { useEffect } from 'react';

/**
 * Hook to warn user when trying to close/navigate away from page during active upload
 *
 * @param enabled - Whether to show the warning (typically true during upload)
 */
export function useBeforeunloadWarning(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = '';
      return 'Upload in progress. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled]);
}
