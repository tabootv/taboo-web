import { useCreatorsListPublic } from '@/api/queries';
import type { Creator } from '@/types';
import { useMemo } from 'react';

export function useCreatorById(channelId: number | undefined): Creator | undefined {
  const { data } = useCreatorsListPublic({ per_page: 100 });

  return useMemo(() => {
    if (!channelId || !data?.data) return undefined;
    return data.data.find((creator) => creator.id === channelId);
  }, [channelId, data]);
}
