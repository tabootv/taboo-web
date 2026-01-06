/**
 * Clips Mutation Hooks
 *
 * TanStack Query mutation hooks for clips actions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SaveClipData } from '../client/clips.client';
import { clipsClient } from '../client/clips.client';

/**
 * Hook to save a new clip
 */
export function useSaveClip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clipData: SaveClipData) => clipsClient.saveClip(clipData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips', 'my-clips'] });
    },
  });
}
