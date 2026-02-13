'use client';

import { useEffect } from 'react';

/**
 * Triggers an early import of shaka-player before the VideoPlayer
 * dynamic import resolves. This parallelizes the Shaka download with
 * React hydration, shaving ~200-500ms off the critical path.
 */
export function ShakaPreloader() {
  useEffect(() => {
    import('shaka-player');
  }, []);

  return null;
}
