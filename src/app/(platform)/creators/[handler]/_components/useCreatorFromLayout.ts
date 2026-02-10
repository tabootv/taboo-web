'use client';

import { useCreatorByHandler, useCreatorProfile } from '@/api/queries/creators.queries';
import { useMemo } from 'react';

/**
 * Hook to get creator data from TanStack Query cache (shared with layout).
 * All creator pages use this to avoid duplicate fetches.
 */
export function useCreatorFromLayout(handler: string) {
  const { data: creatorData, isLoading } = useCreatorByHandler(handler, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const basicCreator = creatorData?.creators?.[0];
  const creatorId = useMemo(() => basicCreator?.id, [basicCreator?.id]);
  const { data: profileData } = useCreatorProfile(creatorId);

  const creator = useMemo(() => {
    if (profileData) return profileData;
    return basicCreator;
  }, [basicCreator, profileData]);

  return { creator, isLoading };
}
