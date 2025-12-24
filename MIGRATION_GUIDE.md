# API Layer Migration Guide

## Overview

This guide explains how to migrate from the old API structure (`src/lib/api/endpoints.ts`) to the new type-safe API layer (`src/api/`).

## New Structure

```
src/api/
├── types/
│   ├── manual.ts          # Manual TypeScript types (OpenAPI-ready)
│   └── index.ts           # Type exports (swappable for generated types)
├── client/
│   ├── base-client.ts     # Base HTTP client
│   ├── auth.client.ts     # Auth domain client
│   ├── video.client.ts    # Video domain client
│   ├── home.client.ts     # Home feed client
│   ├── series.client.ts   # Series client
│   ├── posts.client.ts    # Community posts client
│   └── index.ts           # Client exports
├── queries/
│   ├── auth.queries.ts    # Auth query hooks
│   ├── video.queries.ts    # Video query hooks
│   ├── home.queries.ts    # Home feed query hooks
│   ├── series.queries.ts  # Series query hooks
│   ├── posts.queries.ts   # Posts query hooks
│   └── index.ts           # Query exports
├── mutations/
│   ├── auth.mutations.ts  # Auth mutation hooks
│   ├── video.mutations.ts # Video mutation hooks
│   ├── posts.mutations.ts # Posts mutation hooks
│   └── index.ts           # Mutation exports
├── query-keys.ts          # Centralized query key factory
└── index.ts               # Main API exports
```

## Migration Steps

### 1. Replace Direct API Calls with Query Hooks

**Before:**

```typescript
import { videos as videosApi } from '@/lib/api';

const fetchVideos = async () => {
  const response = await videosApi.getLongForm(1, 24);
  setVideos(response.data);
};
```

**After:**

```typescript
import { useLongFormVideos } from '@/api/queries';

const { data, isLoading } = useLongFormVideos(1, 24);
const videos = data?.data || [];
```

### 2. Replace Custom Infinite Scroll with TanStack Query Infinite Queries

**Before:**

```typescript
import { useInfiniteScrollPagination } from '@/lib/hooks/use-infinite-scroll-pagination';
import { videos as videosApi } from '@/lib/api';

const { items, isLoading, loadMoreRef } = useInfiniteScrollPagination({
  fetchPage: async (page) => {
    const response = await videosApi.getLongForm(page, 24);
    return {
      data: response.data,
      currentPage: response.current_page,
      lastPage: response.last_page,
    };
  },
});
```

**After:**

```typescript
import { useVideoList } from '@/api/queries';
import { useMemo } from 'react';

const { data, isLoading, fetchNextPage, hasNextPage } = useVideoList({
  short: false,
  per_page: 24,
});

const videos = useMemo(() => {
  return data?.pages.flatMap((page) => page.data) || [];
}, [data]);
```

### 3. Replace Mutations with Mutation Hooks

**Before:**

```typescript
import { videos as videosApi } from '@/lib/api';

const handleLike = async (videoId: string) => {
  const response = await videosApi.toggleLike(videoId);
  // Manual cache update
  updateVideoInCache(videoId, response);
};
```

**After:**

```typescript
import { useToggleLike } from '@/api/mutations';

const toggleLike = useToggleLike();

const handleLike = (videoId: string) => {
  toggleLike.mutate(videoId);
  // Cache automatically updated with optimistic updates
};
```

### 4. Update Query Keys Imports

**Before:**

```typescript
import { queryKeys } from '@/shared/lib/api/query-keys';
```

**After:**

```typescript
import { queryKeys } from '@/api/query-keys';
```

## Domain-Specific Examples

### Videos

**Queries:**

- `useVideo(id)` - Get single video
- `useVideoList(filters)` - Get video list with infinite scroll
- `useLongFormVideos(page, perPage)` - Get long-form videos only
- `useRelatedVideos(videoId, page, perPage)` - Get related videos
- `useVideoComments(id, page)` - Get video comments

**Mutations:**

- `useToggleLike()` - Toggle like (with optimistic update)
- `useToggleDislike()` - Toggle dislike (with optimistic update)
- `useToggleBookmark()` - Toggle bookmark (with optimistic update)
- `useAddComment()` - Add comment
- `useToggleAutoplay()` - Toggle autoplay preference

### Authentication

**Queries:**

- `useMe()` - Get current user

**Mutations:**

- `useLogin()` - Login
- `useRegister()` - Register
- `useFirebaseLogin()` - Firebase login (Google/Apple)
- `useLogout()` - Logout
- `useForgotPassword()` - Forgot password
- `useResetPassword()` - Reset password

### Home Feed

**Queries:**

- `useBanners()` - Get banners
- `useFeaturedVideos()` - Get featured videos
- `useRecommendedVideos()` - Get recommended videos
- `useShortVideos()` - Get short videos
- `useSeries()` - Get series
- `useCourses()` - Get courses
- `useCreators()` - Get creators

### Series

**Queries:**

- `useSeriesList(params)` - Get series list
- `useSeriesListPaginated(page, perPage)` - Get paginated series
- `useSeriesDetail(id)` - Get series detail
- `useSeriesTrailer(id)` - Get series trailer
- `useSeriesPlay(uuid)` - Get series play data

### Community Posts

**Queries:**

- `usePostsList()` - Get posts list with infinite scroll
- `usePost(id)` - Get single post
- `usePostComments(postId, page)` - Get post comments

**Mutations:**

- `useCreatePost()` - Create post
- `useLikePost()` - Like post (with optimistic update)
- `useDislikePost()` - Dislike post (with optimistic update)
- `useDeletePost()` - Delete post
- `useAddPostComment()` - Add comment to post

## Benefits

1. **Type Safety**: All API calls are fully typed
2. **Automatic Caching**: TanStack Query handles caching automatically
3. **Optimistic Updates**: Mutations update UI immediately
4. **Loading States**: Built-in loading and error states
5. **Refetching**: Automatic refetching on window focus (configurable)
6. **Infinite Queries**: Built-in infinite scroll support
7. **Future-Proof**: Easy migration to OpenAPI-generated types

## Performance Optimizations

The new query client is configured with domain-specific stale times:

- **Video metadata**: 30 minutes (rarely changes)
- **User profile**: 5 minutes
- **Notifications**: 30 seconds (real-time feel)
- **Home feed**: 10 minutes
- **Search results**: 5 minutes

## Migration Checklist

- [ ] Replace direct API calls with query hooks
- [ ] Replace custom infinite scroll with TanStack Query infinite queries
- [ ] Replace mutations with mutation hooks
- [ ] Update query keys imports
- [ ] Remove old API imports
- [ ] Test all functionality
- [ ] Remove unused code

## Need Help?

See example migrations:

- `src/app/(main)/videos/page.new.tsx.example`
- `src/app/(main)/community/page.new.tsx.example`
