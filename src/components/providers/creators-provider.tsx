import { creatorsClient } from '@/api/client/creators.client';
import { queryKeys } from '@/api/query-keys';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

export async function CreatorsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.creators.list({ per_page: 100 }),
    queryFn: () => creatorsClient.listPublic({ per_page: 100 }),
    staleTime: 1000 * 60 * 60,
  });

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
