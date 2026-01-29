# Content Types Specification

> **When to use:** Building features for videos, shorts, series, courses, or posts. Understanding content-specific APIs.

---

## Content Type Overview

| Type | Duration | Layout | API Endpoint | Examples |
|------|----------|--------|------|----------|
| **Videos** | Long (5min+) | Full-screen with player | `/api/videos` | Tutorials, vlogs, movies |
| **Shorts** | Brief (15-60s) | Vertical 9:16 | `/api/v2/shorts` | TikTok-style, social clips |
| **Series** | Multi-episode | Grid with episodes | `/api/series` | TV shows, courses |
| **Courses** | Structured | Lessons with progress | `/api/courses` | Educational, tutorials |
| **Posts** | Text/image | Feed items | `/api/posts` | Community, social |

---

## Videos

### Data Structure
```tsx
interface Video {
  id: string;
  uuid: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;        // HLS stream URL
  duration: number;   // seconds
  views: number;
  likes: number;
  channel: Channel;
  createdAt: string;
  isPremium: boolean;
  isNsfw: boolean;
}
```

### API Endpoints
```
GET /api/videos              # List videos
GET /api/videos/{id}         # Get video detail
POST /api/videos/{id}/like   # Like/unlike
GET /api/videos/{id}/stream  # Stream quality selection
```

### Component Usage
```tsx
import { useVideo } from '@/api/queries/video.queries';
import { MediaCard } from '@/components/ui';

const { data: video } = useVideo(videoId);

<MediaCard type="video" {...video} />
```

### Player
- **Shaka Player** for HLS streaming
- Quality selection (1440p → 1080p → 720p → 480p)
- Playback speed control
- Resume from bookmark

---

## Shorts (Vertical Videos)

### Data Structure
```tsx
interface Short {
  id: string;
  uuid: string;
  title: string;
  thumbnail: string;
  url: string;        // MP4 or HLS
  duration: number;   // seconds (max 60)
  views: number;
  likes: number;
  channel: Channel;
  createdAt: string;
}
```

### API Endpoints
```
GET /api/v2/shorts                # List shorts feed (infinite scroll)
GET /api/v2/shorts/{id}           # Get short detail
POST /api/v2/shorts/{id}/like     # Like/unlike
GET /api/v2/shorts/{id}/comments  # Comments
```

### Component Usage
```tsx
import { useInfiniteShortsFeeed } from '@/api/queries/shorts.queries';

const { data, fetchNextPage } = useInfiniteShortsFeeed();

// Vertical layout with swipe navigation
```

### Feed Behavior
- Infinite scroll with pagination
- Auto-play current video
- Pause on scroll
- Swipe left/right for next
- Store current index in `useShortsStore`

---

## Series (Collections)

### Data Structure
```tsx
interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  episodeCount: number;
  episodes: Episode[];
  channel: Channel;
  createdAt: string;
  isPremium: boolean;
}

interface Episode {
  id: string;
  seriesId: string;
  title: string;
  episode: number;
  duration: number;
  url: string;
}
```

### API Endpoints
```
GET /api/series                    # List series
GET /api/series/{id}               # Get series + episodes
GET /api/series/{seriesId}/episodes/{episodeId}  # Play episode
POST /api/series/{seriesId}/episodes/{episodeId}/progress  # Save progress
```

### Component Usage
```tsx
import { useSeries } from '@/api/queries/series.queries';

const { data: series } = useSeries(seriesId);

// Netflix-style layout with episode list
```

### Auto-play
- Play next episode automatically
- Save progress (timestamp, completed episodes)
- Resume from bookmark

---

## Courses (Lessons)

### Data Structure
```tsx
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: Channel;
  lessons: Lesson[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  lessonNumber: number;
  duration: number;
  url: string;
  isCompleted: boolean;
}
```

### API Endpoints
```
GET /api/courses                    # List courses
GET /api/courses/{id}               # Get course + lessons
GET /api/courses/{courseId}/lessons/{lessonId}  # Play lesson
POST /api/courses/{courseId}/lessons/{lessonId}/complete  # Mark as complete
GET /api/courses/{id}/progress      # Get user progress
```

### Component Usage
```tsx
import { useCourse } from '@/api/queries/course.queries';

const { data: course } = useCourse(courseId);

// Structured lesson layout with progress tracking
```

### Progress Tracking
- Track completion per lesson
- Show overall progress percentage
- Resume from last watched lesson
- Persist completion status

---

## Posts (Community)

### Data Structure
```tsx
interface Post {
  id: string;
  content: string;
  image?: string;
  author: User;
  likes: number;
  comments: number;
  createdAt: string;
  isLiked: boolean;
}
```

### API Endpoints
```
GET /api/posts                      # List posts (feed)
GET /api/posts/{id}                 # Get post detail
POST /api/posts                     # Create post
POST /api/posts/{id}/like           # Like post
GET /api/posts/{id}/comments        # Get comments
POST /api/posts/{id}/comments       # Add comment
```

### Component Usage
```tsx
import { useInfinitePosts } from '@/api/queries/post.queries';

const { data, fetchNextPage } = useInfinitePosts();

// Single-column feed layout
```

### Feed Behavior
- Infinite scroll
- Show like count
- Show comment count
- Load comments on click

---

## Content Type Cards

All content uses unified `<MediaCard>` component:

```tsx
<MediaCard
  type="video"      // or 'short', 'series', 'course', 'post'
  title={title}
  thumbnail={thumbnail}
  duration={duration}        // Videos, Shorts, Courses
  episodeCount={episodeCount} // Series only
  channel={channel}
  views={views}
  likes={likes}
  isNsfw={isNsfw}            // Videos only
  isPremium={isPremium}
/>
```

---

## Best Practices

✅ **DO:**
- Use type-safe API queries (hooks)
- Cache with TanStack Query
- Handle loading and error states
- Show progress for series/courses
- Auto-play next episode/lesson
- Lazy-load thumbnails

❌ **DON'T:**
- Mix content types in one component
- Hardcode API URLs
- Forget pagination for feeds
- Skip error handling
- Block UI on data load

---

## Reference

- **Video queries:** `src/api/queries/video.queries.ts`
- **Shorts queries:** `src/api/queries/shorts.queries.ts`
- **Series queries:** `src/api/queries/series.queries.ts`
- **Course queries:** `src/api/queries/course.queries.ts`
- **Post queries:** `src/api/queries/post.queries.ts`
