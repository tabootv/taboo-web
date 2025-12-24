/**
 * @deprecated Use queryKeys from '@/api/query-keys' instead
 * This file is kept for backward compatibility during migration
 */

export { queryKeys } from '@/api/query-keys';
  videos: {
    all: ['videos'] as const,
    lists: () => [...queryKeys.videos.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.videos.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.videos.all, 'detail', id] as const,
  },
  shorts: {
    all: ['shorts'] as const,
    lists: () => [...queryKeys.shorts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.shorts.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.shorts.all, 'detail', id] as const,
  },
  series: {
    all: ['series'] as const,
    lists: () => [...queryKeys.series.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.series.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.series.all, 'detail', id] as const,
  },
  courses: {
    all: ['courses'] as const,
    lists: () => [...queryKeys.courses.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.courses.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.courses.all, 'detail', id] as const,
  },
  creators: {
    all: ['creators'] as const,
    lists: () => [...queryKeys.creators.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.creators.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.creators.all, 'detail', id] as const,
  },
  community: {
    all: ['community'] as const,
    posts: () => [...queryKeys.community.all, 'posts'] as const,
    postList: (filters?: Record<string, unknown>) =>
      [...queryKeys.community.posts(), 'list', filters] as const,
    postDetail: (id: string) => [...queryKeys.community.posts(), 'detail', id] as const,
    comments: (postId: string) =>
      [...queryKeys.community.posts(), postId, 'comments'] as const,
  },
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    me: () => [...queryKeys.auth.user(), 'me'] as const,
  },
  subscription: {
    all: ['subscription'] as const,
    plans: () => [...queryKeys.subscription.all, 'plans'] as const,
    status: () => [...queryKeys.subscription.all, 'status'] as const,
  },
  search: {
    all: ['search'] as const,
    query: (query: string, filters?: Record<string, unknown>) =>
      [...queryKeys.search.all, query, filters] as const,
  },
  home: {
    all: ['home'] as const,
    data: (cursor?: string | null) => [...queryKeys.home.all, 'data', cursor] as const,
  },
} as const;

