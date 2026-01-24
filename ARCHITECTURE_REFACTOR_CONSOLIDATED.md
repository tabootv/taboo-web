# Architecture Refactor - Consolidated Execution Plan

**Status**: Ready for Execution  
**Last Updated**: 2026-01-23  
**Version**: 3.0 (Consolidated)

---

## Table of Contents

1. [Gap Analysis - Current Violations](#gap-analysis---current-violations)
2. [Ideal Structure](#ideal-structure)
3. [Detailed PR Breakdown](#detailed-pr-breakdown)
4. [Comprehensive Risk Matrix](#comprehensive-risk-matrix)
5. [Best Practices & Conventions](#best-practices--conventions)
6. [CI/CD Integration](#cicd-integration)
7. [Metrics Strategy](#metrics-strategy)
8. [Merge & Rollback Checklists](#merge--rollback-checklists)
9. [Validation Scripts](#validation-scripts)

---

## Gap Analysis - Current Violations

### 1.1 Bundle Size Violations (CRITICAL)

**Violation: Barrel File Imports (`bundle-barrel-imports`)**

- **Location**: Multiple `index.ts` files throughout codebase
- **Impact**: 200-800ms import cost, slow builds
- **Examples**:
  - `src/types/index.ts` - **849 lines**, monolithic barrel file (CRITICAL)
  - `src/api/client/index.ts` - 36 lines, exports 14+ API clients
  - `src/api/queries/index.ts` - 19 lines, exports 19 query hooks
  - `src/components/home/index.ts` - Re-exports 25+ components
  - `src/components/ui/index.ts` - Re-exports 20+ components
  - `src/components/series/index.ts`, `src/components/studio/index.ts`, etc.
  - `src/features/video/index.ts`, `src/features/shorts/index.ts`

**Current Pattern**: `import { Button, Input } from '@/components/ui'`

**Required Pattern**: `import { Button } from '@/components/ui/button'`

### 1.2 Colocation Violations

**Violation: Route-Specific Components Not Colocated**

- `src/components/home/` → Should be `app/(main)/home/_components/`
- `src/components/sections/CreatorProfile/` → Should be `app/(main)/creators/[handler]/_components/`
- `src/components/video/` → Should be `app/(main)/videos/_components/` or `features/video/components/`
- `src/components/series/` → Should be `app/(main)/series/_components/`
- `src/components/courses/` → Should be `app/(main)/courses/_components/`

### 1.3 Duplicate Routes (CRITICAL)

- **Auth**: `login/`, `sign-in/`, `sign-up/`, `signup/`, `register/` (5 routes)
- **Content**: `content/` vs `contents/`
- **Search**: `search/` vs `searches/`

### 1.4 Redundant Directory Structures

- Nested components: `components/home/components/`, `components/ui/components/`
- Route group redundancy: `app/(studio)/studio/`
- Utility duplication: `src/shared/` vs `src/lib/`

### 1.5 Server Actions Underutilization

- Only 5 server actions, all centralized in `src/server/actions/auth.actions.ts`
- Should be colocated with routes: `app/[route]/_actions.ts`

### 1.6 React.cache() Underutilization

- Only used in 1 file: `src/lib/api/home-data.ts`
- Should be used for non-fetch operations (DB calls, file system)

---

## Ideal Structure

```
src/
├── app/                          # Next.js App Router (routes only)
│   ├── (auth)/                   # Route group (no URL segment)
│   │   ├── sign-in/
│   │   │   ├── page.tsx
│   │   │   ├── _actions.ts       # Server actions colocated
│   │   │   └── _components/      # Route-specific components
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (main)/                   # Route group (no URL segment)
│   │   ├── home/
│   │   │   ├── page.tsx
│   │   │   └── _components/      # Homepage-specific components
│   │   ├── videos/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── _components/
│   │   │   ├── page.tsx
│   │   │   └── _components/      # Video listing components
│   │   └── layout.tsx
│   ├── studio/                   # Direct route (no route group)
│   │   ├── upload/
│   │   │   ├── video/
│   │   │   │   ├── page.tsx
│   │   │   │   └── _actions.ts   # Server actions colocated
│   │   └── layout.tsx
│   └── api/                      # Next.js API routes
│
├── components/                   # ONLY truly shared components
│   ├── ui/                       # Design system primitives (no barrel files)
│   │   ├── button.tsx            # Direct: from '@/components/ui/button'
│   │   ├── input.tsx
│   │   └── ...
│   └── layout/                    # Shared layout components
│       ├── navbar.tsx
│       └── footer.tsx
│
├── features/                     # Feature modules (business logic)
│   ├── video/
│   │   ├── components/           # Reusable video components
│   │   ├── hooks/
│   │   └── stores/
│   └── shorts/
│
├── api/                          # TanStack Query layer
│   ├── client/                   # NO barrel file
│   │   ├── auth.client.ts        # Direct: from '@/api/client/auth.client'
│   │   └── video.client.ts
│   ├── queries/                  # NO barrel file
│   │   ├── video.queries.ts      # Direct: from '@/api/queries/video.queries'
│   └── mutations/                # NO barrel file
│
├── shared/                       # Utilities (canonical location)
│   ├── lib/                      # Library instances (query-client, etc.)
│   ├── utils/                    # Pure helper functions
│   └── stores/                   # Zustand stores
│
└── types/                        # Global types only
    ├── user.ts                   # User, Auth, Profile
    ├── api.ts                    # ApiResponse, PaginatedResponse
    └── ui.ts                     # ButtonVariant, HeadingLevel
```

---

## Detailed PR Breakdown

### Epic 1: Barrel Files Elimination (CRITICAL)

**Priority**: P0  
**Duration**: 1-2 weeks  
**PRs**: 8-10

#### PR 1.1: Setup Measurement & Baseline

**Deliverable**: Metrics baseline, automation tools setup

**Tasks**:
- [ ] Create `scripts/measure-bundle.js`
- [ ] Create `scripts/measure-build-time.js`
- [ ] Create `scripts/measure-hmr.js`
- [ ] Run baseline measurements (commit to `metrics/baseline.json`)
- [ ] Setup `jscodeshift` with codemod templates
- [ ] Create `.vscode/settings.json` for auto-import

**Validation**:
- [ ] Baseline metrics committed
- [ ] Build time: `<current>` seconds
- [ ] Bundle size: `<current>` KB
- [ ] HMR latency: `<current>` ms

**Rollback**: N/A (measurement only)

---

#### PR 1.2: Split Monolithic Types File

**Deliverable**: `src/types/index.ts` split into domain files

**Tasks**:
- [ ] Audit `src/types/index.ts` (849 lines) - categorize types
- [ ] Create `src/types/user.ts` - User, Auth, Profile types
- [ ] Create `src/types/api.ts` - ApiResponse, PaginatedResponse
- [ ] Create `src/types/ui.ts` - ButtonVariant, HeadingLevel
- [ ] **Colocate API-specific types**:
  - Move `Video`, `Series`, `Course` → `src/api/client/video.client.ts`
  - Move auth types → `src/api/client/auth.client.ts`
- [ ] Update `src/types/index.ts` (delete or minimal re-exports)
- [ ] Run codemod: `from '@/types'` → specific paths

**Decision Criteria**:
- ✅ **Colocate**: Types used exclusively by one API client
- ✅ **Keep in `types/`**: Types used by 3+ modules or truly global
- ⚠️ **Exception**: Types used by 2 modules - evaluate case-by-case

**Validation**:
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] Bundle size: `<baseline>` KB (should decrease slightly)

**Rollback**: Revert PR, restore `src/types/index.ts`

**Risk**: Medium  
**Mitigation**: TypeScript validation, incremental migration

---

#### PR 1.3: Remove API Client Barrel File

**Deliverable**: Delete `src/api/client/index.ts`, update imports

**Tasks**:
- [ ] Create codemod: `@/api/client` → `@/api/client/{specific}.client`
- [ ] Run codemod across codebase
- [ ] Delete `src/api/client/index.ts`
- [ ] Verify no broken imports

**Validation**:
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] Bundle size: `<baseline - 50KB>` (estimated)

**Rollback**: Restore `src/api/client/index.ts`, revert imports

**Risk**: Low

---

#### PR 1.4: Remove API Queries Barrel File

**Deliverable**: Delete `src/api/queries/index.ts`, update imports

**Tasks**: Same pattern as PR 1.3

**Risk**: Low

---

#### PR 1.5: Remove Components UI Barrel File

**Deliverable**: Delete `src/components/ui/index.ts`, update imports

**Tasks**:
- [ ] Create codemod: `@/components/ui` → `@/components/ui/{component}`
- [ ] Run codemod (most critical, used everywhere)
- [ ] Delete `src/components/ui/index.ts`

**Exception Rule**: Small, stable re-exports (<5 items) can remain if:
- Used in 20+ files
- Rarely changes
- Documented as "stable API"

**Risk**: Medium (used everywhere)

---

#### PR 1.6-1.8: Remove Other Component Barrel Files

**Strategy**: One domain at a time

- PR 1.6: `src/components/home/index.ts` (colocate with route in Epic 2)
- PR 1.7: `src/components/series/index.ts`, `courses/index.ts`, etc. (one PR per domain)
- PR 1.8: `src/features/*/index.ts` (one PR per feature)

**Risk**: Medium (accumulates)

---

### Epic 2: Route-Specific Component Colocation (HIGH)

**Priority**: P1  
**Duration**: 1 week  
**PRs**: 6-8

#### PR 2.1: Define Colocation Rules

**Deliverable**: Documentation of component placement rules

**Rules**:
1. `app/[route]/_components/` - Components used ONLY by that route
2. `features/[feature]/components/` - Reusable across multiple routes for same feature
3. `components/ui/` - Truly shared design system primitives
4. `components/layout/` - Shared layout components

**Decision Tree**:
```
Used by single route?
├─ YES → app/[route]/_components/
└─ NO → Feature-specific?
    ├─ YES → features/[feature]/components/
    └─ NO → Design system?
        ├─ YES → components/ui/
        └─ NO → components/[domain]/
```

---

#### PR 2.2: Colocate Homepage Components

**Deliverable**: Move `src/components/home/*` → `app/(main)/home/_components/`

**Tasks**:
- [ ] Create `app/(main)/home/_components/` directory
- [ ] Move files from `src/components/home/*`
- [ ] Flatten `src/components/home/components/` → `_components/`
- [ ] Update imports in `app/(main)/home/page.tsx`
- [ ] Run codemod: `@/components/home` → `@/app/(main)/home/_components`
- [ ] Delete `src/components/home/` directory

**Validation**:
- [ ] Homepage loads correctly
- [ ] No broken imports
- [ ] TypeScript compilation passes

**Rollback**: Restore `src/components/home/`, revert imports

**Risk**: Medium

---

#### PR 2.3-2.7: Colocate Other Route Components

**Same pattern as PR 2.2**:
- PR 2.3: Creator Profile → `app/(main)/creators/[handler]/_components/`
- PR 2.4: Series → `app/(main)/series/_components/`
- PR 2.5: Courses → `app/(main)/courses/_components/`
- PR 2.6: Video → `app/(main)/videos/_components/` (or keep in `features/video/` if reusable)
- PR 2.7: Studio → `app/studio/_components/`

**Risk**: Medium (per PR)

---

### Epic 3: Route Consolidation & Redirects (CRITICAL)

**Priority**: P0  
**Duration**: 3-5 days  
**PRs**: 4-5

#### PR 3.1: Setup Redirect Infrastructure

**Deliverable**: Redirect configuration with HTTP 301

**Tasks**:
- [ ] Create redirect helper in `next.config.ts`
- [ ] Create `scripts/verify-redirects.js`
- [ ] Document redirect strategy

**Validation**:
- [ ] All redirects return HTTP 301
- [ ] No redirect loops
- [ ] Redirect chains max 1 hop

**Risk**: Low

---

#### PR 3.2: Consolidate Auth Routes

**Deliverable**: Redirect duplicate auth routes

**Tasks**:
- [ ] Add redirect: `/login` → `/sign-in` (HTTP 301)
- [ ] Add redirect: `/sign-up` → `/register` (HTTP 301)
- [ ] Delete `app/(auth)/signup/` directory
- [ ] Update internal links (codemod: `/login` → `/sign-in`)
- [ ] Update middleware if needed
- [ ] Update server actions paths

**Validation**:
- [ ] All redirects return 301
- [ ] Old routes redirect correctly
- [ ] No 404s on old routes
- [ ] SEO: Check redirect chains (max 1 hop)

**Rollback**: Remove redirects, restore deleted routes

**Risk**: High (SEO impact)

---

#### PR 3.3: Delete Content Routes

**Deliverable**: Remove `content/` and `contents/` routes

**Tasks**:
- [ ] Audit external links (Google Search Console)
- [ ] If external links exist: Add redirects to `app/studio/*` (301)
- [ ] Delete `app/(main)/content/` directory
- [ ] Delete `app/(main)/contents/` directory
- [ ] Update internal links

**Risk**: Medium

---

#### PR 3.4: Consolidate Search Routes

**Deliverable**: Redirect `/search` → `/searches`

**Tasks**: Same pattern as PR 3.2

**Risk**: Medium

---

### Epic 4: Utility Directory Consolidation (MEDIUM)

**Priority**: P2  
**Duration**: 2-3 days  
**PRs**: 2-3

#### PR 4.1: Define Utility Organization Rules

**Deliverable**: Clear rules for `shared/` vs `lib/` vs `utils/`

**Rules**:
- `src/shared/lib/` - Library instances (Prisma, Stripe, query-client)
- `src/shared/utils/` - Pure helper functions (date formatting, string manipulation)
- `src/shared/stores/` - Zustand stores
- Max 3 levels deep
- Clear naming conventions

---

#### PR 4.2: Migrate `lib/` to `shared/`

**Deliverable**: Consolidate utilities

**Tasks**:
- [ ] Move `src/lib/stores/*` → `src/shared/stores/`
- [ ] Move `src/lib/utils/*` → `src/shared/utils/`
- [ ] Move `src/lib/api/*` → `src/shared/lib/api/`
- [ ] Move `src/lib/design-tokens.ts` → `src/shared/lib/design-tokens.ts`
- [ ] Update all imports (codemod: `@/lib/` → `@/shared/lib/` or `@/shared/utils/`)
- [ ] Delete `src/lib/` directory

**Validation**:
- [ ] All imports resolve
- [ ] TypeScript compilation passes
- [ ] Build succeeds

**Rollback**: Restore `src/lib/`, revert imports

**Risk**: Low-Medium

---

### Epic 5: Server Actions Migration (HIGH)

**Priority**: P1  
**Duration**: 1 week  
**PRs**: 4-5

#### PR 5.1: Define Server Actions Strategy

**Deliverable**: Guidelines for when to use Server Actions vs TanStack Query

**Decision Criteria**:
- ✅ **Server Actions**: Server-side validation, sensitive operations, automatic cache revalidation, file uploads
- ✅ **TanStack Query**: Optimistic UI, polling/real-time, client-side state, retry logic
- ✅ **Hybrid**: Server Action for mutation + TanStack Query for optimistic UI

---

#### PR 5.2: Colocate Existing Server Actions

**Deliverable**: Move actions to route-specific locations

**Tasks**:
- [ ] Move `src/server/actions/auth.actions.ts` → Split:
  - `app/(auth)/sign-in/_actions.ts` - loginAction
  - `app/(auth)/register/_actions.ts` - registerAction
  - `app/(auth)/forgot-password/_actions.ts` - password actions
- [ ] Update all imports
- [ ] Delete `src/server/actions/` directory

**Validation**:
- [ ] All actions work correctly
- [ ] No broken imports
- [ ] Auth flows tested

**Risk**: Medium

---

#### PR 5.3-5.5: Migrate Appropriate Mutations

**Strategy**: Identify mutations that should be Server Actions

**Candidates**:
- Video upload → `app/studio/upload/video/_actions.ts`
- Profile updates → `app/(main)/profile/edit/_actions.ts`
- Content deletion → Colocate with respective routes

**Risk**: Medium

---

### Epic 6: React.cache() Optimization (MEDIUM)

**Priority**: P2  
**Duration**: 2-3 days  
**PRs**: 2-3

#### PR 6.1: Audit Non-Fetch Operations

**Deliverable**: List of operations needing `React.cache()`

**Note**: Next.js 15+ deduplicates `fetch()` automatically - **DO NOT** wrap `fetch()`.

**Tasks**:
- [ ] Find all non-`fetch()` async operations in Server Components
- [ ] Identify: Direct DB calls, file system ops, third-party clients
- [ ] Document candidates

---

#### PR 6.2: Apply React.cache()

**Deliverable**: Wrap identified operations

**Tasks**:
- [ ] Wrap direct database calls with `React.cache()`
- [ ] Wrap file system operations
- [ ] Test per-request deduplication

**Validation**:
- [ ] No duplicate requests in same render
- [ ] Performance improved (measure)

**Risk**: Low

---

## Comprehensive Risk Matrix

| Risk | Severity | Likelihood | Impact | Mitigation Strategy | Detection Method |
|------|----------|------------|--------|---------------------|------------------|
| **Broken Imports** | High | Medium | Build failures, runtime errors | Automated codemods + TypeScript validation + CI type-check | TypeScript compiler, CI build job |
| **Build Failures** | Critical | Low | Deployment blocked | Incremental PRs, test builds before merge | CI build job, pre-merge validation |
| **Regression Bugs** | High | Medium | Broken functionality | Comprehensive test suite, smoke tests | Automated tests, manual QA, error monitoring |
| **UX Regressions** | High | Low | User-facing issues | Manual smoke tests, visual regression testing | Manual testing, E2E tests, error tracking |
| **SEO Impact** | Critical | Medium | Search ranking loss | HTTP 301 redirects, redirect testing, 404 monitoring | Redirect verification script, 404 tracking |
| **Bundle Size Ambiguity** | Medium | Medium | Unclear improvements | Automated measurement, baseline comparison | Bundle analyzer, CI metrics job |
| **Server Actions Misuse** | Medium | Low | Performance/security issues | Clear guidelines, code review, examples | Code review, linting rules |
| **Test Relocation Issues** | Medium | Low | False negatives, coverage loss | Git mv for history, test discovery verification | Test runner, coverage reports |
| **Import Path Confusion** | Medium | High | Developer friction | IDE auto-import config, documentation | Developer feedback, import errors |
| **Redirect Chains** | High | Low | SEO penalties | Direct redirects (max 1 hop), testing | Redirect verification script |
| **Type Definition Conflicts** | Medium | Medium | Type errors, confusion | Clear DTO vs domain separation, naming conventions | TypeScript compiler, code review |

---

## Best Practices & Conventions

### A) Barrel Files - Acceptable Exceptions

**Small, Stable Re-exports (<5 items) are acceptable if**:
- Used in 20+ files
- Rarely changes (stable API)
- Documented as "stable API"

**Automated Elimination**:
- Use codemod for barrels with 10+ exports
- Manual review for small barrels (5-10 exports)
- Keep if meets exception criteria

### B) Colocation Rules

**Component Placement Decision Tree**:
```
Used by single route?
├─ YES → app/[route]/_components/
└─ NO → Feature-specific?
    ├─ YES → features/[feature]/components/
    └─ NO → Design system?
        ├─ YES → components/ui/
        └─ NO → components/[domain]/
```

**Exception**: Used by 2 routes
- Related routes (parent/child) → Colocate with parent
- Unrelated routes → Move to `features/` or `components/`

### C) Route Redirects

**HTTP 301 Only**:
- Never use 302 (temporary)
- Test all redirects before merge
- Monitor 404s after deployment
- Keep redirects for 6+ months minimum

### D) Server Actions vs TanStack Query

**Use Server Actions When**:
- Server-side validation required
- Sensitive operations
- Automatic cache revalidation needed
- File uploads

**Use TanStack Query When**:
- Optimistic UI updates
- Polling/real-time
- Client-side state
- Retry logic needed

**Hybrid Approach**: Server Action for mutation + TanStack Query for optimistic UI

### E) Type Definitions Strategy

**API DTOs**: Colocate with API client (`src/api/client/video.client.ts`)

**Domain Types**: Keep in `src/types/` (`src/types/video.ts`)

**Adapter Pattern**: Use adapters to convert DTO → Domain

### F) Shared vs Lib

**`src/shared/lib/`**: Library instances only

**`src/shared/utils/`**: Pure helper functions

**Prevent Kitchen Sink**: Max 3 levels deep, clear naming, regular audits

### G) Test Relocation

**Patterns**:
- Use `git mv` to preserve history
- Update test imports after move
- Verify test discovery works
- Run test suite after each move

### H) PR Size & Merge Rules

**PR Size Guidelines**:
- Max 20 files changed per PR
- One domain/route per PR
- Clear, testable deliverables
- Independent merges (no blocking)

**Merge Guards**:
- Require CI to pass
- Require metrics comparison
- Require manual review
- No blocking other PRs

---

## CI/CD Integration

### Enhanced CI Pipeline

Add to `.github/workflows/ci.yml`:

```yaml
jobs:
  # Existing jobs...

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - name: Measure build time
        run: |
          START=$(date +%s)
          npm run build
          END=$(date +%s)
          BUILD_TIME=$((END - START))
          echo "Build time: ${BUILD_TIME}s"
      - name: Measure bundle size
        run: |
          ANALYZE=true npm run build
          node scripts/measure-bundle.js

  verify-redirects:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, 'redirect')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run build
      - name: Verify redirects
        run: node scripts/verify-redirects.js
```

### CI Gate Requirements

**Block Merge If**:
- ❌ TypeScript errors
- ❌ Build failures
- ❌ Test failures
- ❌ Coverage decreases
- ❌ Bundle size increases >5% (without justification)
- ❌ Build time increases >10% (without justification)
- ❌ Redirect verification fails (if redirects changed)

---

## Metrics Strategy

### Baseline Measurement

**Script**: `scripts/measure-baseline.js`

```javascript
const metrics = {
  timestamp: new Date().toISOString(),
  buildTime: { cold: 45.2, unit: "seconds" },
  bundleSize: { total: 2140, unit: "KB" },
  hmrLatency: { average: 320, unit: "ms" },
  testCoverage: { lines: 69, unit: "percent" },
  typescriptCompilation: { time: 12.5, unit: "seconds" },
};
```

### Success Thresholds

| Metric | Baseline | Target | Threshold (Fail If) |
|--------|----------|--------|---------------------|
| Build Time (cold) | 45.2s | 36.2s (-20%) | >49.7s (+10%) |
| Bundle Size (total) | 2140 KB | 1819 KB (-15%) | >2247 KB (+5%) |
| HMR Latency (avg) | 320ms | 224ms (-30%) | >384ms (+20%) |
| Test Coverage (lines) | 69% | 69%+ | <69% |

---

## Merge & Rollback Checklists

### Pre-Merge Checklist

**Technical**:
- [ ] TypeScript: `npm run type-check` passes (0 errors)
- [ ] Build: `npm run build` succeeds
- [ ] Tests: `npm run test` passes (coverage maintained)
- [ ] Lint: `npm run lint` passes (0 warnings)

**Metrics**:
- [ ] Bundle size measured and within threshold
- [ ] Build time measured and within threshold
- [ ] Test coverage maintained or improved

**Functional**:
- [ ] Affected routes tested manually
- [ ] No broken imports (verified)
- [ ] No 404s introduced (if route changes)
- [ ] Redirects verified (if route changes)

**CI/CD**:
- [ ] All CI jobs pass
- [ ] Performance benchmarks within thresholds
- [ ] No regression in coverage

### Rollback Checklist

**Per-PR Rollback**:
1. [ ] Identify problematic PR
2. [ ] Revert commit: `git revert <commit-hash>`
3. [ ] Verify: Run validation checklist
4. [ ] Deploy: Hotfix deployment if needed
5. [ ] Document: Log rollback reason

**Epic-Level Rollback**:
1. [ ] Identify last good state
2. [ ] Create rollback branch: `git checkout -b rollback/epic-<n>`
3. [ ] Revert PRs in reverse order
4. [ ] Test: Full test suite
5. [ ] Deploy: Emergency deployment
6. [ ] Post-mortem: Document learnings

---

## Validation Scripts

### `scripts/verify-redirects.js`

```javascript
// Verify all redirects return HTTP 301
// Check for redirect loops
// Validate redirect chains
```

### `scripts/detect-barrels.js`

```javascript
// Detect barrel files with >5 exports
// Report for review
```

### `scripts/measure-bundle.js`

```javascript
// Measure bundle size from .next/analyze output
// Compare against baseline
// Fail if increase >5%
```

---

## Migration Order

1. **Epic 1** (Barrel files) - **CRITICAL**, do first, highest impact
2. **Epic 3** (Routes) - **CRITICAL**, prevents confusion
3. **Epic 2** (Colocation) - HIGH, improves organization
4. **Epic 5** (Server actions) - HIGH, improves security
5. **Epic 4, 6** - MEDIUM/LOW, can be done in parallel

---

## Success Criteria

### Must Have

- ✅ All barrel files removed (except exceptions)
- ✅ All routes consolidated with proper redirects
- ✅ Components colocated correctly
- ✅ Build time improved by 15%+
- ✅ Bundle size reduced by 10%+
- ✅ No broken imports
- ✅ All tests pass
- ✅ No SEO regressions

### Nice to Have

- ⭐ HMR latency improved by 20%+
- ⭐ Test coverage maintained or improved
- ⭐ Developer ergonomics improved
- ⭐ Documentation complete

---

**End of Consolidated Execution Plan**
