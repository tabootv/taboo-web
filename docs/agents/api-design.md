# API Design Patterns

> **When to use:** Building components that fetch, cache, or mutate data. Working with TanStack Query.

---

## Quick Reference

```tsx
// Fetching data
import { useVideo } from '@/api/queries/video.queries';
const { data, isLoading } = useVideo(videoId);

// Mutating data (with optimistic updates)
import { useToggleLike } from '@/api/mutations/video.mutations';
const toggleLike = useToggleLike();
toggleLike.mutate(videoId);

// Direct client calls (non-component code)
import { videoClient } from '@/api/client/video.client';
const data = await videoClient.getVideo(id);
```

---

## Query Hooks (Data Fetching)

### Location
All query hooks are in `src/api/queries/`.

### Pattern: useResource, useResourceList

```tsx
// Single resource
const { data: video, isLoading, error } = useVideo(id);

// List with pagination
const { data, isLoading, hasNextPage, fetchNextPage } = useVideoList({
  page: 1,
  perPage: 20,
  types: 'videos',
  search: 'keyword',
});
```

### Key Features
- **Automatic caching** – Same query key = reused data
- **Stale times** – Data refreshes based on domain (videos: 5 min, shorts: 30 sec)
- **Infinite queries** – For pagination/scroll
- **Optimistic updates** – Mutations show results before API confirms

### Query Keys
Centralized in `src/api/query-keys.ts`:

```tsx
export const VideoQueries = {
  all: ['video'] as const,
  lists: () => [...VideoQueries.all, 'list'] as const,
  list: (filters) => [...VideoQueries.lists(), filters] as const,
  details: () => [...VideoQueries.all, 'detail'] as const,
  detail: (id) => [...VideoQueries.details(), id] as const,
};
```

---

## Mutation Hooks (Data Updates)

### Pattern

```tsx
const mutation = useToggleLike();

// Trigger mutation
mutation.mutate(videoId, {
  onSuccess: () => {
    // Handle success
    console.log('Liked!');
  },
  onError: (error) => {
    // Handle error
  },
});

// Check status
mutation.isPending    // Currently submitting?
mutation.isSuccess    // Just succeeded?
mutation.isError      // Just failed?
```

### Optimistic Updates Pattern

```tsx
// In mutation hook, update cache immediately
const useToggleLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (videoId) => videoClient.toggleLike(videoId),
    onMutate: async (videoId) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: VideoQueries.detail(videoId) });
      
      // Snapshot old data
      const prev = queryClient.getQueryData(VideoQueries.detail(videoId));
      
      // Optimistically update UI
      queryClient.setQueryData(VideoQueries.detail(videoId), (old) => ({
        ...old,
        liked: !old.liked,
      }));
      
      return { prev };
    },
    onError: (err, videoId, context) => {
      // Rollback on error
      queryClient.setQueryData(VideoQueries.detail(videoId), context.prev);
    },
    onSuccess: () => {
      // Refetch to verify
      queryClient.invalidateQueries({ queryKey: VideoQueries.all });
    },
  });
};
```

---

## Domain Clients

### Location
`src/api/client/` – One per domain (video, shorts, series, etc.)

### Pattern

```tsx
// src/api/client/video.client.ts
import { axios } from '@/lib/axios';

export const videoClient = {
  getVideo: (id: string) => 
    axios.get(`/api/videos/${id}`).then(r => r.data),
  
  getVideos: (params) => 
    axios.get('/api/videos', { params }).then(r => r.data),
  
  toggleLike: (videoId: string) => 
    axios.post(`/api/videos/${videoId}/like`).then(r => r.data),
  
  updateVideo: (id: string, data: Partial<Video>) =>
    axios.patch(`/api/videos/${id}`, data).then(r => r.data),
};
```

---

## Query Invalidation

### When to Invalidate

```tsx
// After successful mutation, invalidate related queries
queryClient.invalidateQueries({
  queryKey: VideoQueries.lists(),  // All lists
  // or
  queryKey: VideoQueries.detail(videoId),  // Specific detail
});
```

### Common Patterns

```tsx
// Invalidate all video data
queryClient.invalidateQueries({ queryKey: VideoQueries.all });

// Invalidate video list with specific filter
queryClient.invalidateQueries({
  queryKey: VideoQueries.list({ types: 'videos' }),
});

// Invalidate and refetch
queryClient.invalidateQueries({
  queryKey: VideoQueries.all,
  refetchType: 'active',  // Only if hook is active
});
```

---

## Error Handling

### Standard Pattern

```tsx
const { data, error, isLoading } = useVideo(id);

if (isLoading) return <Spinner />;
if (error) return <ErrorState error={error.message} />;

return <VideoDetail video={data} />;
```

### Network Errors

TanStack Query automatically handles retries:
- 3 retries by default
- Exponential backoff (delays grow)
- Don't retry on 4xx errors (client error)

---

## When to Use Direct Client Calls

Use `videoClient.getVideo()` (not a hook) when:
- Calling from server actions
- Calling from event handlers (non-render code)
- Building a custom hook that wraps multiple calls

```tsx
// In a server action
export async function getVideoMetadata(videoId: string) {
  const video = await videoClient.getVideo(videoId);
  return video.metadata;
}

// In an event handler (inside 'use client' component)
const handleDownload = async () => {
  const data = await videoClient.getVideo(videoId);
  // ... download logic
};
```

---

## Pagination Pattern (Infinite Queries)

### Hook

```tsx
const useInfiniteVideos = (filters) => {
  return useInfiniteQuery({
    queryKey: VideoQueries.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      videoClient.getVideos({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
```

### Usage in Component

```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteVideos(filters);

return (
  <InfiniteScroll
    dataLength={data?.pages?.length}
    next={fetchNextPage}
    hasMore={hasNextPage}
  >
    {data?.pages.map(page =>
      page.videos.map(v => <MediaCard key={v.id} {...v} />)
    )}
  </InfiniteScroll>
);
```

---

## Best Practices

✅ **DO:**
- Keep queries and mutations organized by domain
- Use query keys for consistency
- Validate data shape with types
- Handle error states explicitly
- Use optimistic updates for better UX
- Cancel in-flight queries before mutations
- Invalidate cache after mutations

❌ **DON'T:**
- Mix query logic in components (use hooks)
- Hardcode API URLs (use clients)
- Ignore error states
- Forget to invalidate cache
- Assume data is always present (check `isLoading`)

---

## Comments API Reference

TabooTV has three distinct comment systems:
- **Video Comments** - Long-form videos (cursor-based pagination)
- **Short Video Comments** - Shorts (page-based pagination)
- **Post Comments** - Community posts (includes like/dislike counts)

### Video Comments

**List Comments:**
```http
GET /api/videos/{video:uuid}/comments-list?cursor={cursor}
```
Returns cursor-paginated comments (20 per page) with nested replies.

**Create Comment:**
```http
POST /api/videos/{video:uuid}/comment
Content-Type: application/json

{ "content": "Comment text", "parent_id": null }
```
- `content`: Required, 1-1500 characters
- `parent_id`: Optional, for replies

**Delete Comment:**
```http
DELETE /api/videos/{comment:uuid}/delete
```
Users can only delete their own comments.

**Like/Dislike Toggle:**
```http
POST /api/comments/{comment:uuid}/like-toggle
POST /api/comments/{comment:uuid}/dislike-toggle
```
Toggle state transitions: No interaction ↔ Liked ↔ Disliked

### Short Video Comments

**List Comments:**
```http
GET /api/v2/shorts/{uuid}/comments?page=1&per_page=20
```
Uses page-based pagination. Max 3 replies loaded per comment.

For create/like/delete, use the standard video comment endpoints (shorts share the Comment model).

### Post Comments

**List Comments:**
```http
GET /api/post-comments/posts/{post}
```
Returns comments with `likes_count`, `dislikes_count`, `replies_count`.

**Create Comment:**
```http
POST /api/post-comments/posts/{post}
{ "content": "Comment text", "parent_id": null }
```
- `parent_id` must reference a top-level comment (nested replies not allowed)

**Get Replies:**
```http
GET /api/post-comments/{postComment}/replies
```

**Like/Dislike Toggle:**
```http
POST /api/post-comments/{postComment}/like-toggle
POST /api/post-comments/{postComment}/dislike-toggle
```

**Delete Comment:**
```http
DELETE /api/post-comments/{postComment:uuid}/delete
```

### Comment TypeScript Interfaces

```typescript
interface VideoComment {
  id: number;
  uuid: string;
  content: string;
  parent_id: number | null;
  user_id: number;
  video_id: number;
  is_creator: boolean;
  has_liked: boolean;
  has_disliked: boolean;
  created_at: string;  // Human-readable: "2 hours ago"
  user: UserResource;
  replies?: VideoComment[];
}

interface PostComment extends VideoComment {
  post_id: number;
  replies_count: number;
  likes_count: number;
  dislikes_count: number;
}
```

---

## Reference

- **Query hooks:** `src/api/queries/*.queries.ts`
- **Mutation hooks:** `src/api/mutations/*.mutations.ts`
- **Clients:** `src/api/client/*.client.ts`
- **Query keys:** `src/api/query-keys.ts`
- **TanStack Query docs:** https://tanstack.com/query/latest
