# TabooTV Context – Three-Layer Architecture

> **AI Assistant Context File** – Optimized for progressive disclosure. Load additional docs only when needed.

---

## Identity & Mission

**TabooTV** is a premium video streaming platform frontend (Next.js 16, React 19). We build high-quality UI for HLS video playback, shorts feeds, series collections, and creator studios.

**Your role:** Write TypeScript/React code that follows our patterns, maintains consistency, and respects the design system. When uncertain, ask clarifying questions before implementing.

---

## Tech Stack (Essentials)

| Tech | Version | Purpose |
|------|---------|---------|
| **Next.js** | 16.1.1 | App Router, Server Components |
| **React** | 19.2.0 | UI components |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling (via `cn()` utility) |
| **TanStack Query** | 5.90.12 | Server state (caching, mutations) |
| **Zustand** | 5.0.9 | Client state (stores) |

---

## Commands

```bash
npm run dev         # Dev server (port 3000)
npm run build       # Production build
npm run test        # Unit tests (Vitest)
npm run lint        # ESLint check
npm run type-check  # TypeScript check
```

---

## Directory Map

```
src/
├── app/              # Routes (App Router)
│   ├── (main)/       # Pages with navbar
│   ├── (auth)/       # Auth pages
│   └── studio/       # Creator studio
├── api/              # TanStack Query layer
│   ├── queries/      # Fetch hooks
│   ├── mutations/    # Update hooks
│   └── query-keys.ts # Key factories
├── components/       # UI & layout
│   ├── ui/           # Shadcn/design system
│   └── layout/       # Navbar, footer, etc.
├── features/         # Feature modules (video, shorts, etc.)
├── hooks/            # Shared custom hooks
├── shared/
│   ├── stores/       # Zustand stores
│   ├── utils/        # Utilities (cn(), formatting)
│   └── lib/          # Design tokens, validations
└── types/            # TypeScript interfaces
```

---

## Core Patterns

### Components
- **Server Components by default** – Add `'use client'` only when needed (hooks, interactivity)
- **Colocated structure** – Route-specific components in `_components/` folder
- **Design system usage** – Import from `@/components/ui` (PageHeader, MediaCard, etc.)

### State Management
- **TanStack Query** – For server state (data fetching, caching, mutations)
  - Hooks: `useVideo(id)`, `useVideoList()`, `useToggleLike()`
  - Mutations: `useToggleLike.mutate(videoId)`
  - See: `docs/agents/api-design.md`

- **Zustand stores** – For client state (UI, preferences)
  - Import: `import { useAuthStore } from '@/shared/stores/auth-store'`
  - See: `docs/agents/state-management.md`

### Server Actions
- Colocated in `_actions.ts` files next to routes
- Examples: `(auth)/sign-in/_actions.ts`, `studio/upload/video/_actions.ts`
- See: `docs/agents/server-actions.md`

### Styling
- Use **Tailwind CSS** with `cn()` utility from `@/shared/utils/formatting`
- Design tokens in `src/shared/lib/design-tokens.ts`
- Primary brand color: `#ab0013` (hover: `#d4001a`)
- See: `docs/agents/styling.md`

---

## When to Read Layer 2 Docs

Load specialized docs **when working on that specific area**:

| Task | Read |
|------|------|
| **Building components** | `docs/agents/styling.md` |
| **Fetching data / API calls** | `docs/agents/api-design.md` |
| **Writing tests** | `docs/agents/testing.md` |
| **Refactoring code** | `docs/agents/refactoring.md` |
| **Auth / protected routes** | `docs/agents/authentication.md` |
| **Zustand stores / client state** | `docs/agents/state-management.md` |
| **Server actions** | `docs/agents/server-actions.md` |
| **Video, Shorts, Series, Courses, Posts specs** | `docs/agents/content-types.md` |
| **Upload API / Bunny.net TUS / Video processing** | `docs/agents/upload-api.md` |
| **Comments API (video, shorts, posts)** | `docs/agents/api-design.md` (Comments section) |
| **Backend API / database schema** | `docs/agents/database.md` |

---

## Critical Rules (Apply Always)

1. **Type everything** – No `any` types; use `unknown` if necessary
2. **Use path aliases** – `@/` maps to `src/` (e.g., `@/components/ui`)
3. **Preserve design tokens** – Don't hardcode colors; use Tailwind classes or design-tokens.ts
4. **Optimize for Core Web Vitals** – See: `.agents/skills/vercel-react-best-practices/AGENTS.md`
5. **Follow naming conventions**:
   - Components: PascalCase
   - Functions/hooks: camelCase
   - Constants: SCREAMING_SNAKE_CASE
   - Files: kebab-case (except components)
6. **Icon library** – Use `lucide-react` for all icons
7. **Environment variables** – Copy `.env.local.example` to `.env.local` for local dev

---

## Agent Skills Registry

**Agent Skills** are specialized knowledge modules that automate development tasks. Invoke a skill when you need expertise in that domain.

### How to Use Skills

When you see a trigger keyword, mention the skill name:
- "I need to refactor this" → Use **refactoring-patterns** skill
- "Type this function" → Use **typescript-patterns** skill
- "Fix the bundle size" → Use **bundling-optimization** skill

### Available Skills

| Skill | Triggers | What It Does |
|-------|----------|-----------|
| **refactoring-patterns** | "Refactor", "Simplify", "Extract logic", "Too complex" | Extract functions/components, improve code clarity, reduce complexity |
| **api-integration** | "Create API client", "Write query hook", "Fetch data", "Handle errors" | TanStack Query patterns, API clients, error handling, type safety |
| **ui-components** | "Build component", "Design page", "Styling issue", "Make accessible" | Tailwind CSS, design tokens, shadcn integration, responsive design |
| **testing** | "Write tests", "Mock API", "Test fixtures", "Coverage" | Vitest patterns, component testing, fixtures, mocking with MSW |
| **typescript-patterns** | "Fix TS error", "Type this", "Strict mode", "Create generic" | Type safety, utility types, generics, type guards, interfaces |
| **bundling-optimization** | "Bundle too large", "Code splitting", "Lazy load", "Analyze bundle" | Code splitting, lazy loading, dynamic imports, performance optimization |
| **code-organization** | "Where does this go?", "Module structure", "Circular dependency" | Feature modules, boundaries, file structure, dependency management |
| **linting-practices** | "ESLint error", "Fix lint", "Pre-commit checks" | Linting, Prettier, type-checking, code quality gates |
| **clean-code** | "Simplify", "Better naming", "Remove duplication" | Pragmatic coding standards, DRY, KISS, YAGNI, SRP |
| **component-refactoring** | "Component too complex", "High complexity score" | Advanced component splitting, hook extraction, complexity reduction |
| **vercel-react-best-practices** | "Performance optimization", "React best practices" | Core Web Vitals, Vercel engineering standards, React patterns |
| **commit-work** | "Create commit", "Commit message", "Stage changes" | Git workflow, conventional commits, reviewing changes |

---

## For Deep Research

When you need comprehensive reference material (rare):

| Topic | Location |
|-------|----------|
| **Full architecture** | `docs/reference/architecture.md` |
| **Complete design system** | `docs/reference/design-system-complete.md` |
| **All available skills** | `docs/reference/skills.md` |
| **Component library reference** | `docs/reference/components-library.md` |

---

## Setup & First Run

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start dev server
npm run dev
# Open http://localhost:3000
```

**Backend:** Connects to Laravel API via `NEXT_PUBLIC_API_URL` environment variable.

---

## Need Help?

- **"How do I...?"** → Check the Layer 2 docs (see "When to Read" table above)
- **"What's the pattern for...?"** → Check AGENTS.md (this file) or relevant Layer 2 doc
- **"Show me an example"** → Search `src/` for similar implementation
- **"Full context needed"** → Load the Layer 3 reference docs

---

*Architecture: Three-Layer Progressive Disclosure (v1.0)*  
*Last updated: January 2026*
