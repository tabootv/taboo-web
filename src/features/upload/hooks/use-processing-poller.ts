'use client';

import { useEffect, useMemo } from 'react';
import { studioClient } from '@/api/client/studio.client';
import { useUploadStore } from '@/shared/stores/upload-store';

const POLL_INTERVAL_MS = 10_000;

/**
 * Polls the API for uploads in 'processing' phase.
 * When bunny_status === 3 (finished), transitions to 'complete'.
 *
 * Mounted in GlobalUploadIndicator so it runs whenever there are
 * active uploads visible to the user.
 */
export function useProcessingPoller() {
  const uploads = useUploadStore((state) => state.uploads);
  const setPhase = useUploadStore((state) => state.setPhase);

  const processingUploads = useMemo(
    () =>
      Array.from(uploads.values()).filter(
        (u) => u.phase === 'processing' && u.videoUuid && !u.isStale
      ),
    [uploads]
  );

  useEffect(() => {
    if (processingUploads.length === 0) return;

    const interval = setInterval(async () => {
      for (const upload of processingUploads) {
        try {
          const video = await studioClient.getVideo(upload.videoUuid!);
          // The API returns bunny_status but the Video type doesn't include it
          const bunnyStatus = (video as unknown as { bunny_status?: number }).bunny_status;
          if (bunnyStatus === 3) {
            setPhase(upload.id, 'complete');
          }
        } catch {
          // Silently ignore — will retry on next interval
        }
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [processingUploads, setPhase]);
}
