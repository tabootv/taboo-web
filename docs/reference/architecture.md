# Complete Architecture Reference

This file contains the full PROJECT_CONTEXT.md content for deep-dive architectural research.

> **When to use:** Only for deep research. For quick answers, use the Layer 2 docs in `docs/agents/`.

---

## Project Overview & Architecture

See `docs/agents/` for quick guides on each topic:
- API Design: `docs/agents/api-design.md`
- State Management: `docs/agents/state-management.md`
- Styling: `docs/agents/styling.md`
- Server Actions: `docs/agents/server-actions.md`
- Authentication: `docs/agents/authentication.md`
- Content Types: `docs/agents/content-types.md`

---

## Directory Structure Details

### Route Groups

```
src/app/
├── (main)/                      # Pages with navbar
│   ├── page.tsx                 # Home page
│   ├── [route]/
│   │   ├── page.tsx
│   │   ├── _components/         # Route-specific components
│   │   │   ├── component-a.tsx
│   │   │   └── component-b.tsx
│   │   └── _actions.ts          # Route-specific server actions
│   ├── videos/
│   ├── series/
│   ├── shorts/
│   ├── community/
│   ├── creators/
│   ├── profile/
│   │   └── edit/
│   │       ├── page.tsx
│   │       ├── _components/
│   │       └── _actions.ts
│   └── search/
│
├── (auth)/                      # Auth pages (no navbar)
│   ├── sign-in/
│   │   ├── page.tsx
│   │   ├── _components/
│   │   └── _actions.ts
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
│
└── studio/                      # Creator studio (direct route)
    ├── layout.tsx
    ├── page.tsx
    ├── videos/
    │   ├── page.tsx
    │   ├── [videoId]/
    │   │   ├── page.tsx
    │   │   └── _components/
    │   └── upload/
    │       ├── page.tsx
    │       └── _actions.ts
    ├── analytics/
    └── settings/
```

### API Layer Architecture

```
src/api/
├── client/                      # HTTP clients (domain-specific)
│   ├── video.client.ts         # Video API calls
│   ├── shorts.client.ts
│   ├── series.client.ts
│   ├── auth.client.ts
│   └── ...
│
├── queries/                     # TanStack Query hooks (reads)
│   ├── video.queries.ts        # useVideo, useVideoList
│   ├── shorts.queries.ts       # useShorts, useInfiniteShortsFeeed
│   ├── auth.queries.ts         # useUser, useSubscription
│   └── ...
│
├── mutations/                   # TanStack Query hooks (writes)
│   ├── video.mutations.ts      # useToggleLike, useUpdateVideo
│   ├── shorts.mutations.ts
│   └── ...
│
├── query-keys.ts               # Centralized query key factories
└── axios-instance.ts           # Configured axios client
```

### State Management

**Zustand stores** (client-only state):
```
src/shared/stores/
├── auth-store.ts               # User auth, session
├── shorts-store.ts             # Shorts feed state
├── sidebar-store.ts            # UI state
└── preferences-store.ts        # User preferences
```

### Shared Utilities

```
src/shared/
├── lib/
│   ├── design-tokens.ts        # All design values
│   ├── axios.ts                # HTTP client config
│   └── validations.ts          # Form validations
│
└── utils/
    ├── formatting.ts           # cn(), formatDuration, etc.
    ├── routes.ts               # Route generators
    └── helpers.ts              # General utilities
```

---

## Data Flow Patterns

### Query Pattern (Read)

```
Component → useVideo Hook
  ↓
TanStack Query Hook (src/api/queries/)
  ↓
videoClient.getVideo() (src/api/client/)
  ↓
Axios request to /api/videos/{id}
  ↓
Cache in TanStack Query
  ↓
Component re-renders with data
```

### Mutation Pattern (Write)

```
User Action → useToggleLike Hook
  ↓
Optimistic Update (cache)
  ↓
Mutation submits to API
  ↓
onSuccess: Invalidate queries
  ↓
onError: Rollback cache
```

### Form Submission Pattern

```
User submits form
  ↓
Form calls server action (_actions.ts)
  ↓
Server action validates & calls API
  ↓
Server action redirects or returns error
  ↓
Component shows result
```

---

## Authentication & Authorization

- Tokens stored in HTTP-only cookies
- Middleware validates on each request
- Zustand store for client-side user state
- Server actions protect sensitive operations
- 401 → redirect to /sign-in
- 403 → redirect to /plans (subscription required)

---

## Key Technical Decisions

1. **Server Components by default** – Smaller JS bundles, better security
2. **TanStack Query for server state** – Built-in caching, retries, refetching
3. **Zustand for client state** – Minimal, no boilerplate
4. **Design tokens centralized** – Single source of truth for design
5. **Colocated components & actions** – Better organization, easier to find code
6. **Middleware for auth** – Centralized protection logic

---

## Database / API

Backend is **Laravel API**. Communication via REST endpoints:

```
Authentication:
POST /api/login
POST /api/logout
GET /api/user

Videos:
GET /api/videos
GET /api/videos/{id}
POST /api/videos/{id}/like
PATCH /api/videos/{id}
DELETE /api/videos/{id}

Shorts:
GET /api/v2/shorts
GET /api/v2/shorts/{id}
POST /api/v2/shorts/{id}/like

Series:
GET /api/series
GET /api/series/{id}
GET /api/series/{id}/episodes

User:
GET /api/user/profile
PATCH /api/user/profile
GET /api/user/subscription
```

---

## Deployment

- **Vercel** for frontend hosting
- **API rewrites** in next.config.ts proxy to Laravel backend
- **Environment variables** for API URL selection (prod vs beta)

---

## Full Details

For comprehensive architecture documentation, see the original `PROJECT_CONTEXT.md` in the repository root or refer to specialized guides:
- `docs/agents/api-design.md`
- `docs/agents/server-actions.md`
- `docs/agents/authentication.md`
