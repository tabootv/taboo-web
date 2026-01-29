---
name: typescript-patterns
description: "Type system best practices: strict mode, utility types, generics, interface design, never use any"
allowed-tools: Read, Write, Edit, Bash
version: 1.0
priority: CRITICAL
---

# TypeScript Patterns – Type Safety for TabooTV

> **CORE GOAL:** Leverage TypeScript's type system to catch errors at compile time, not runtime.

---

## When to Use This Skill

**Trigger Keywords:**
- "Fix TypeScript error"
- "Type this component"
- "Create interface for X"
- "Type-safe API client"
- "Strict mode issues"
- "Create generic function"
- "Type guard needed"

---

## Strict Mode Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "useDefineForClassFields": true
  }
}
```

**Rule:** ❌ **NEVER use `any` type.** Use `unknown` if necessary.

---

## Type Patterns

### Component Props

```typescript
// ✅ Correct
interface VideoCardProps {
  video: Video;
  isLoading?: boolean;
  onClick?: () => void;
}

function VideoCard({ video, isLoading, onClick }: VideoCardProps) {
  // ...
}

// ❌ Wrong
function VideoCard(props: any) {
  // ...
}

// ❌ Wrong (implicit any)
function VideoCard({ video, isLoading, onClick }) {
  // ...
}
```

### API Response Types

```typescript
// ✅ Correct
interface APIResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

interface Video {
  id: string;
  title: string;
  duration: number;
  createdAt: string;
}

type GetVideoResponse = APIResponse<Video>;
type GetVideosResponse = APIResponse<Video[]>;

// Usage
const response: GetVideoResponse = await fetch('/api/videos/1');
// response.data is typed as Video
// response.error is optional string
```

### Function Return Types

```typescript
// ✅ Explicit return type
function getUserName(user: User | null): string {
  return user?.name ?? 'Anonymous';
}

// ✅ For async
async function fetchVideo(id: string): Promise<Video> {
  return api.get(`/videos/${id}`);
}

// ❌ Implicit return type (avoid)
function getUserName(user) {
  return user?.name ?? 'Anonymous';
}
```

---

## Utility Types

### Common Patterns

```typescript
// Extract type from array
type Video = APIResponse<Video[]>['data'][number];

// Make all properties optional
type PartialVideo = Partial<Video>;

// Make all properties required
type RequiredVideo = Required<Video>;

// Pick specific properties
type VideoPreview = Pick<Video, 'id' | 'title' | 'thumbnailUrl'>;

// Omit specific properties
type VideoWithoutContent = Omit<Video, 'content' | 'playlistUrl'>;

// Union to discriminator
type Status = 'loading' | 'success' | 'error';
type State = { status: 'loading' } | { status: 'success'; data: Video } | { status: 'error'; error: Error };

// Record for object types
type VideoMap = Record<string, Video>;
const videos: VideoMap = { 'video-1': {...} };

// Exclude/Extract
type VideoWithId = Extract<VideoData, { id: string }>;
type NonVideo = Exclude<VideoData, Video>;
```

---

## Generic Functions

```typescript
// ✅ Generic API client
async function apiRequest<T>(
  method: 'GET' | 'POST',
  url: string,
  data?: unknown
): Promise<T> {
  const response = await fetch(url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json() as T;
}

// Usage - return type is inferred
const video: Video = await apiRequest<Video>('GET', '/api/videos/1');

// ✅ Generic list component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage - T is inferred from items
<List<Video>
  items={videos}
  renderItem={(video) => <VideoCard video={video} />}
  keyExtractor={(video) => video.id}
/>
```

---

## Type Guards & Narrowing

```typescript
// ✅ Type guard function
function isVideo(obj: unknown): obj is Video {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string'
  );
}

// Usage - TypeScript narrows type
function handleData(data: unknown) {
  if (isVideo(data)) {
    // data is now typed as Video
    console.log(data.title);
  }
}

// ✅ Discriminated unions
type State = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Video }
  | { status: 'error'; error: Error };

function renderState(state: State) {
  switch (state.status) {
    case 'idle':
      return <div>Ready</div>;
    case 'loading':
      return <div>Loading...</div>;
    case 'success':
      // state.data is available here
      return <VideoCard video={state.data} />;
    case 'error':
      // state.error is available here
      return <ErrorBoundary error={state.error} />;
  }
}
```

---

## Object Typing

```typescript
// ❌ Too loose
function updateVideo(video: any) {}

// ❌ Loose
function updateVideo(video: { [key: string]: any }) {}

// ✅ Specific
interface VideoUpdate {
  title: string;
  description?: string;
  duration?: number;
}

function updateVideo(id: string, update: VideoUpdate): Promise<Video> {
  return api.patch(`/videos/${id}`, update);
}

// ✅ Nested objects
interface User {
  id: string;
  profile: {
    name: string;
    email: string;
    avatar?: {
      url: string;
      width: number;
      height: number;
    };
  };
}
```

---

## Error Handling

```typescript
// ✅ Typed errors
class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ✅ Error boundaries with types
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
  fallback?: (error: Error) => React.ReactNode;
}

function useAsyncError<T>(
  fn: () => Promise<T>
): { data?: T; error?: Error; isLoading: boolean } {
  const [state, setState] = useState<{
    data?: T;
    error?: Error;
    isLoading: boolean;
  }>({ isLoading: true });

  useEffect(() => {
    fn()
      .then((data) => setState({ data, isLoading: false }))
      .catch((error) => setState({ error, isLoading: false }));
  }, [fn]);

  return state;
}
```

---

## Constants & Enums

```typescript
// ✅ Const assertion (preferred over enum)
const VIDEO_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  PROCESSING: 'processing',
} as const;

type VideoStatus = (typeof VIDEO_STATUS)[keyof typeof VIDEO_STATUS];
// VideoStatus = 'active' | 'archived' | 'processing'

// ✅ Type-safe status checking
function isVideoActive(status: VideoStatus): status is 'active' {
  return status === VIDEO_STATUS.ACTIVE;
}

// ✅ Const arrays with typed elements
const VIDEO_QUALITIES = ['360p', '720p', '1080p', '4K'] as const;
type VideoQuality = (typeof VIDEO_QUALITIES)[number];
// VideoQuality = '360p' | '720p' | '1080p' | '4K'
```

---

## When Complete: Self-Check

- [ ] No `any` types (use `unknown` if necessary)
- [ ] All function return types are explicit
- [ ] Component props have interfaces
- [ ] Error types are specific (not `Error`)
- [ ] API responses are typed
- [ ] Type-check passes: `npm run type-check`
- [ ] No unused type imports
- [ ] Generic functions have proper constraints

---

## Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `any` type | `unknown` type |
| Implicit return type | Explicit return type |
| `{[key: string]: any}` | Specific interface |
| Mixed union | Discriminated union |
| `as any` cast | Proper type guard |
| Loose object types | Strict interfaces |

---

## Related Skills

- **api-integration** — Typing API responses
- **ui-components** — Typing component props
- **testing** — Typing test fixtures
