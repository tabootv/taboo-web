/**
 * Users Query Hooks
 *
 * TanStack Query hooks for user search and profile fetching
 */

import { useQuery } from '@tanstack/react-query';
import { usersClient } from '../client/users.client';
import { queryKeys } from '../query-keys';

export function useUserSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.search(query),
    queryFn: () => usersClient.searchUsers(query),
    enabled: enabled && query.length >= 4 && query.length <= 20,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserByHandler(handler: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.byHandler(handler),
    queryFn: () => usersClient.getUserByHandler(handler),
    enabled: enabled && !!handler,
    staleTime: 1000 * 60 * 5,
  });
}
