# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TabooTV is a video streaming platform frontend built with Next.js 16 and React 19. It connects to a Laravel backend API and supports videos, shorts (TikTok-style), series, courses, and community posts.

## Commands

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint (--max-warnings=0)
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm run type-check   # Type check without emitting (tsc --noEmit)
npm run test         # Run unit tests (Vitest)
npm run test:ui      # Run tests with Vitest UI
```

## Architecture

### Tech Stack
- **Next.js 16** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Zustand** for global state management
- **TanStack Query** for server state
- **Axios** for API requests
- **Shaka Player** for HLS/MP4 video playback

### Directory Structure
```
src/
├── app/
│   ├── (main)/      # Main app pages with navbar (videos, series, profile, studio)
│   ├── (auth)/      # Auth pages without main layout (login, register, plans)
│   └── layout.tsx   # Root layout with QueryProvider and ErrorBoundary
├── api/             # NEW: TanStack Query API layer
│   ├── client/      # Domain-specific API clients (video, auth, home, series, posts)
│   ├── queries/     # TanStack Query hooks (useVideo, useVideoList, etc.)
│   ├── mutations/   # TanStack mutation hooks (useLogin, useToggleLike, etc.)
│   ├── query-keys.ts  # Centralized query key factories
│   └── types/       # API-specific types
├── components/
│   ├── ui/          # Design system components (PageHeader, MediaCard, etc.)
│   ├── layout/      # Navbar, Footer, MainLayout
│   ├── home/        # Homepage sections (BannerSlider, Featured, etc.)
│   ├── video/       # Video player components, ShakaPlayer
│   └── shorts/      # Shorts feed components
├── lib/
│   ├── api/         # Legacy API endpoints (being migrated to src/api/)
│   ├── stores/      # Zustand stores
│   ├── hooks/       # Custom React hooks
│   ├── utils.ts     # Utility functions (cn, formatDuration, formatNumber)
│   └── design-tokens.ts  # Design system tokens
├── shared/          # Shared infrastructure
│   ├── components/  # Providers (QueryProvider), ErrorBoundary
│   └── lib/         # Query client config, utilities, env helpers
└── types/           # TypeScript interfaces for API responses
```

### Content Types
- **Videos**: Long-form content, supports HLS streaming with quality selection
- **Shorts**: TikTok-style vertical videos with V2 API (`/v2/shorts`)
- **Series**: Multi-episode collections with seasons, uses Netflix-style layout
- **Courses**: Educational series with structured lessons
- **Posts**: Community feed content with text/images

### API Layer
- **Client** (`src/lib/api/client.ts`): Axios instance with auth token interceptor
- **Endpoints** (`src/lib/api/endpoints.ts`): All API calls organized by domain
- **Studio** (`src/lib/api/studio.ts`): Creator dashboard and content upload APIs
- **Proxy**: All `/api/*` requests are proxied to the backend via Next.js rewrites to avoid CORS
- **API Versions**: Some endpoints have V1 and V2 variants (e.g., `/shorts` vs `/v2/shorts`)

### State Management (Zustand Stores)
- **Auth Store**: User session, login/logout, subscription status (persisted to localStorage)
- **Shorts Store**: Infinite scroll state for shorts feed
- **Watchlist Store**: User's saved videos
- **Saved Videos Store**: Bookmarked content
- **Sidebar Store**: Navigation sidebar state
- **Live Chat Store**: Real-time chat messages

### Video Player Architecture
The video player uses **Shaka Player** for HLS streaming:
- **VideoPlayer** (`src/components/video/video-player.tsx`): Thin wrapper that selects best source (HLS → 1440p → 1080p → etc.)
- **ShakaPlayer** (`src/components/video/shaka-player.tsx`): Full-featured player with:
  - Netflix-style controls with smooth animations
  - Quality selection and playback speed (0.5x-2x)
  - Picture-in-Picture (persists during navigation)
  - Video preview thumbnails on seek bar hover
  - Keyboard shortcuts (space, arrows, f, m, etc.)

### Design System
Key patterns (see `DESIGN_SYSTEM.md` for full docs):
- **Colors**: Primary red `#ab0013`, Background `#000000`, Surface `#0d0d0d`
- **Atmospheric backgrounds**: `.series-page-atmosphere` + `.series-atmosphere-bg`
- **Typography classes**: `title-hero`, `title-page`, `title-section`, `body-large`, `body-small`
- **UI Components**: `PageHeader`, `FilterChips`, `MediaCard`, `ContentGrid` from `@/components/ui`
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes

### Authentication Flow
1. Token stored in cookies (`tabootv_token`)
2. Auth store persisted to localStorage
3. 401 responses redirect to `/sign-in`
4. 403 with subscription message redirects to `/plans`

## Environment Variables

Copy `.env.local.example` to `.env.local`:
- `NEXT_PUBLIC_API_URL` - Backend API (default: `https://app.taboo.tv/api`, beta: `https://beta.taboo.tv/api`)
- Firebase config for OAuth
- Laravel Reverb config for WebSockets

## Key Patterns

### Path Aliases
- `@/` maps to `src/`

### API Calls
```tsx
import { videos, auth, home } from '@/lib/api';
const data = await videos.play(id);  // Returns { video, videos }
const recommended = await home.getRecommendedVideos();
```

### Zustand Store Usage
```tsx
import { useAuthStore } from '@/lib/stores';
const { user, isAuthenticated, login } = useAuthStore();
```

### Video Player Usage
```tsx
import { VideoPlayer } from '@/components/video';

<VideoPlayer
  thumbnail={video.thumbnail}
  hls_url={video.hls_url}
  url_1080={video.url_1080}
  autoplay={false}
  onEnded={() => playNext()}
/>
```

### Series/Course Pages
- Series detail: `/series/[id]` - Netflix-style hero with trailer + episode grid
- Series player: `/series/[id]/play/[videoUuid]` - Video + episode sidebar
- Course detail: `/courses/[id]` - Similar layout with lesson progress
- Episodes can be auto-played based on user preference

### Creator Studio
Located at `/studio/*`, allows creators to manage their content:
- Dashboard: `/studio` - Stats and recent content overview
- Upload video: `/studio/upload/video` - Long-form content upload
- Upload short: `/studio/upload/short` - Vertical video upload
- Create post: `/studio/post` - Community post creation
- Uses `studio` API module from `@/lib/api/studio`

### Horizontal Scroll Sections (Home Page)
Home page uses multiple horizontal scrollable sections in `src/components/home/`:
- `FeaturedSection`, `RecommendedSection`: NetflixHoverCard with video previews
- `HomeShortsSection`: Vertical shorts with video preview on hover
- `HomeSeriesSection`: Vertical poster cards with hover expansion
- `CreatorsSection`: Circular avatar cards with glow effect
- `PlaylistsSection`: Infinite-loading playlist rows

Common patterns:
- Navigation arrows positioned at card center height (e.g., `top-[78px]` for aspect-video cards)
- Edge gradients: `bg-gradient-to-r from-background to-transparent`
- `group/section` for hover-triggered arrow visibility
- `hide-scrollbar` utility class

### Netflix-Style Hover Cards
`NetflixHoverCard` component (`src/components/home/netflix-hover-card.tsx`):
- Lazy loads video preview on hover after 300ms delay
- Shows info panel with play button, save to list, duration
- Uses `onLoadedData` callback for smooth video-thumbnail transition
- Volume toggle for preview audio
