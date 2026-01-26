/**
 * Type-safe query key factories for TanStack Query
 *
 * Provides centralized query key generation to ensure consistency
 * and type safety across the application.
 *
 * Usage:
 *   queryKeys.videos.detail('123') → ['videos', 'detail', '123']
 *   queryKeys.videos.list({ page: 1 }) → ['videos', 'list', { page: 1 }]
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    me: () => [...queryKeys.auth.user(), 'me'] as const,
  },
  videos: {
    all: ['videos'] as const,
    lists: () => [...queryKeys.videos.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.videos.lists(), filters] as const,
    mapList: (filters?: Record<string, unknown>) =>
      [...queryKeys.videos.all, 'map', filters] as const,
    detail: (id: string | number) => [...queryKeys.videos.all, 'detail', String(id)] as const,
    related: (id: string | number) => [...queryKeys.videos.detail(id), 'related'] as const,
    comments: (id: string | number) => [...queryKeys.videos.detail(id), 'comments'] as const,
    bookmarked: () => [...queryKeys.videos.all, 'bookmarked'] as const,
    history: () => [...queryKeys.videos.all, 'history'] as const,
    liked: () => [...queryKeys.videos.all, 'liked'] as const,
  },
  shorts: {
    all: ['shorts'] as const,
    lists: () => [...queryKeys.shorts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.shorts.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.shorts.all, 'detail', id] as const,
    comments: (id: string) => [...queryKeys.shorts.detail(id), 'comments'] as const,
  },
  series: {
    all: ['series'] as const,
    lists: () => [...queryKeys.series.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.series.lists(), filters] as const,
    detail: (id: string | number) => [...queryKeys.series.all, 'detail', String(id)] as const,
    videos: (id: string | number) => [...queryKeys.series.detail(id), 'videos'] as const,
    trailer: (id: string | number) => [...queryKeys.series.detail(id), 'trailer'] as const,
  },
  courses: {
    all: ['courses'] as const,
    lists: () => [...queryKeys.courses.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.courses.lists(), filters] as const,
    detail: (id: string | number) => [...queryKeys.courses.all, 'detail', String(id)] as const,
    videos: (id: string | number) => [...queryKeys.courses.detail(id), 'videos'] as const,
    trailer: (id: string | number) => [...queryKeys.courses.detail(id), 'trailer'] as const,
  },
  creators: {
    all: ['creators'] as const,
    lists: () => [...queryKeys.creators.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.creators.lists(), filters] as const,
    detail: (id: string | number) => [...queryKeys.creators.all, 'detail', String(id)] as const,
    videos: (id: string | number) => [...queryKeys.creators.detail(id), 'videos'] as const,
    shorts: (id: string | number) => [...queryKeys.creators.detail(id), 'shorts'] as const,
    series: (id: string | number) => [...queryKeys.creators.detail(id), 'series'] as const,
    posts: (id: string | number) => [...queryKeys.creators.detail(id), 'posts'] as const,
    courses: (id: string | number) => [...queryKeys.creators.detail(id), 'courses'] as const,
  },
  community: {
    all: ['community'] as const,
    posts: () => [...queryKeys.community.all, 'posts'] as const,
    postList: (filters?: Record<string, unknown>) =>
      [...queryKeys.community.posts(), 'list', filters] as const,
    postDetail: (id: string | number) =>
      [...queryKeys.community.posts(), 'detail', String(id)] as const,
    comments: (postId: string | number) =>
      [...queryKeys.community.posts(), String(postId), 'comments'] as const,
  },
  subscription: {
    all: ['subscription'] as const,
    plans: () => [...queryKeys.subscription.all, 'plans'] as const,
    plansByCountry: (country?: string) =>
      [...queryKeys.subscription.plans(), 'by-country', country] as const,
    status: () => [...queryKeys.subscription.all, 'status'] as const,
    info: () => [...queryKeys.subscription.all, 'info'] as const,
    detail: () => [...queryKeys.subscription.all, 'detail'] as const,
  },
  search: {
    all: ['search'] as const,
    query: (query: string, filters?: Record<string, unknown>) =>
      [...queryKeys.search.all, query, filters] as const,
  },
  home: {
    all: ['home'] as const,
    banners: () => [...queryKeys.home.all, 'banners'] as const,
    featured: () => [...queryKeys.home.all, 'featured'] as const,
    recommended: () => [...queryKeys.home.all, 'recommended'] as const,
    shorts: () => [...queryKeys.home.all, 'shorts'] as const,
    series: () => [...queryKeys.home.all, 'series'] as const,
    courses: () => [...queryKeys.home.all, 'courses'] as const,
    creators: () => [...queryKeys.home.all, 'creators'] as const,
    data: (cursor?: string | null) => [...queryKeys.home.all, 'data', cursor] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: () => [...queryKeys.notifications.all, 'list'] as const,
    preferences: () => [...queryKeys.notifications.all, 'preferences'] as const,
  },
  playlists: {
    all: ['playlists'] as const,
    lists: () => [...queryKeys.playlists.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.playlists.lists(), filters] as const,
    detail: (id: string | number) => [...queryKeys.playlists.all, 'detail', String(id)] as const,
  },
} as const;
