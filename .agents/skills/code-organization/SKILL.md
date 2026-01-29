---
name: code-organization
description: "Feature-based architecture, module boundaries, folder structure, file organization, dependency management"
allowed-tools: Read, Write, Edit, Bash
version: 1.0
priority: HIGH
---

# Code Organization – TabooTV Architecture

> **CORE GOAL:** Organize code by feature, maintain clear boundaries, minimize dependencies, maximize maintainability.

---

## When to Use This Skill

**Trigger Keywords:**
- "How should I organize X?"
- "Where does this file go?"
- "Reorganize folder structure"
- "Split monolithic module"
- "Define module boundaries"
- "Circular dependency detected"
- "This file is too large"

---

## Architecture Overview

```
src/
├── app/                       # Next.js routes (App Router)
│   ├── (main)/               # Pages with navbar
│   │   ├── page.tsx
│   │   ├── videos/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (auth)/               # Auth routes
│   │   ├── sign-in/
│   │   ├── register/
│   │   └── layout.tsx
│   └── studio/               # Creator studio (direct route)
│       ├── page.tsx
│       ├── upload/
│       └── layout.tsx
│
├── api/                       # TanStack Query layer (data)
│   ├── client/               # HTTP clients
│   ├── queries/              # useQuery hooks
│   ├── mutations/            # useMutation hooks
│   ├── types/                # Response types
│   └── query-keys.ts         # Query key factory
│
├── components/               # Global UI components
│   ├── ui/                   # Shadcn primitives
│   ├── layout/               # Layout components
│   │   ├── navbar/
│   │   ├── footer/
│   │   └── sidebar/
│   └── shared/               # Truly shared components
│       └── button-variants/
│
├── features/                 # Feature modules (domain-driven)
│   ├── video/
│   │   ├── components/       # Video-specific components
│   │   │   ├── video-player/
│   │   │   ├── video-card/
│   │   │   └── video-detail/
│   │   ├── hooks/            # Video-specific hooks
│   │   ├── __tests__/        # Video tests
│   │   │   ├── fixtures/
│   │   │   └── mocks/
│   │   └── README.md         # Module documentation
│   │
│   ├── shorts/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── __tests__/
│   │   └── README.md
│   │
│   ├── series/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── __tests__/
│   │   └── README.md
│   │
│   ├── subscription/
│   ├── creator-studio/
│   └── [other features]/
│
├── hooks/                    # Shared hooks
│   ├── useDebounce.ts
│   ├── useIsMobile.ts
│   └── useLocalStorage.ts
│
├── shared/                   # Utilities & stores (truly shared)
│   ├── stores/               # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── shorts-store.ts
│   │   └── sidebar-store.ts
│   ├── utils/                # Utilities
│   │   ├── formatting.ts
│   │   ├── routes.ts
│   │   └── validation.ts
│   ├── lib/                  # Library instances
│   │   ├── design-tokens.ts
│   │   └── axios-instance.ts
│   └── components/           # Shared UI components
│       └── loading-spinner/
│
├── types/                    # Global TypeScript types
│   └── index.ts
│
├── testing/                  # Shared test utilities
│   ├── setup.ts
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── server.ts
│   ├── fixtures/
│   │   └── common.fixture.ts
│   └── utils.ts
│
└── middleware.ts             # Next.js middleware (auth, redirects)
```

---

## Feature Module Structure

Each feature is self-contained:

```
features/video/
├── components/              # UI components for this feature
│   ├── video-player.tsx
│   ├── video-card.tsx
│   ├── video-detail.tsx
│   ├── video-comments.tsx
│   └── _components.ts       # Internal components (prefixed with _)
├── hooks/                   # Custom hooks for this feature
│   ├── useVideoPlayer.ts
│   ├── useVideoComments.ts
│   └── useVideoLike.ts
├── __tests__/              # Feature tests
│   ├── fixtures/
│   │   └── videos.fixture.ts
│   └── mocks/
│       └── video.mock.ts
├── types.ts                # Feature-specific types (optional)
├── constants.ts            # Feature-specific constants (optional)
└── README.md               # Module documentation
```

### Feature README Template

```markdown
# Video Feature

## Purpose
Display and interact with video content.

## Components
- **VideoPlayer** — HLS video playback with controls
- **VideoCard** — Compact video preview card
- **VideoDetail** — Full video page with metadata

## Hooks
- **useVideoPlayer** — Player state and controls
- **useVideoComments** — Comments loading and pagination
- **useVideoLike** — Like/unlike video

## API Queries
- `useVideo(id)` — Fetch single video
- `useVideoList(filters)` — Fetch video list
- `useVideoComments(id)` — Fetch comments

## API Mutations
- `useToggleLike(videoId)` — Like/unlike video
- `useAddComment(videoId, text)` — Post comment

## Exports
```typescript
export { VideoPlayer, VideoCard, VideoDetail } from './components';
export { useVideoPlayer, useVideoComments } from './hooks';
export type { Video, VideoListResponse } from '@/api/types/video.types';
```

## Usage
```typescript
import { VideoDetail } from '@/features/video/components';
```

## Dependencies
- `@tanstack/react-query` — Server state
- `shaka-player` — HLS playback
- `@/api` — API layer
- `@/components/ui` — UI components

## Don't import from here
- Private components (prefixed with `_`)
- Test fixtures and mocks
```

---

## Module Boundaries

### What Lives Where

| Code | Location |
|------|----------|
| **Routes** | `app/` (organized by route) |
| **Layout** | `components/layout/` (global) or `features/*/` (if feature-specific) |
| **API clients** | `api/client/` |
| **Query hooks** | `api/queries/` |
| **Mutation hooks** | `api/mutations/` |
| **Feature UI** | `features/*/components/` |
| **Feature logic** | `features/*/hooks/` |
| **Shared hooks** | `hooks/` |
| **Stores** | `shared/stores/` |
| **Utilities** | `shared/utils/` |
| **Types** | `types/` (global) or `features/*/types.ts` (feature-specific) |
| **Tests** | `__tests__/` (colocated with feature) or `src/testing/` (shared) |

### Import Rules

```typescript
// ✅ OK
import { VideoPlayer } from '@/features/video/components';
import { useVideoPlayer } from '@/features/video/hooks';
import { useAuthStore } from '@/shared/stores/auth-store';
import { cn } from '@/shared/utils/formatting';

// ❌ Don't import internals
import VideoPlayer from '@/features/video/components/video-player'; // Use barrel export

// ❌ Don't cross-import features
// (video feature should not import from shorts feature)
import { ShortsPlayer } from '@/features/shorts/components'; // Not in video feature!

// ✅ OK - shared
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks';
```

---

## Dependency Graph

### Healthy Architecture

```
app/ → features/ → api/ → shared/
                 ↓
            components/ui/
                 ↓
              hooks/ → shared/
```

- ✅ Dependencies flow downward (no circular)
- ✅ Features are isolated
- ✅ Shared utilities have no feature dependencies
- ✅ Components/hooks are reusable

### Anti-Patterns

```
❌ Circular dependencies
feature-a/ → feature-b/ → feature-a/

❌ Cross-feature imports
video/ → shorts/ (features should be independent)

❌ Feature code in global
// Global code that's specific to one feature
shared/utils/video-formatting.ts → should be features/video/utils/

❌ Shared importing from features
shared/utils/ → features/video/ (breaks the model)
```

---

## Refactoring Large Modules

### When to Split

| Signal | Action |
|--------|--------|
| File > 300 lines | Split into multiple components |
| Component has 10+ props | Extract child components |
| Multiple responsibilities | Extract hooks/utilities |
| Different update frequencies | Split into separate stores |
| Tests are hard to write | Logic is tangled, refactor |

### How to Split

```typescript
// Before: 400-line monolith
features/video/components/video-detail.tsx

// After: Organized modules
features/video/components/
├── video-detail.tsx         (orchestrator, 80 lines)
├── video-player.tsx         (player logic, 120 lines)
├── video-info.tsx           (metadata, 80 lines)
├── video-comments.tsx       (comments, 100 lines)
└── video-actions.tsx        (like/share, 50 lines)
```

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Folder** | kebab-case, plural if collection | `features/video/`, `shared/utils/` |
| **Component** | PascalCase | `VideoPlayer.tsx` |
| **Hook** | camelCase, prefix with `use` | `useVideoPlayer.ts` |
| **Utility** | camelCase | `formatDate.ts` |
| **Store** | camelCase, suffix with `-store` | `auth-store.ts` |
| **Type file** | `types.ts` or `[name].types.ts` | `video.types.ts` |
| **Private component** | prefix with `_` | `_PlayerControls.tsx` |
| **Private hook** | prefix with `_` | `_usePlayerState.ts` |
| **Test file** | `*.test.ts` or `*.test.tsx` | `video-card.test.tsx` |

---

## Circular Dependencies

### Detection

```bash
# Find circular dependencies
npm run lint

# Or manually check imports
# If A imports B and B imports A → circular dependency
```

### Fixing Circular Dependencies

```typescript
// ❌ Circular dependency
// video-store.ts imports VideoPlayer
// VideoPlayer imports video-store

// ✅ Solution 1: Move shared logic to separate module
// video-store.ts (state management)
// video-utils.ts (shared logic)
// VideoPlayer imports video-utils, not video-store

// ✅ Solution 2: Use dependency injection
function VideoPlayer({ onPlay }: Props) {
  // Component doesn't import store, receives callbacks
}

// In parent (which can import both)
function VideoPage() {
  const store = useVideoStore();
  return <VideoPlayer onPlay={() => store.play()} />;
}
```

---

## When Complete: Self-Check

- [ ] Code is organized by feature
- [ ] Module boundaries are clear
- [ ] No circular dependencies
- [ ] Imports follow the rules
- [ ] Features are independent
- [ ] Shared code is truly shared
- [ ] README exists for each feature
- [ ] Tests are colocated with code

---

## Related Skills

- **refactoring-patterns** — Splitting large components
- **typescript-patterns** — Type organization
- **testing** — Test file organization
