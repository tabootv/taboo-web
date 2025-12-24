/**
 * Community Posts Query Hooks
 *
 * TanStack Query hooks for community posts data fetching
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { postsClient } from '../client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch list of posts with infinite scroll
 * Stale time: 5 minutes
 */
export function usePostsList() {
  return useInfiniteQuery({
    queryKey: queryKeys.community.postList(),
    queryFn: ({ pageParam = 1 }) => postsClient.list({ page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single post
 * Stale time: 5 minutes
 */
export function usePost(id: number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.community.postDetail(id!),
    queryFn: () => postsClient.get(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch comments for a post
 * Stale time: 5 minutes
 */
export function usePostComments(postId: number | null | undefined, page = 1) {
  return useQuery({
    queryKey: [...queryKeys.community.comments(postId!), page],
    queryFn: () => postsClient.getComments(postId!, { page }),
    enabled: !!postId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
