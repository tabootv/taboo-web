# AGENTS.md

> Context file for AI assistants (Claude Code, Cursor, Copilot, etc.)

## Project Overview

**TabooTV** - Premium video streaming platform frontend

- **Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **State**: TanStack Query (server), Zustand (client)
- **Video**: Shaka Player for HLS streaming
- **Backend**: Laravel API (proxied via Next.js rewrites)

## Commands

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (--max-warnings=0)
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier formatting
npm run type-check   # TypeScript check (tsc --noEmit)
npm run test         # Unit tests (Vitest)
```

## Code Style

- **Icons**: lucide-react
- **Styling**: Tailwind CSS with `cn()` utility from `@/lib/utils`
- **Path alias**: `@/` maps to `src/`
- **Components**: Server Components by default, `'use client'` when needed

## Architecture

### Directory Structure

```
src/
├── app/              # Next.js App Router
│   ├── (main)/       # Main app pages with navbar
│   ├── (auth)/       # Auth pages (sign-in, sign-up, plans)
│   └── (studio)/     # Creator studio pages
├── api/              # TanStack Query API layer
│   ├── client/       # Domain-specific HTTP clients
│   ├── queries/      # Query hooks (useVideo, useSeriesList, etc.)
│   ├── mutations/    # Mutation hooks (useToggleLike, useLogin, etc.)
│   └── query-keys.ts # Centralized query key factories
├── components/
│   ├── ui/           # Design system (PageHeader, MediaCard, FilterChips)
│   ├── layout/       # Navbar, Footer, Sidebar
│   ├── home/         # Homepage sections (NetflixHoverCard, etc.)
│   └── video/        # Video player (ShakaPlayer)
├── lib/
│   ├── stores/       # Zustand stores (auth, shorts, sidebar)
│   ├── hooks/        # Custom React hooks
│   ├── utils.ts      # Utilities (cn, formatDuration, formatNumber)
│   └── design-tokens.ts
└── types/            # TypeScript interfaces
```

### Content Types

- **Videos**: Long-form HLS streaming with quality selection
- **Shorts**: TikTok-style vertical videos (V2 API: `/v2/shorts`)
- **Series**: Multi-episode collections with Netflix-style layout
- **Courses**: Educational content with progress tracking
- **Posts**: Community feed with text/images

### API Patterns

```tsx
// Query hooks for data fetching
import { useVideo, useVideoList } from '@/api/queries';
const { data, isLoading } = useVideo(id);

// Mutation hooks for actions (with optimistic updates)
import { useToggleLike } from '@/api/mutations';
const toggleLike = useToggleLike();
toggleLike.mutate(videoId);

// Direct client calls (non-component code)
import { videoClient } from '@/api/client';
const data = await videoClient.getVideo(id);
```

### Zustand Store Usage

```tsx
import { useAuthStore } from '@/lib/stores';
const { user, isAuthenticated, login } = useAuthStore();
```

## Design System

- **Primary Red**: `#ab0013` (hover: `#d4001a`)
- **Background**: `#000000`
- **Surface**: `#0d0d0d`
- **Text Primary**: `#e6e7ea`
- **Text Secondary**: `#9aa0a6`

### Typography Classes

- `title-hero` - Hero titles (36-48px)
- `title-page` - Page titles (24-30px)
- `title-section` - Section titles (18-20px)
- `body-large`, `body-base`, `body-small` - Body text

### Component Library

```tsx
import { PageHeader, FilterChips, MediaCard, ContentGrid } from '@/components/ui';

<PageHeader title="Videos" subtitle="Browse all" actions={<FilterChips ... />} />
<ContentGrid variant="media">
  {videos.map(v => <MediaCard key={v.id} type="video" {...v} />)}
</ContentGrid>
```

### Atmospheric Backgrounds

```tsx
<div className="series-page-atmosphere min-h-screen">
  <div className="series-atmosphere-bg" />
  {/* Content */}
</div>
```

## Authentication

- **Token**: Stored in cookies (`tabootv_token`)
- **Middleware**: `src/middleware.ts` protects routes
- **401**: Redirects to `/sign-in`
- **403 (subscription)**: Redirects to `/plans`

## Key Files

| Purpose | Location |
|---------|----------|
| Design System Guide | `docs/DESIGN_SYSTEM.md` |
| Full Project Context | `docs/PROJECT_CONTEXT.md` |
| Design Tokens | `src/lib/design-tokens.ts` |
| Query Keys | `src/api/query-keys.ts` |
| Auth Store | `src/lib/stores/auth-store.ts` |
| Video Player | `src/components/video/shaka-player.tsx` |

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://app.taboo.tv/api  # or https://beta.taboo.tv/api
# Firebase config for OAuth
# Laravel Reverb config for WebSockets
```

Copy `.env.local.example` to `.env.local` for local development.
