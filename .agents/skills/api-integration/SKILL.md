---
name: api-integration
description: "TanStack Query patterns, API client design, query/mutation hooks, caching strategies, OpenAPI integration"
allowed-tools: Read, Write, Edit, Bash
version: 1.0
priority: HIGH
---

# API Integration Patterns – TabooTV Data Fetching

> **CORE GOAL:** Implement robust, type-safe data fetching with TanStack Query. Cache efficiently. Keep API layer clean.

---

## When to Use This Skill

**Trigger Keywords:**
- "Create API client for X"
- "Write query hook for fetching Y"
- "How do I fetch data from the backend?"
- "Create mutation for updating X"
- "Handle API errors"
- "Implement API caching"
- "Generate types from OpenAPI"

---

## Architecture Overview

```
src/api/
├── client/              # HTTP clients (axios, fetch)
│   ├── video.client.ts  # Video-specific API calls
│   ├── auth.client.ts   # Auth API calls
│   └── index.ts         # Export all clients
├── queries/             # TanStack Query hooks
│   ├── video.queries.ts # useVideo(), useVideoList()
│   ├── auth.queries.ts  # useAuthStatus()
│   └── index.ts         # Export all queries
├── mutations/           # TanStack Query mutations
│   ├── video.mutations.ts # useToggleLike(), useAddComment()
│   ├── auth.mutations.ts  # useLogin(), useLogout()
│   └── index.ts         # Export all mutations
├── types/               # Response/request types
│   ├── video.types.ts
│   ├── auth.types.ts
│   └── index.ts
└── query-keys.ts        # Query key factories
```

---

## API Client Pattern

### Basic Client Setup

```typescript
// src/api/client/video.client.ts
import axios from 'axios';
import type { Video, VideoListResponse } from '@/api/types/video.types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getCookie('tabootv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 → redirect to sign-in
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export const videoClient = {
  getVideo: (id: string): Promise<Video> =>
    api.get(`/videos/${id}`).then((res) => res.data),

  getVideoList: (params: { page?: number; limit?: number }): Promise<VideoListResponse> =>
    api.get('/videos', { params }).then((res) => res.data),

  searchVideos: (query: string): Promise<Video[]> =>
    api.get('/videos/search', { params: { q: query } }).then((res) => res.data),
};
```

---

## Query Patterns

### Query Key Factory

```typescript
// src/api/query-keys.ts
export const queryKeys = {
  videos: {
    all: ['videos'] as const,
    lists: () => [...queryKeys.videos.all, 'list'] as const,
    list: (filters: VideoFilters) =>
      [...queryKeys.videos.lists(), filters] as const,
    details: () => [...queryKeys.videos.all, 'detail'] as const,
    detail: (id: string) =>
      [...queryKeys.videos.details(), id] as const,
  },
  auth: {
    all: ['auth'] as const,
    status: () => [...queryKeys.auth.all, 'status'] as const,
  },
} as const;
```

### Query Hook

```typescript
// src/api/queries/video.queries.ts
import { useQuery } from '@tanstack/react-query';
import { videoClient } from '@/api/client/video.client';
import { queryKeys } from '@/api/query-keys';

export const useVideo = (id: string) =>
  useQuery({
    queryKey: queryKeys.videos.detail(id),
    queryFn: () => videoClient.getVideo(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useVideoList = (filters?: VideoFilters) =>
  useQuery({
    queryKey: queryKeys.videos.list(filters || {}),
    queryFn: () => videoClient.getVideoList(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

// Usage in component
function VideoPage({ videoId }: Props) {
  const { data: video, isLoading, error } = useVideo(videoId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorBoundary error={error} />;

  return <VideoDetail video={video} />;
}
```

---

## Mutation Patterns

### Mutation with Optimistic Updates

```typescript
// src/api/mutations/video.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { videoClient } from '@/api/client/video.client';
import { queryKeys } from '@/api/query-keys';

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string) => videoClient.toggleLike(videoId),
    
    onMutate: async (videoId: string) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.videos.detail(videoId),
      });

      // Snapshot previous state
      const previous = queryClient.getQueryData(
        queryKeys.videos.detail(videoId)
      );

      // Optimistically update
      queryClient.setQueryData(queryKeys.videos.detail(videoId), (old: Video) => ({
        ...old,
        isLiked: !old.isLiked,
        likeCount: old.isLiked ? old.likeCount - 1 : old.likeCount + 1,
      }));

      return { previous };
    },

    onError: (error, videoId, context) => {
      // Revert on error
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.videos.detail(videoId),
          context.previous
        );
      }
    },

    onSuccess: () => {
      // Revalidate after success (optional)
      queryClient.invalidateQueries({
        queryKey: queryKeys.videos.all,
      });
    },
  });
};

// Usage in component
function VideoActions({ videoId }: Props) {
  const toggleLike = useToggleLike();

  return (
    <button
      onClick={() => toggleLike.mutate(videoId)}
      disabled={toggleLike.isPending}
    >
      {toggleLike.isPending ? 'Saving...' : 'Like'}
    </button>
  );
}
```

---

## Error Handling

### Client-Level Error Handling

```typescript
// src/api/client/index.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// In axios interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;

    throw new APIError(statusCode, message, error.response?.data);
  }
);
```

### Component-Level Error Handling

```typescript
function VideoDetail({ videoId }: Props) {
  const { data: video, error, isLoading } = useVideo(videoId);

  if (error instanceof APIError) {
    if (error.statusCode === 404) {
      return <NotFound />;
    }
    if (error.statusCode === 403) {
      return <SubscriptionRequired />;
    }
    return <ErrorBoundary error={error} />;
  }

  return <>{/* render video */}</>;
}
```

---

## Type Safety

### Request/Response Types

```typescript
// src/api/types/video.types.ts
export interface Video {
  id: string;
  title: string;
  description: string;
  duration: number;
  playlistUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoListResponse {
  data: Video[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface VideoFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'newest' | 'popular';
}
```

### API Client Types

```typescript
// src/api/client/video.client.ts
export const videoClient = {
  getVideo: async (id: string): Promise<Video> => { /* ... */ },
  
  getVideoList: async (params: VideoFilters): Promise<VideoListResponse> => { /* ... */ },

  toggleLike: async (videoId: string): Promise<{ success: boolean }> => { /* ... */ },
};

// ✓ TypeScript enforces correct parameters and return types
const video = await videoClient.getVideo('123'); // video: Video
```

---

## Query Stale Times & Revalidation

| Resource | Stale Time | Revalidate On |
|----------|-----------|---------------|
| Video details | 5 minutes | Edit video, upload new version |
| Video list | 2 minutes | Create/delete video |
| Comments | 1 minute | New comment posted |
| User profile | 10 minutes | Profile update |
| Auth status | 30 minutes | Login/logout |

---

## Common Patterns

### Dependent Queries

```typescript
// Fetch user, then fetch their profile
function UserProfile({ userId }: Props) {
  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => userClient.getUser(userId),
  });

  const { data: profile } = useQuery({
    queryKey: ['profiles', user?.id],
    queryFn: () => profileClient.getProfile(user!.id),
    enabled: !!user, // Only run when user exists
  });

  return <>{/* render profile */}</>;
}
```

### Pagination

```typescript
function VideoList() {
  const [page, setPage] = useState(1);

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: queryKeys.videos.lists(),
    queryFn: ({ pageParam = 1 }) =>
      videoClient.getVideoList({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined,
  });

  return (
    <div>
      {data?.pages.flatMap((page) => page.data).map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
      {hasNextPage && <button onClick={() => fetchNextPage()}>Load More</button>}
    </div>
  );
}
```

---

## When Complete: Self-Check

- [ ] API client is type-safe (no `any` types)
- [ ] Query/mutation keys follow naming convention
- [ ] Error handling is implemented (401, 404, 500)
- [ ] Optimistic updates use proper rollback
- [ ] Stale times are reasonable
- [ ] No hardcoded API URLs (uses env vars)
- [ ] Interceptors handle auth tokens
- [ ] TypeScript passes: `npm run type-check`

---

## Related Skills

- **typescript-patterns** — Type safety
- **testing** — Mocking API calls in tests
- **code-organization** — File structure
