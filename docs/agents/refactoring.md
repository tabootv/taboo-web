# Code Refactoring Guide

> **When to use:** Simplifying complex components, reducing code complexity, improving readability. Reducing technical debt.

---

## When to Refactor

### Signs Your Code Needs Refactoring

- Component file > 300 lines
- Component has multiple `useState` hooks (3+)
- Complex conditional rendering (deeply nested)
- Duplicated code across files
- Hard to name variables/functions
- Difficult to understand in one reading
- Multiple responsibilities

---

## Component Complexity Reduction

### Split Large Components

**Before:**
```tsx
// 400+ lines, handles data fetch, UI render, state management
export function VideoDetailPage({ videoId }: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  
  // ... 100 lines of logic ...
  
  return (
    <div>
      {/* ... complex JSX ... */}
    </div>
  );
}
```

**After:**
```tsx
// Split into focused components
import { VideoPlayer } from './_components/video-player';
import { VideoInfo } from './_components/video-info';
import { CommentSection } from './_components/comment-section';

export function VideoDetailPage({ videoId }: Props) {
  return (
    <div className="space-y-8">
      <VideoPlayer videoId={videoId} />
      <VideoInfo videoId={videoId} />
      <CommentSection videoId={videoId} />
    </div>
  );
}
```

**Files:**
```
_components/
├── video-player.tsx      (100 lines)
├── video-info.tsx        (80 lines)
└── comment-section.tsx   (120 lines)
```

---

## Hook Extraction

### Before (Mixed Logic)
```tsx
export function VideoCard({ video }: Props) {
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleLike = async () => {
    setIsLoading(true);
    try {
      await videoClient.toggleLike(video.id);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button onClick={toggleLike} disabled={isLoading}>
      {isLiked ? '❤️' : '🤍'} {likeCount}
    </button>
  );
}
```

### After (Extract Hook)
```tsx
// hooks/useLike.ts
export function useLike(videoId: string, initialLiked: boolean) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleLike = async () => {
    setIsLoading(true);
    try {
      await videoClient.toggleLike(videoId);
      setIsLiked(!isLiked);
      setLikeCount(c => isLiked ? c - 1 : c + 1);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { isLiked, likeCount, isLoading, toggleLike };
}

// Component
export function VideoCard({ video }: Props) {
  const { isLiked, likeCount, isLoading, toggleLike } = useLike(
    video.id,
    video.isLiked
  );
  
  return (
    <button onClick={toggleLike} disabled={isLoading}>
      {isLiked ? '❤️' : '🤍'} {likeCount}
    </button>
  );
}
```

---

## Conditional Rendering Simplification

### Before (Deeply Nested)
```tsx
export function UserProfile() {
  const { user, isLoading, error } = useUser();
  
  if (isLoading) {
    return <Spinner />;
  }
  
  if (error) {
    return <ErrorState error={error} />;
  }
  
  if (!user) {
    return <p>No user</p>;
  }
  
  return (
    <div>
      {user.isPremium ? (
        <div>
          {user.subscription.isActive ? (
            <p>Premium active</p>
          ) : (
            <p>Premium expired</p>
          )}
        </div>
      ) : (
        <button>Upgrade</button>
      )}
    </div>
  );
}
```

### After (Extract Helper Components)
```tsx
function PremiumStatus({ user }: { user: User }) {
  if (!user.isPremium) {
    return <button>Upgrade to Premium</button>;
  }
  
  return (
    <p>
      {user.subscription.isActive
        ? 'Premium active'
        : 'Premium expired'}
    </p>
  );
}

export function UserProfile() {
  const { user, isLoading, error } = useUser();
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} />;
  if (!user) return <p>No user</p>;
  
  return <PremiumStatus user={user} />;
}
```

---

## Code Duplication Elimination

### Before (Repeated)
```tsx
function VideoCard({ video }: Props) {
  const { data, isLoading, error } = useVideo(video.id);
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorCard />;
  
  return <div>{data.title}</div>;
}

function SeriesCard({ series }: Props) {
  const { data, isLoading, error } = useSeries(series.id);
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorCard />;
  
  return <div>{data.title}</div>;
}
```

### After (Extract Component)
```tsx
interface LoadableCardProps<T> {
  data?: T;
  isLoading: boolean;
  error?: Error;
  render: (data: T) => React.ReactNode;
}

function LoadableCard<T>({
  data,
  isLoading,
  error,
  render,
}: LoadableCardProps<T>) {
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorCard />;
  if (!data) return <p>No data</p>;
  
  return <>{render(data)}</>;
}

// Usage
<LoadableCard
  data={video}
  isLoading={isVideoLoading}
  error={videoError}
  render={(v) => <div>{v.title}</div>}
/>
```

---

## Tips & Tools

### useCallback for Expensive Operations
```tsx
// Before: re-creates function on every render
const handleFilter = (type: string) => {
  setFilter(type);
};

// After: memoized, stable reference
const handleFilter = useCallback((type: string) => {
  setFilter(type);
}, []);
```

### useMemo for Expensive Calculations
```tsx
// Before: recalculates every render
const filteredVideos = videos
  .filter(v => v.type === filter)
  .sort((a, b) => b.views - a.views);

// After: only recalculates if videos or filter changes
const filteredVideos = useMemo(
  () => videos
    .filter(v => v.type === filter)
    .sort((a, b) => b.views - a.views),
  [videos, filter]
);
```

---

## Refactoring Checklist

- [ ] Identify responsibility (should do one thing)
- [ ] Extract helper components (<200 lines each)
- [ ] Extract custom hooks (reusable logic)
- [ ] Simplify conditional rendering
- [ ] Remove duplicate code
- [ ] Use memoization where needed
- [ ] Add TypeScript for safety
- [ ] Write tests
- [ ] Verify performance (no regressions)

---

## Best Practices

✅ **DO:**
- Keep components < 300 lines
- Extract when code repeats twice
- One responsibility per component
- Extract hooks for complex logic
- Use TypeScript for contracts
- Test refactored code

❌ **DON'T:**
- Over-engineer (YAGNI principle)
- Extract too early (wait for duplication)
- Create deep component hierarchies
- Over-use memoization
- Forget to test after refactoring

---

## Reference

- **Extracting components:** https://react.dev/learn/passing-props-to-a-component
- **Custom hooks:** https://react.dev/learn/reusing-logic-with-custom-hooks
- **Performance optimization:** https://react.dev/reference/react/useMemo
