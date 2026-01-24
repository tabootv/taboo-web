# Refactor Context & Best Practices

This file contains shared guidance referenced by all epic files.

---

## Table of Contents

1. [Gap Analysis - Current Violations](#gap-analysis---current-violations)
2. [Ideal Structure](#ideal-structure)
3. [Comprehensive Risk Matrix](#comprehensive-risk-matrix)
4. [Best Practices & Conventions](#best-practices--conventions)
5. [CI/CD Integration](#cicd-integration)
6. [Metrics Strategy](#metrics-strategy)
7. [Merge & Rollback Checklists](#merge--rollback-checklists)
8. [Validation Scripts](#validation-scripts)

---

## Gap Analysis - Current Violations

### Bundle Size Violations (CRITICAL)

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

### Colocation Violations

**Violation: Route-Specific Components Not Colocated**

- `src/components/home/` → Should be `app/(main)/home/_components/`
- `src/components/sections/CreatorProfile/` → Should be `app/(main)/creators/[handler]/_components/`
- `src/components/video/` → Should be `app/(main)/videos/_components/` or `features/video/components/`
- `src/components/series/` → Should be `app/(main)/series/_components/`
- `src/components/courses/` → Should be `app/(main)/courses/_components/`

### Duplicate Routes (CRITICAL)

- **Auth**: `login/`, `sign-in/`, `sign-up/`, `signup/`, `register/` (5 routes)
- **Content**: `content/` vs `contents/`
- **Search**: `search/` vs `searches/`

### Redundant Directory Structures

- Nested components: `components/home/components/`, `components/ui/components/`
- Route group redundancy: `app/(studio)/studio/`
- Utility duplication: `src/shared/` vs `src/lib/`

### Server Actions Underutilization

- Only 5 server actions, all centralized in `src/server/actions/auth.actions.ts`
- Should be colocated with routes: `app/[route]/_actions.ts`

### React.cache() Underutilization

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
- TypeScript errors
- Build failures
- Test failures
- Coverage decreases
- Bundle size increases >5% (without justification)
- Build time increases >10% (without justification)
- Redirect verification fails (if redirects changed)

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
// Validate redirect chains (max 1 hop)
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
