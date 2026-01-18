---
name: migrate-api
description: Migrate legacy API calls to TanStack Query
triggers:
  - migrate API
  - convert to TanStack Query
  - update API layer
  - migrate to query hooks
---

# Migrate API to TanStack Query

This skill guides migration from the legacy API structure (`src/lib/api/endpoints.ts`) to the modern TanStack Query layer (`src/api/`).

## New API Structure

```
src/api/
├── client/           # Domain-specific HTTP clients
├── queries/          # Query hooks (useVideo, useSeriesList, etc.)
├── mutations/        # Mutation hooks (useToggleLike, useLogin, etc.)
├── query-keys.ts     # Centralized query key factories
└── types/            # API response types
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

### 2. Replace Custom Infinite Scroll

**Before:**
```typescript
import { useInfiniteScrollPagination } from '@/hooks/use-infinite-scroll-pagination';
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

### 3. Replace Mutations

**Before:**
```typescript
import { videos as videosApi } from '@/lib/api';

const handleLike = async (videoId: string) => {
  const response = await videosApi.toggleLike(videoId);
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

```typescript
// Before
import { queryKeys } from '@/shared/lib/api/query-keys';

// After
import { queryKeys } from '@/api/query-keys';
```

## Available Hooks by Domain

### Videos

**Queries:**
- `useVideo(id)` - Get single video
- `useVideoList(filters)` - Get video list with infinite scroll
- `useLongFormVideos(page, perPage)` - Get long-form videos only
- `useRelatedVideos(videoId, page, perPage)` - Get related videos
- `useVideoComments(id, page)` - Get video comments

**Mutations:**
- `useToggleLike()` - Toggle like (optimistic update)
- `useToggleDislike()` - Toggle dislike (optimistic update)
- `useToggleBookmark()` - Toggle bookmark (optimistic update)
- `useAddComment()` - Add comment
- `useToggleAutoplay()` - Toggle autoplay preference

### Authentication

**Queries:**
- `useMe()` - Get current user

**Mutations:**
- `useLogin()` - Login
- `useRegister()` - Register
- `useFirebaseLogin()` - Firebase login
- `useLogout()` - Logout

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
- `useSeriesDetail(id)` - Get series detail
- `useSeriesTrailer(id)` - Get series trailer
- `useSeriesPlay(uuid)` - Get series play data

### Posts

**Queries:**
- `usePostsList()` - Get posts list with infinite scroll
- `usePost(id)` - Get single post
- `usePostComments(postId, page)` - Get post comments

**Mutations:**
- `useCreatePost()` - Create post
- `useLikePost()` - Like post (optimistic update)
- `useDislikePost()` - Dislike post (optimistic update)
- `useDeletePost()` - Delete post

## Migration Checklist

- [ ] Replace direct API calls with query hooks
- [ ] Replace custom infinite scroll with TanStack Query infinite queries
- [ ] Replace mutations with mutation hooks
- [ ] Update query keys imports
- [ ] Remove old API imports
- [ ] Test all functionality
- [ ] Remove unused code
