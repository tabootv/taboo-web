# TabooTV Project - Complete Context Documentation

> **Single source of truth** for all project knowledge, architecture decisions, patterns, and implementation details.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [API Layer](#api-layer)
4. [State Management](#state-management)
5. [Design System](#design-system)
6. [Content Types](#content-types)
7. [Key Features & Patterns](#key-features--patterns)
8. [Development Workflow](#development-workflow)
9. [Best Practices & Patterns](#best-practices--patterns)
10. [Migration Guides](#migration-guides)
11. [Testing & Quality](#testing--quality)
12. [Deployment & Infrastructure](#deployment--infrastructure)

---

## Project Overview

### What is TabooTV?

TabooTV is a **premium video streaming platform** frontend built with modern web technologies. It connects to a Laravel backend API and supports multiple content types:

- **Videos**: Long-form content with HLS streaming and quality selection
- **Shorts**: TikTok-style vertical videos with infinite scroll feed
- **Series**: Multi-episode collections with Netflix-style layout
- **Courses**: Educational series with structured lessons and progress tracking
- **Community Posts**: Social feed with text, images, and engagement

### Core Features

- 🎬 **Video Streaming**: HLS/MP4 playback with Shaka Player, quality selection, playback speed control
- 📱 **Shorts Feed**: Vertical video feed with swipe navigation
- 📺 **Series & Courses**: Episode-based content with auto-play support
- 👥 **Creator Studio**: Content management dashboard for creators
- 💬 **Community**: Social feed with posts, comments, likes
- 🔐 **Authentication**: Email/password and Firebase OAuth (Google/Apple)
- 💳 **Subscriptions**: Premium content access with subscription management
- 🔍 **Search**: Full-text search across all content types
- 📊 **Analytics**: Creator dashboard with content statistics

### Tech Stack Summary

| Technology         | Version | Purpose                         |
| ------------------ | ------- | ------------------------------- |
| **Next.js**        | 16.1.1  | React framework with App Router |
| **React**          | 19.2.0  | UI library                      |
| **TypeScript**     | 5.x     | Type safety                     |
| **Tailwind CSS**   | 4.x     | Utility-first styling           |
| **TanStack Query** | 5.90.12 | Server state management         |
| **Zustand**        | 5.0.9   | Client state management         |
| **Axios**          | 1.13.2  | HTTP client                     |
| **Shaka Player**   | 4.16.11 | HLS video playback              |
| **Vitest**         | 4.0.16  | Unit testing                    |

---

## Architecture

### Tech Stack Details

#### Frontend Framework

- **Next.js 16** with App Router
  - Server Components by default
  - Client Components with `'use client'` directive
  - Route groups: `(main)`, `(auth)`, `(studio)`, `(subscription)`
  - API route proxying to backend

#### State Management

- **TanStack Query** (React Query) for server state
  - Automatic caching and refetching
  - Optimistic updates for mutations
  - Infinite queries for pagination
  - Domain-specific stale times
- **Zustand** for client state
  - UI state (sidebar, modals)
  - Client-side preferences
  - Local persistence with localStorage

#### Styling

- **Tailwind CSS 4** with custom design tokens
- **CSS Variables** for theming
- **Design System** components in `src/components/ui/`
- **Atmospheric backgrounds** for premium feel

#### Video Playback

- **Shaka Player** for HLS streaming
- Quality selection (1440p → 1080p → 720p → etc.)
- Playback speed control (0.5x - 2x)
- Picture-in-Picture support
- Keyboard shortcuts
- Video preview thumbnails on seek bar

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Main app pages with navbar
│   │   ├── home/         # Homepage with sections
│   │   ├── videos/       # Video listing and detail
│   │   ├── series/       # Series listing and player
│   │   ├── courses/      # Courses listing and player
│   │   ├── shorts/       # Shorts feed
│   │   ├── community/    # Community posts
│   │   ├── profile/      # User profile
│   │   ├── search/       # Search results
│   │   └── ...
│   ├── (auth)/           # Auth pages without main layout
│   │   ├── sign-in/     # Login
│   │   ├── sign-up/      # Registration
│   │   ├── plans/        # Subscription plans
│   │   └── ...
│   ├── (studio)/         # Creator studio pages
│   │   └── studio/       # Dashboard, upload, analytics
│   ├── api/              # Next.js API routes (proxies)
│   └── layout.tsx        # Root layout with providers
│
├── api/                   # NEW: TanStack Query API layer
│   ├── client/           # Domain-specific API clients
│   │   ├── base-client.ts      # Axios wrapper with auth
│   │   ├── auth.client.ts      # Authentication
│   │   ├── video.client.ts     # Videos
│   │   ├── series.client.ts    # Series
│   │   ├── courses.client.ts   # Courses
│   │   ├── posts.client.ts     # Community posts
│   │   ├── home.client.ts      # Home feed
│   │   ├── creators.client.ts  # Creators
│   │   ├── search.client.ts     # Search
│   │   ├── studio.client.ts    # Creator studio
│   │   └── ...
│   ├── queries/          # TanStack Query hooks
│   │   ├── video.queries.ts
│   │   ├── series.queries.ts
│   │   └── ...
│   ├── mutations/        # Mutation hooks
│   │   ├── video.mutations.ts
│   │   ├── auth.mutations.ts
│   │   └── ...
│   ├── query-keys.ts     # Centralized query key factories
│   └── types/            # API-specific types
│
├── components/            # React components
│   ├── ui/              # Design system components
│   │   ├── page-header.tsx
│   │   ├── media-card.tsx
│   │   ├── filter-chips.tsx
│   │   ├── content-grid.tsx
│   │   └── ...
│   ├── layout/           # Layout components
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── home/            # Homepage sections
│   │   ├── banner-slider.tsx
│   │   ├── featured-section.tsx
│   │   ├── netflix-hover-card.tsx
│   │   └── ...
│   ├── video/           # Video player components
│   │   ├── video-player.tsx
│   │   ├── shaka-player.tsx
│   │   └── ...
│   ├── shorts/          # Shorts feed components
│   └── ...
│
├── lib/                  # Utilities and legacy code
│   ├── api/             # Legacy API (being migrated)
│   │   ├── client.ts    # Axios instance
│   │   ├── endpoints.ts # API endpoints
│   │   └── studio.ts    # Studio APIs
│   ├── stores/          # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── shorts-store.ts
│   │   ├── watchlist-store.ts
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   ├── utils.ts         # Utility functions
│   └── design-tokens.ts # Design system tokens
│
├── shared/               # Shared infrastructure
│   ├── components/      # Shared components
│   │   ├── providers/   # QueryProvider, etc.
│   │   └── error-boundary.tsx
│   └── lib/             # Shared utilities
│       ├── query-client.ts
│       └── config/
│
└── types/                # TypeScript type definitions
    └── index.ts
```

### API Layer Architecture

#### New API Structure (`src/api/`)

The new API layer uses **TanStack Query** for type-safe, cached API calls:

```
src/api/
├── client/              # HTTP clients (domain-specific)
├── queries/              # Query hooks (useVideo, useSeriesList, etc.)
├── mutations/            # Mutation hooks (useLogin, useToggleLike, etc.)
├── query-keys.ts         # Centralized query key factories
└── types/               # API response types
```

**Benefits:**

- ✅ Type-safe API calls
- ✅ Automatic caching and refetching
- ✅ Optimistic updates
- ✅ Built-in loading/error states
- ✅ Infinite query support

#### Legacy API Structure (`src/lib/api/`)

The legacy API is being migrated to the new structure:

```
src/lib/api/
├── client.ts            # Axios instance with interceptors
├── endpoints.ts         # All API calls (organized by domain)
└── studio.ts           # Creator studio APIs
```

**Migration Status:**

- ✅ Videos, Series, Courses → Migrated
- ✅ Auth, Posts, Home → Migrated
- ⚠️ Studio → Partially migrated
- ⚠️ Some legacy endpoints still in use

### State Management Patterns

#### Server State (TanStack Query)

```typescript
// Query example
const { data, isLoading } = useVideo(id);

// Infinite query example
const { data, fetchNextPage, hasNextPage } = useVideoList({
  short: false,
  per_page: 24,
});

// Mutation example
const toggleLike = useToggleLike();
toggleLike.mutate(videoId);
```

#### Client State (Zustand)

```typescript
// Auth store (persisted)
const { user, isAuthenticated, login } = useAuthStore();

// UI state (not persisted)
const { isExpanded, toggleExpanded } = useSidebarStore();
```

---

## API Layer

### Base Client

The base API client (`src/api/client/base-client.ts`) provides:

- **Axios wrapper** with consistent error handling
- **Auth token interceptor** (reads from cookies)
- **401/403 error handling** (redirects to login/plans)
- **Request/response interceptors**
- **Type-safe methods** (get, post, put, patch, delete)

**Key Features:**

- Token stored in cookies (`tabootv_token`)
- Automatic token injection in requests
- 401 → redirect to `/sign-in`
- 403 with subscription message → redirect to `/plans`
- API proxy via Next.js rewrites (`/api/*` → backend)

### Domain Clients

Each domain has its own client:

| Client                | File                      | Purpose                             |
| --------------------- | ------------------------- | ----------------------------------- |
| `authClient`          | `auth.client.ts`          | Login, register, user profile       |
| `videoClient`         | `video.client.ts`         | Videos, likes, bookmarks, comments  |
| `seriesClient`        | `series.client.ts`        | Series, episodes, trailers          |
| `coursesClient`       | `courses.client.ts`       | Courses, lessons, progress          |
| `postsClient`         | `posts.client.ts`         | Community posts, comments           |
| `homeClient`          | `home.client.ts`          | Home feed (banners, featured, etc.) |
| `creatorsClient`      | `creators.client.ts`      | Creator profiles, content           |
| `searchClient`        | `search.client.ts`        | Search across all content           |
| `studioClient`        | `studio.client.ts`        | Creator dashboard, uploads          |
| `subscriptionsClient` | `subscriptions.client.ts` | Plans, subscription status          |

### Query Keys

Centralized query key factory (`src/api/query-keys.ts`):

```typescript
queryKeys.videos.detail('123');
// → ['videos', 'detail', '123']

queryKeys.videos.list({ page: 1, per_page: 24 });
// → ['videos', 'list', { page: 1, per_page: 24 }]

queryKeys.series.detail(456);
// → ['series', 'detail', '456']
```

**Structure:**

- Hierarchical keys (domain → action → params)
- Type-safe with TypeScript
- Easy invalidation and refetching

### Query Hooks

**Video Queries** (`src/api/queries/video.queries.ts`):

- `useVideo(id)` - Get single video
  ```typescript
  const { data, isLoading } = useVideo(id);
  // Stale time: 30 minutes
  ```
- `useVideoList(filters)` - Get video list (infinite)
  ```typescript
  const { data, fetchNextPage, hasNextPage } = useVideoList({
    short: false,
    per_page: 24,
  });
  // Stale time: 10 minutes
  ```
- `useLongFormVideos(page, perPage)` - Long-form only
- `useRelatedVideos(videoId, page, perPage)` - Related videos
- `useVideoComments(id, page)` - Video comments

**Series Queries:**

- `useSeriesList(params)` - Series list
- `useSeriesDetail(id)` - Series detail
- `useSeriesTrailer(id)` - Series trailer
- `useSeriesPlay(uuid)` - Series play data

**Auth Queries:**

- `useMe()` - Current user

### Mutation Hooks

**Video Mutations** (`src/api/mutations/video.mutations.ts`):

- `useToggleLike()` - Toggle like (optimistic update)
  ```typescript
  const toggleLike = useToggleLike();
  toggleLike.mutate(videoId);
  // Automatically updates UI immediately, reverts on error
  ```
- `useToggleDislike()` - Toggle dislike (optimistic)
- `useToggleBookmark()` - Toggle bookmark (optimistic)
- `useAddComment()` - Add comment
- `useToggleAutoplay()` - Toggle autoplay preference

**Optimistic Updates Pattern:**

```typescript
// Example from useToggleLike()
onMutate: async (videoId) => {
  // Cancel outgoing queries
  await queryClient.cancelQueries({ queryKey: queryKeys.videos.detail(videoId) });

  // Snapshot previous value
  const previous = queryClient.getQueryData<Video>(queryKeys.videos.detail(videoId));

  // Optimistically update
  if (previous) {
    queryClient.setQueryData(queryKeys.videos.detail(videoId), {
      ...previous,
      has_liked: !previous.has_liked,
      likes_count: previous.has_liked ? previous.likes_count - 1 : previous.likes_count + 1,
    });
  }

  return { previous };
},
onError: (_err, videoId, context) => {
  // Revert on error
  if (context?.previous) {
    queryClient.setQueryData(queryKeys.videos.detail(videoId), context.previous);
  }
},
```

**Auth Mutations:**

- `useLogin()` - Login
- `useRegister()` - Register
- `useFirebaseLogin()` - Firebase OAuth
- `useLogout()` - Logout

**Post Mutations:**

- `useCreatePost()` - Create post
- `useLikePost()` - Like post (optimistic)
- `useDeletePost()` - Delete post

### API Proxy Configuration

All `/api/*` requests are proxied to the backend via Next.js rewrites:

```typescript
// next.config.ts
async rewrites() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app.taboo.tv/api';
  return [
    {
      source: '/api/:path*',
      destination: `${apiUrl}/:path*`,
    },
  ];
}
```

**Benefits:**

- No CORS issues
- Single API URL configuration
- Works in both dev and production

---

## State Management

### Zustand Stores

#### Auth Store (`src/lib/stores/auth-store.ts`)

**Purpose:** User authentication and subscription status

**State:**

- `user: User | null` - Current user
- `isSubscribed: boolean` - Subscription status
- `isAuthenticated: boolean` - Auth state
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message

**Actions:**

- `login(credentials)` - Email/password login
- `register(data)` - User registration
- `firebaseLogin(data)` - Firebase OAuth
- `logout()` - Logout
- `fetchUser()` - Fetch current user
- `updateUser(user)` - Update user data
- `setSubscribed(subscribed)` - Update subscription status

**Persistence:** localStorage (`tabootv-auth`)

#### Shorts Store (`src/lib/stores/shorts-store.ts`)

**Purpose:** Shorts feed state and navigation

**State:**

- `videos: Video[]` - Shorts videos
- `currentIndex: number` - Current video index
- `isMuted: boolean` - Mute state
- `volume: number` - Volume level
- `showComments: boolean` - Comments visibility
- `commentList: Comment[]` - Comments

**Actions:**

- `fetchVideos(initialUuid?)` - Load shorts feed
- `loadMore()` - Load more videos
- `setCurrentIndex(index)` - Navigate to video
- `toggleMute()` - Toggle mute
- `prependVideo(video)` - Add video to start

#### Watchlist Store (`src/lib/stores/watchlist-store.ts`)

**Purpose:** User's saved videos/series/courses

**State:**

- `items: WatchlistItem[]` - Saved items
- `isLoading: boolean` - Loading state

**Actions:**

- `addItem(item)` - Add to watchlist
- `removeItem(id, type)` - Remove from watchlist
- `clearAll()` - Clear watchlist

**Persistence:** localStorage

#### Sidebar Store (`src/lib/stores/sidebar-store.ts`)

**Purpose:** Navigation sidebar state

**State:**

- `isExpanded: boolean` - Desktop expanded state
- `isMobileOpen: boolean` - Mobile open state

**Actions:**

- `setExpanded(expanded)` - Set expanded state
- `toggleExpanded()` - Toggle expanded
- `setMobileOpen(open)` - Set mobile open
- `toggleMobileOpen()` - Toggle mobile

**Persistence:** localStorage (expanded state only)

#### Live Chat Store (`src/lib/stores/live-chat-store.ts`)

**Purpose:** Real-time chat messages

**State:**

- `isOpen: boolean` - Chat visibility
- `messages: ChatMessage[]` - Chat messages
- `platformUsersCount: number` - Online users

**Actions:**

- `toggle()` - Toggle chat
- `fetchMessages()` - Load messages
- `sendMessage(content)` - Send message
- `appendMessage(message)` - Add message

#### Saved Videos Store (`src/lib/stores/saved-videos-store.ts`)

**Purpose:** Bookmarked videos

**State:**

- `videos: Video[]` - Saved videos

**Actions:**

- `addVideo(video)` - Add video
- `removeVideo(id)` - Remove video
- `clearAll()` - Clear all

**Persistence:** localStorage

#### Studio Sidebar Store (`src/lib/stores/studio-sidebar-store.ts`)

**Purpose:** Creator studio sidebar state

Similar to main sidebar store but for studio pages.

### Store Usage Patterns

```typescript
// Auth store (persisted)
import { useAuthStore } from '@/lib/stores';

const { user, isAuthenticated, login } = useAuthStore();

// UI state (not persisted)
import { useSidebarStore } from '@/lib/stores';

const { isExpanded, toggleExpanded } = useSidebarStore();
```

---

## Design System

### Color Palette

#### Taboo Red (Brand Colors)

| Token   | Hex       | CSS Variable    | Usage                    |
| ------- | --------- | --------------- | ------------------------ |
| Primary | `#ab0013` | `--red-primary` | Primary actions, accents |
| Hover   | `#d4001a` | `--red-hover`   | Hover states             |
| Dark    | `#8a0010` | `--red-dark`    | Pressed states           |
| Deep    | `#7a000e` | `--red-deep`    | Gradients                |

#### Background Colors

| Token         | Hex       | CSS Variable      | Usage            |
| ------------- | --------- | ----------------- | ---------------- |
| Background    | `#000000` | `--bg`            | Page background  |
| Surface       | `#0d0d0d` | `--surface`       | Cards, modals    |
| Surface Hover | `#161616` | `--surface-hover` | Hover states     |
| Card          | `#131315` | `--color-card`    | Card backgrounds |
| Border        | `#1f1f1f` | `--border`        | Default borders  |

#### Text Colors

| Token     | Hex       | Usage                   |
| --------- | --------- | ----------------------- |
| Primary   | `#e6e7ea` | Headlines, primary text |
| Secondary | `#9aa0a6` | Descriptions, metadata  |
| Tertiary  | `#6b7280` | Timestamps, hints       |
| Muted     | `#4b5563` | Disabled text           |

**Design Tokens File:** `src/lib/design-tokens.ts`

### Typography

#### Font Scale (Major Third - 1.25 ratio)

| Token         | Size | rem      | Usage                   |
| ------------- | ---- | -------- | ----------------------- |
| `--text-xs`   | 12px | 0.75rem  | Captions, timestamps    |
| `--text-sm`   | 14px | 0.875rem | Body small, metadata    |
| `--text-base` | 16px | 1rem     | Body text (default)     |
| `--text-lg`   | 18px | 1.125rem | Large body, card titles |
| `--text-xl`   | 20px | 1.25rem  | Section titles          |
| `--text-2xl`  | 24px | 1.5rem   | Page titles (mobile)    |
| `--text-3xl`  | 30px | 1.875rem | Page titles (desktop)   |
| `--text-4xl`  | 36px | 2.25rem  | Hero titles (mobile)    |
| `--text-5xl`  | 48px | 3rem     | Hero titles (desktop)   |

#### Typography Classes

```html
<!-- Hero titles -->
<h1 class="title-hero">Featured Content</h1>

<!-- Page titles -->
<h1 class="title-page">Videos</h1>

<!-- Section titles -->
<h2 class="title-section">Popular This Week</h2>

<!-- Card titles -->
<h3 class="title-card">Video Title</h3>

<!-- Body text -->
<p class="body-large">Description text</p>
<p class="body-base">Regular text</p>
<p class="body-small">Metadata text</p>

<!-- Labels & Captions -->
<span class="label">CATEGORY</span>
<span class="caption">2 hours ago</span>
```

**Font Family:** Figtree (Google Fonts)

### Spacing

#### Spacing Scale

| Token | Value | Usage           |
| ----- | ----- | --------------- |
| 0     | 0px   | None            |
| 1     | 4px   | Tight gaps      |
| 2     | 8px   | Icon gaps       |
| 3     | 12px  | Small padding   |
| 4     | 16px  | Default padding |
| 6     | 24px  | Card padding    |
| 8     | 32px  | Section gaps    |
| 10    | 40px  | Large gaps      |
| 12    | 48px  | XL gaps         |
| 16    | 64px  | Section spacing |

#### Page Spacing

- **Horizontal Padding:** 16px (mobile) → 24px (tablet) → 32px (desktop)
- **Max Content Width:** 1400px (default), 800px (narrow), 1600px (wide)
- **Section Gap:** 40px between major sections
- **Header to Content Gap:** 32px

### Component Library

#### PageHeader

Unified page header with optional back button and filters.

**File:** `src/components/ui/page-header.tsx`

```tsx
import { PageHeader } from '@/components/ui';

<PageHeader
  title="Videos"
  subtitle="Browse all videos"
  backHref="/home"
  actions={<FilterChips options={filters} selected={filter} onSelect={setFilter} />}
/>;
```

**Props:**

- `title` (string): Main title
- `subtitle?` (string): Optional subtitle
- `backHref?` (string): Back navigation link
- `onBack?` (function): Custom back button handler
- `icon?` (ReactNode): Optional icon before title
- `actions?` (ReactNode): Filter/action slot
- `variant?` ('default' | 'large' | 'hero'): Title size
- `className?` (string): Additional classes

**Variants:**

- `default`: Uses `title-page` class
- `large`: Uses `title-hero` class
- `hero`: Uses `title-hero gradient-text` class

#### FilterChips

Consistent filter pills across pages.

```tsx
import { FilterChips } from '@/components/ui';

<FilterChips
  options={[
    { id: 'all', label: 'All' },
    { id: 'popular', label: 'Popular' },
    { id: 'recent', label: 'Recent' },
  ]}
  selected="all"
  onSelect={(id) => setFilter(id)}
  variant="default" // or 'pills', 'underline'
/>;
```

#### MediaCard

Unified card for videos, shorts, and series.

```tsx
import { MediaCard } from '@/components/ui';

<MediaCard
  id={1}
  uuid="abc123"
  type="video" // or 'short', 'series'
  title="Amazing Video"
  thumbnail="/thumb.jpg"
  duration={320}
  views={15000}
  channel={{
    name: 'Creator',
    slug: 'creator',
    avatar: '/avatar.jpg',
  }}
  isNsfw={false}
  isPremium={false}
/>;
```

#### ContentGrid

Responsive grid for content layout.

```tsx
import { ContentGrid } from '@/components/ui';

<ContentGrid variant="media">
  {videos.map((video) => (
    <MediaCard key={video.id} {...video} />
  ))}
</ContentGrid>;
```

**Variants:**

- `media`: 1 → 2 → 3 → 4 → 5 columns
- `creator`: 1 → 2 → 3 → 4 columns
- `series`: 1 → 2 → 3 → 4 columns
- `shorts`: 2 → 3 → 4 → 5 → 6 columns
- `posts`: 1 column (feed layout)

### Atmospheric Backgrounds

Premium feel with gradient overlays:

```tsx
<div className="series-page-atmosphere min-h-screen">
  <div className="series-atmosphere-bg" />
  {/* Content */}
</div>
```

**Available Atmospheres:**

- `.series-page-atmosphere` + `.series-atmosphere-bg` - Series/Videos pages
- `.creators-page-atmosphere` + `.creators-atmosphere-bg` - Creator pages
- `.studio-page-atmosphere` + `.studio-atmosphere-bg` - Studio pages

### Netflix-Style Hover Cards

**Pattern:** Overflow Expansion Pattern

**Key Techniques:**

1. **Padding-Margin Compensation:** Reserve space for expansion
   ```tsx
   className = 'flex gap-4 pt-16 -mt-16 pb-40 -mb-32';
   ```
2. **Overflow Visible:** Allow content to overflow container
   ```css
   .netflix-scroll-container {
     overflow: visible !important;
   }
   ```
3. **Z-Index Stacking:** Use `:has()` selector to raise section
   ```css
   section:has(.netflix-card-wrapper:hover) {
     z-index: 50;
   }
   ```
4. **Transform Origin:** Control expansion direction for edge cards
   ```tsx
   transformOrigin: index === 0 ? 'left center' : 'right center';
   ```

**Full Documentation:** See `docs/NETFLIX-HOVER-CARD-PATTERN.md`

---

## Content Types

### Videos

**Long-form content** with HLS streaming support.

**Features:**

- HLS streaming with quality selection
- Multiple quality options (1440p, 1080p, 720p, etc.)
- Playback speed control (0.5x - 2x)
- Picture-in-Picture
- Keyboard shortcuts
- Video preview thumbnails on seek bar
- Comments, likes, bookmarks

**Routes:**

- `/videos` - Video listing
- `/video-player/[uuid]` - Video player page

**API:**

- `GET /videos` - List videos
- `GET /videos/{id}` - Video detail
- `GET /videos/play/{uuid}` - Play video
- `POST /videos/{id}/like` - Toggle like
- `POST /videos/{id}/bookmark` - Toggle bookmark

### Shorts

**TikTok-style vertical videos** with infinite scroll feed.

**Features:**

- Vertical video feed (9:16 aspect ratio)
- Infinite scroll with pagination
- Swipe navigation
- Comments overlay
- Like/dislike
- Share functionality

**Routes:**

- `/shorts` - Shorts feed

**API:**

- `GET /v2/shorts` - Shorts feed (V2 API)
- `GET /v2/shorts/{uuid}` - Short detail
- `POST /v2/shorts/{id}/like` - Toggle like

**Store:** `useShortsStore()` for feed state

### Series

**Multi-episode collections** with Netflix-style layout.

**Features:**

- Season/episode structure
- Netflix-style hero with trailer
- Episode grid with hover cards
- Auto-play next episode
- Progress tracking
- Series trailer

**Routes:**

- `/series` - Series listing
- `/series/[id]` - Series detail
- `/series/[id]/play/[videoUuid]` - Episode player

**API:**

- `GET /series` - List series
- `GET /series/{id}` - Series detail
- `GET /series/{id}/trailer` - Series trailer
- `GET /series/play/{uuid}` - Play episode

### Courses

**Educational series** with structured lessons.

**Features:**

- Lesson-based structure
- Progress tracking
- Course trailer
- Lesson completion status
- Course player with lesson sidebar

**Routes:**

- `/courses` - Courses listing
- `/courses/[id]` - Course detail
- `/courses/[id]/play/[videoUuid]` - Lesson player

**API:**

- `GET /courses` - List courses
- `GET /courses/{id}` - Course detail
- `GET /course/{id}/trailer` - Course trailer
- `GET /courses/play/{uuid}` - Play lesson

### Community Posts

**Social feed** with text, images, and engagement.

**Features:**

- Post creation (text + images)
- Like/dislike
- Comments
- Post deletion (creator only)
- Infinite scroll feed

**Routes:**

- `/community` - Posts feed
- `/community/[id]` - Post detail

**API:**

- `GET /posts` - List posts
- `GET /posts/{id}` - Post detail
- `POST /posts` - Create post
- `POST /posts/{id}/like` - Toggle like
- `DELETE /posts/{id}` - Delete post

---

## Key Features & Patterns

### Video Player Architecture

**Shaka Player** integration for HLS streaming.

**Components:**

- `VideoPlayer` (`src/components/video/video-player.tsx`) - Thin wrapper
- `ShakaPlayer` (`src/components/video/shaka-player.tsx`) - Full-featured player

**Features:**

- **Quality Selection:** Automatic best quality selection (HLS → 1440p → 1080p → etc.)
- **Playback Speed:** 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- **Picture-in-Picture:** Persists during navigation
- **Keyboard Shortcuts:**
  - `Space` - Play/Pause
  - `Arrow Left/Right` - Seek ±10s
  - `Arrow Up/Down` - Volume ±10%
  - `F` - Fullscreen
  - `M` - Mute
  - `0-9` - Seek to percentage
- **Video Previews:** Thumbnail preview on seek bar hover
- **Netflix-style Controls:** Smooth animations, auto-hide

**Usage:**

```tsx
import { VideoPlayer } from '@/components/video';

<VideoPlayer
  thumbnail={video.thumbnail}
  hls_url={video.hls_url}
  url_1080={video.url_1080}
  autoplay={false}
  onEnded={() => playNext()}
/>;
```

### Horizontal Scroll Sections

Home page uses multiple horizontal scrollable sections:

**Components:**

- `FeaturedSection` - NetflixHoverCard with video previews
- `RecommendedSection` - NetflixHoverCard with video previews
- `HomeShortsSection` - Vertical shorts with hover preview
- `HomeSeriesSection` - Vertical poster cards with hover expansion
- `CreatorsSection` - Circular avatar cards with glow effect
- `PlaylistsSection` - Infinite-loading playlist rows

**Common Patterns:**

- Navigation arrows positioned at card center height
- Edge gradients: `bg-gradient-to-r from-background to-transparent`
- `group/section` for hover-triggered arrow visibility
- `hide-scrollbar` utility class

### Infinite Scroll Patterns

**TanStack Query Infinite Queries:**

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: queryKeys.videos.list({ short: false }),
  queryFn: ({ pageParam = 1 }) => videoClient.list({ page: pageParam, per_page: 24 }),
  getNextPageParam: (lastPage) => (lastPage.next_page_url ? lastPage.current_page + 1 : undefined),
  initialPageParam: 1,
});

const videos = useMemo(() => {
  return data?.pages.flatMap((page) => page.data) || [];
}, [data]);
```

**Intersection Observer for Auto-Load:**

```tsx
const loadMoreRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        fetchNextPage();
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(loadMoreRef.current);
  return () => observer.disconnect();
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
```

### Authentication Flow

1. **Token Storage:** Cookies (`tabootv_token`)
2. **Auth Store:** Persisted to localStorage
3. **401 Response:** Redirect to `/sign-in`
4. **403 with Subscription:** Redirect to `/plans`
5. **Token Interceptor:** Automatic token injection in API requests

**Auth Methods:**

- Email/password login
- Firebase OAuth (Google/Apple)
- Registration with email verification

**Routes:**

- `/sign-in` - Login
- `/sign-up` - Registration
- `/forgot-password` - Password reset
- `/reset-password` - Reset password form
- `/verify-email` - Email verification

### Creator Studio

**Location:** `/studio/*`

**Features:**

- Dashboard with stats
- Video upload (long-form)
- Short upload (vertical)
- Post creation
- Analytics
- Content management

**Routes:**

- `/studio` - Dashboard
- `/studio/upload/video` - Upload video
- `/studio/upload/short` - Upload short
- `/studio/post` - Create post

**API:** `studioClient` from `src/api/client/studio.client.ts`

---

## Development Workflow

### Commands

```bash
# Development
npm run dev          # Start dev server (port 3000)

# Build
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint (--max-warnings=0)
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm run type-check   # Type check without emitting (tsc --noEmit)

# Testing
npm run test         # Run unit tests (Vitest)
npm run test:ui      # Run tests with Vitest UI
npm run test:e2e     # Run E2E tests (Cypress)
```

### Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/features/*": ["./src/features/*"],
    "@/shared/*": ["./src/shared/*"]
  }
}
```

**Usage:**

```typescript
import { useAuthStore } from '@/lib/stores';
import { VideoPlayer } from '@/components/video';
import { apiClient } from '@/api/client';
```

### Environment Variables

**Required:**

- `NEXT_PUBLIC_API_URL` - Backend API URL
  - Default: `https://app.taboo.tv/api`
  - Beta: `https://beta.taboo.tv/api`

**Optional:**

- Firebase config for OAuth
- Laravel Reverb config for WebSockets

**File:** `.env.local` (not committed)

### TypeScript Configuration

**Strict Mode Enabled:**

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`

**Exclusions:**

- `depreciated/**` - Legacy code
- `src/infrastructure/testing/**` - Test utilities
- `vitest.config.ts` - Test config

---

## Best Practices & Patterns

### Code Organization

1. **Domain-Driven Structure:**
   - API clients organized by domain
   - Components grouped by feature
   - Shared utilities in `src/shared/`

2. **File Naming:**
   - Components: `kebab-case.tsx`
   - Utilities: `kebab-case.ts`
   - Types: `index.ts` or `types.ts`

3. **Import Order:**
   - External dependencies
   - Internal modules (`@/`)
   - Relative imports
   - Types

### API Usage Patterns

**Use Query Hooks (Preferred):**

```typescript
const { data, isLoading } = useVideo(id);
```

**Use Mutation Hooks:**

```typescript
const toggleLike = useToggleLike();
toggleLike.mutate(videoId);
```

**Avoid Direct API Calls:**

```typescript
// ❌ Don't do this
const response = await videoClient.getDetail(id);

// ✅ Do this instead
const { data } = useVideo(id);
```

### Component Patterns

**Server Components by Default:**

```tsx
// Server Component (default)
export default function Page() {
  return <div>Content</div>;
}
```

**Client Components When Needed:**

```tsx
'use client';

import { useState } from 'react';

export function InteractiveComponent() {
  const [state, setState] = useState();
  // ...
}
```

**Component Composition:**

```tsx
// Page component (Server)
export default function VideosPage() {
  return <VideosContent />;
}

// Content component (Client)
('use client');
export function VideosContent() {
  // Interactive logic
}
```

### Styling Guidelines

1. **Use Design Tokens:**

   ```tsx
   import { colors, spacing } from '@/lib/design-tokens';
   ```

2. **Use Typography Classes:**

   ```tsx
   <h1 className="title-page">Videos</h1>
   ```

3. **Use Utility Classes:**

   ```tsx
   className = 'px-4 md:px-6 lg:px-8';
   ```

4. **Use `cn()` for Conditional Classes:**

   ```tsx
   import { cn } from '@/lib/utils';

   className={cn('base-class', isActive && 'active-class')}
   ```

5. **Atmospheric Backgrounds:**
   ```tsx
   <div className="series-page-atmosphere">
     <div className="series-atmosphere-bg" />
   </div>
   ```

---

## Migration Guides

### API Layer Migration

**From Legacy to TanStack Query:**

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

**Infinite Scroll Migration:**

**Before:**

```typescript
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
const { data, isLoading, fetchNextPage, hasNextPage } = useVideoList({
  short: false,
  per_page: 24,
});

const videos = useMemo(() => {
  return data?.pages.flatMap((page) => page.data) || [];
}, [data]);
```

**Full Migration Guide:** See `docs/MIGRATION_GUIDE.md`

### Design System Migration

**Step-by-Step:**

1. **Import new components:**

   ```tsx
   import { PageHeader, FilterChips, MediaCard, ContentGrid } from '@/components/ui';
   ```

2. **Replace page header:**

   ```tsx
   // Before
   <h1 className="text-2xl font-bold">Title</h1>

   // After
   <PageHeader title="Title" subtitle="Description" />
   ```

3. **Replace filters:**

   ```tsx
   // Before
   <div className="flex gap-2">
     {filters.map(f => <button>...</button>)}
   </div>

   // After
   <FilterChips options={filters} selected={active} onSelect={setActive} />
   ```

4. **Replace grids:**

   ```tsx
   // Before
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

   // After
   <ContentGrid variant="media">
   ```

5. **Replace cards:**

   ```tsx
   // Before
   <CustomVideoCard video={video} />

   // After
   <MediaCard type="video" {...video} />
   ```

**Full Design System Guide:** See `docs/DESIGN_SYSTEM.md`

---

## Testing & Quality

### Testing Setup

**Vitest** for unit tests:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

**Test Example:**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoCard } from './VideoCard';

describe('VideoCard', () => {
  it('renders video title', () => {
    render(<VideoCard title="Test Video" />);
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });
});
```

### Linting

**ESLint** with Next.js config:

- Zero warnings policy (`--max-warnings=0`)
- Auto-fix with `npm run lint:fix`

### Formatting

**Prettier** for code formatting:

- Format all files: `npm run format`
- Check formatting: `npm run format:check`

### Type Checking

**TypeScript** strict mode:

- Type check: `npm run type-check`
- No emit mode (build-time checking)

---

## Deployment & Infrastructure

### Build Process

**Production Build:**

```bash
npm run build
npm run start
```

**Build Output:**

- `.next/` - Next.js build output
- Static assets optimized
- Server-side rendering configured

### Environment Configuration

**Environment Variables:**

- `NEXT_PUBLIC_API_URL` - Backend API URL
- Firebase config (OAuth)
- Laravel Reverb config (WebSockets)

**Next.js Config:**

- Image optimization (CloudFront, S3, Bunny CDN)
- API rewrites (proxy to backend)
- Security headers (X-Frame-Options, etc.)

### API Proxy Setup

All `/api/*` requests are proxied to the backend:

```typescript
// next.config.ts
async rewrites() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app.taboo.tv/api';
  return [
    {
      source: '/api/:path*',
      destination: `${apiUrl}/:path*`,
    },
  ];
}
```

**Benefits:**

- No CORS issues
- Single API URL configuration
- Works in dev and production

### Image Optimization

**Remote Patterns:**

- `**.cloudfront.net` - CloudFront CDN
- `**.amazonaws.com` - S3 buckets
- `**.taboo.tv` - TabooTV domains
- `**.b-cdn.net` - Bunny CDN

**Next.js Image Component:**

```tsx
import Image from 'next/image';

<Image src={thumbnail} alt={title} width={320} height={180} className="rounded-lg" />;
```

---

## Additional Resources

### Documentation Files

- **`docs/CLAUDE.md`** - Quick reference for AI assistants
- **`docs/DESIGN_SYSTEM.md`** - Design system guide
- **`docs/MIGRATION_GUIDE.md`** - API migration guide
- **`docs/NETFLIX-HOVER-CARD-PATTERN.md`** - Hover card implementation
- **`docs/TABOOTV_DESIGN_SYSTEM_REFERENCE.md`** - Complete design reference
- **`docs/PROJECT_CONTEXT.md`** - This document (complete project context)

### Key Files

**API:**

- `src/api/client/base-client.ts` - Base HTTP client (Axios wrapper, auth interceptors)
- `src/api/client/video.client.ts` - Video API client
- `src/api/client/series.client.ts` - Series API client
- `src/api/client/courses.client.ts` - Courses API client
- `src/api/query-keys.ts` - Query key factories
- `src/api/queries/video.queries.ts` - Video query hooks
- `src/api/queries/series.queries.ts` - Series query hooks
- `src/api/mutations/video.mutations.ts` - Video mutation hooks (optimistic updates)

**Components:**

- `src/components/ui/page-header.tsx` - Unified page header
- `src/components/ui/media-card.tsx` - Media card component
- `src/components/ui/filter-chips.tsx` - Filter chips component
- `src/components/ui/content-grid.tsx` - Responsive grid layout
- `src/components/video/video-player.tsx` - Video player wrapper
- `src/components/video/shaka-player.tsx` - Shaka Player implementation
- `src/components/home/netflix-hover-card.tsx` - Netflix-style hover card
- `src/components/home/featured-section.tsx` - Featured videos section

**Stores:**

- `src/lib/stores/auth-store.ts` - Authentication (persisted to localStorage)
- `src/lib/stores/shorts-store.ts` - Shorts feed state
- `src/lib/stores/watchlist-store.ts` - Watchlist (persisted)
- `src/lib/stores/sidebar-store.ts` - Navigation sidebar state
- `src/lib/stores/live-chat-store.ts` - Live chat messages
- `src/lib/stores/saved-videos-store.ts` - Bookmarked videos
- `src/lib/stores/index.ts` - Store exports

**Design:**

- `src/lib/design-tokens.ts` - Design tokens (colors, spacing, typography)
- `src/app/globals.css` - Global styles (CSS variables, utility classes)
- `components.json` - shadcn/ui component configuration

### Common Patterns

**Page Template:**

```tsx
export default function ExamplePage() {
  return (
    <div className="series-page-atmosphere min-h-screen">
      <div className="series-atmosphere-bg" />
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <PageHeader title="Page Title" subtitle="Description" />
        <ContentGrid variant="media">
          {items.map((item) => (
            <MediaCard key={item.id} {...item} />
          ))}
        </ContentGrid>
      </div>
    </div>
  );
}
```

**Query Usage:**

```tsx
'use client';

import { useVideoList } from '@/api/queries';

export function VideosContent() {
  const { data, isLoading } = useVideoList({ short: false, per_page: 24 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ContentGrid variant="media">
      {data?.data.map((video) => (
        <MediaCard key={video.id} type="video" {...video} />
      ))}
    </ContentGrid>
  );
}
```

**Mutation Usage:**

```tsx
'use client';

import { useToggleLike } from '@/api/mutations';

export function LikeButton({ videoId }: { videoId: string }) {
  const toggleLike = useToggleLike();

  return (
    <button onClick={() => toggleLike.mutate(videoId)}>
      {toggleLike.isPending ? 'Loading...' : 'Like'}
    </button>
  );
}
```

---

## Quick Reference

### Color Tokens

- Primary Red: `#ab0013`
- Background: `#000000`
- Surface: `#0d0d0d`
- Text Primary: `#e6e7ea`
- Text Secondary: `#9aa0a6`

### Typography Classes

- `title-hero` - Hero titles
- `title-page` - Page titles
- `title-section` - Section titles
- `body-large` - Large body text
- `body-base` - Base body text
- `body-small` - Small body text

### Spacing

- Mobile: `px-4` (16px)
- Tablet: `md:px-6` (24px)
- Desktop: `lg:px-8` (32px)

### API Clients

- `authClient` - Authentication
- `videoClient` - Videos
- `seriesClient` - Series
- `coursesClient` - Courses
- `postsClient` - Community posts
- `homeClient` - Home feed

### Query Hooks

- `useVideo(id)` - Get video
- `useVideoList(filters)` - List videos
- `useSeriesDetail(id)` - Get series
- `useMe()` - Current user

### Mutation Hooks

- `useToggleLike()` - Toggle like
- `useToggleBookmark()` - Toggle bookmark
- `useLogin()` - Login
- `useCreatePost()` - Create post

---

**Last Updated:** December 2024  
**Maintained By:** TabooTV Development Team
