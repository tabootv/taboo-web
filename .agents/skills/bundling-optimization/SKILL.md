---
name: bundling-optimization
description: "Code splitting, lazy loading, dynamic imports, bundle analysis, performance optimization"
allowed-tools: Read, Write, Edit, Bash
version: 1.0
priority: HIGH
---

# Bundling & Performance Optimization – TabooTV

> **CORE GOAL:** Minimize JavaScript bundle, maximize performance, optimize Core Web Vitals.

---

## When to Use This Skill

**Trigger Keywords:**
- "Bundle is too large"
- "Optimize code splitting"
- "Lazy load component"
- "Analyze bundle size"
- "Improve performance"
- "Dynamic import"
- "Reduce Time to Interactive"

---

## Bundle Analysis

### Measure Current State

```bash
# Analyze bundle size
npm run measure:bundle

# Measure build time
npm run measure:build

# Measure HMR (hot reload) time
npm run measure:hmr

# Generate baseline for comparison
npm run measure:baseline

# Check JavaScript in browser DevTools
# Network tab → filter by .js → sort by size
```

### Current Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Bundle Size** | < 500KB | TBD |
| **FCP** | < 1.5s | TBD |
| **LCP** | < 2.5s | TBD |
| **CLS** | < 0.1 | TBD |

---

## Code Splitting Patterns

### Route-Based Splitting (Automatic)

Next.js automatically splits by route:

```typescript
// ✅ Each route is a separate bundle
// app/(main)/videos/page.tsx  → bundle for /videos route
// app/(main)/shorts/page.tsx  → bundle for /shorts route
// app/studio/page.tsx         → bundle for /studio route

// Users only download the bundle for the route they visit
```

### Component-Level Splitting

```typescript
// ✅ Lazy load heavy components
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(
  () => import('@/features/video/components/video-player'),
  { loading: () => <PlayerSkeleton /> }
);

const VideoComments = dynamic(
  () => import('@/features/video/components/video-comments'),
  { loading: () => <CommentsSkeleton /> }
);

// Use in page
export default function VideoDetail() {
  const [showComments, setShowComments] = useState(false);

  return (
    <div>
      <VideoPlayer videoId={videoId} />
      {showComments && <VideoComments videoId={videoId} />}
    </div>
  );
}
```

### Library Code Splitting

```typescript
// ❌ Don't import entire library
import { Chart } from 'recharts';

// ✅ Use dynamic import for heavy dependencies
const Chart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Chart })),
  { loading: () => <ChartSkeleton /> }
);

// ✅ Or use with ssr: false for browser-only libraries
const ShakaPlayer = dynamic(
  () => import('shaka-player'),
  { ssr: false }
);
```

---

## Dynamic Imports

```typescript
// ✅ Use for route-based features
const VideoStudio = dynamic(
  () => import('@/app/studio/page'),
  { loading: () => <LoadingPage /> }
);

// ✅ Use for on-demand utilities
async function handleExport() {
  // Only load when user clicks export
  const { exportToCSV } = await import('@/utils/export');
  exportToCSV(data);
}

// ✅ Use for large data processing
async function processVideo(file: File) {
  // Only load FFmpeg when needed
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  // ...
}
```

---

## Performance Optimization

### Image Optimization

```typescript
// ❌ Unoptimized
<img src="/videos/thumbnail.jpg" alt="video" />

// ✅ Optimized with Next.js Image
import Image from 'next/image';

<Image
  src="/videos/thumbnail.jpg"
  alt="video"
  width={320}
  height={180}
  priority={false}      // Lazy load by default
  loading="lazy"        // Browser lazy loading
  quality={75}          // Compress to 75% quality
  placeholder="blur"    // Show blur while loading
/>

// ✅ Responsive images
<Image
  src="/videos/thumbnail.jpg"
  alt="video"
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={false}
/>
```

### Script Optimization

```typescript
// ❌ Blocks rendering
<script src="/analytics.js"></script>

// ✅ Load after page interactive
import Script from 'next/script';

<Script
  src="/analytics.js"
  strategy="afterInteractive"
  onLoad={() => console.log('Analytics loaded')}
/>

// ✅ Worker script
<Script
  src="/worker.js"
  strategy="worker"
/>
```

### Component Optimization

```typescript
// ❌ Re-renders expensive child on every render
function VideoList({ videos }: Props) {
  return (
    <div>
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
      <ExpensiveWidget />  {/* Re-renders every time */}
    </div>
  );
}

// ✅ Memoize expensive components
import { memo } from 'react';

const ExpensiveWidget = memo(() => {
  // Only re-renders if props change
  return <div>{/* expensive render */}</div>;
});

function VideoList({ videos }: Props) {
  return (
    <div>
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
      <ExpensiveWidget />
    </div>
  );
}
```

### State Optimization

```typescript
// ❌ Triggers re-render of entire tree
function VideoDetail() {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);

  return (
    <div>
      <VideoPlayer video={video} />
      <VideoInfo video={video} />
      {isCommentsOpen && <VideoComments comments={comments} />}
    </div>
  );
}

// ✅ Split state by concern
function VideoDetail() {
  const [video] = useState(null);
  
  return (
    <div>
      <VideoPlayer video={video} />
      <VideoInfo video={video} />
      <CommentsSection videoId={video.id} />
    </div>
  );
}

// CommentsSection manages its own state (isOpen, comments)
function CommentsSection({ videoId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments] = useState([]);

  return isOpen && <VideoComments comments={comments} />;
}
```

---

## Next.js Specific Optimizations

### Static Generation (Preferred)

```typescript
// ✅ Generate at build time (fast)
export const revalidate = 3600; // revalidate every hour

export default function VideoDetail({ params }: Props) {
  const video = getVideoFromDB(params.id); // Called at build time
  return <VideoPage video={video} />;
}
```

### Incremental Static Regeneration (ISR)

```typescript
// ✅ Hybrid: static + on-demand updates
export const revalidate = 300; // Update every 5 minutes

export default function VideoPage({ params }: Props) {
  const video = getVideoFromDB(params.id);
  return <VideoPage video={video} />;
}

// Generates static pages for popular videos, updates periodically
```

### Server Components (Default)

```typescript
// ✅ By default, use server components (no JS sent to browser)
export default async function VideoDetail() {
  const video = await db.videos.findById(params.id);
  return <VideoPage video={video} />;
}

// ✅ Only use 'use client' when absolutely needed
'use client';

export default function InteractiveVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  return <>{/* interactive UI */}</>;
}
```

---

## Bundle Size Checklist

### Before Shipping

- [ ] Ran `npm run measure:bundle` and reviewed report
- [ ] Removed unused dependencies
- [ ] Dynamic imports for heavy components
- [ ] Lazy-loaded routes and features
- [ ] Images optimized with Next.js Image
- [ ] No `any` console.logs left in production code
- [ ] CSS is minified
- [ ] Source maps only in development

### Monitoring

```typescript
// Track bundle metrics
npm run measure:bundle -- --report

// Generate size report
npm run analyze-component

// Compare to baseline
npm run measure:baseline
```

---

## Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| Import entire library | Import only what you use |
| No code splitting | Split by route/feature |
| Eager load everything | Lazy load on-demand |
| Large components | Split into smaller pieces |
| Render all tabs | Render active tab only |
| Static assets | Optimized images |

---

## When Complete: Self-Check

- [ ] Ran bundle analysis
- [ ] No large chunks (> 200KB)
- [ ] Heavy components are lazy-loaded
- [ ] Images use Next.js Image
- [ ] No unused dependencies
- [ ] Build size decreased or stable
- [ ] Performance metrics improved

---

## Related Skills

- **ui-components** — Image optimization
- **code-organization** — File structure for splitting
- **vercel-react-best-practices** — Performance patterns
