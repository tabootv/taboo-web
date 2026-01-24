# Architecture Refactor - Detailed Execution Plan

**Status**: Planning Phase  
**Last Updated**: 2026-01-23  
**Estimated Duration**: 4-6 weeks (incremental PRs)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Epic Breakdown](#epic-breakdown)
3. [Risk Matrix](#risk-matrix)
4. [Decision Criteria & Exceptions](#decision-criteria--exceptions)
5. [Metrics Dashboard](#metrics-dashboard)
6. [Rollback Procedures](#rollback-procedures)
7. [Validation Checklists](#validation-checklists)

---

## Executive Summary

This plan transforms the high-level architecture refactor into **incremental, low-risk PRs** that can be merged independently. Each PR includes:

- Automated validation
- Rollback procedures
- Metrics measurement
- Clear acceptance criteria

**Total Epics**: 6  
**Total PRs**: ~25-30 (incremental)  
**Estimated Risk**: Medium-High (mitigated through incremental approach)

---

## Epic Breakdown

### Epic 1: Barrel Files Elimination (CRITICAL)

**Priority**: P0 - Highest Impact  
**Duration**: 1-2 weeks  
**PRs**: 8-10

#### PR 1.1: Setup Measurement & Baseline

**Deliverable**: Metrics baseline, automation tools setup

**Tasks**:

- [ ] Create `scripts/measure-bundle.js` to measure bundle size
- [ ] Create `scripts/measure-build-time.js` to track build performance
- [ ] Run baseline measurements (commit results)
- [ ] Setup `jscodeshift` with initial codemod templates
- [ ] Create `.vscode/settings.json` for auto-import configuration

**Validation**:

- [ ] Baseline metrics committed to `metrics/baseline.json`
- [ ] Build time: `<current>` seconds
- [ ] Bundle size: `<current>` KB
- [ ] HMR latency: `<current>` ms

**Rollback**: N/A (measurement only)

---

#### PR 1.2: Split Monolithic Types File

**Deliverable**: `src/types/index.ts` split into domain files

**Tasks**:

- [ ] Audit `src/types/index.ts` (849 lines) - categorize types
- [ ] Create domain-specific type files:
  - `src/types/user.ts` - User, Auth, Profile types
  - `src/types/api.ts` - ApiResponse, PaginatedResponse
  - `src/types/ui.ts` - ButtonVariant, HeadingLevel
- [ ] **Colocate API-specific types** with clients:
  - Move `Video`, `Series`, `Course` → `src/api/client/video.client.ts`
  - Move auth types → `src/api/client/auth.client.ts`
- [ ] Update `src/types/index.ts` to re-export only global types (or delete)
- [ ] Run codemod to update imports: `from '@/types'` → specific paths

**Decision Criteria**:

- ✅ **Colocate**: Types used exclusively by one API client
- ✅ **Keep in `types/`**: Types used by 3+ modules or truly global
- ⚠️ **Exception**: Types used by 2 modules - evaluate case-by-case

**Validation**:

- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] All imports resolve correctly
- [ ] Bundle size: `<baseline>` KB (should decrease slightly)

**Rollback**: Revert PR, restore `src/types/index.ts`

**Risk**: Medium

- **Mitigation**:
  - Use TypeScript compiler to catch errors early
  - Test in feature branch before PR
  - Incremental migration (one domain at a time)

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
- [ ] Build time: `<baseline - 2s>` (estimated)

**Rollback**: Restore `src/api/client/index.ts`, revert import changes

**Risk**: Low

- **Mitigation**: Automated codemod, TypeScript validation

---

#### PR 1.4: Remove API Queries Barrel File

**Deliverable**: Delete `src/api/queries/index.ts`, update imports

**Tasks**:

- [ ] Create codemod: `@/api/queries` → `@/api/queries/{specific}.queries`
- [ ] Run codemod across codebase
- [ ] Delete `src/api/queries/index.ts`

**Validation**: Same as PR 1.3

**Risk**: Low

---

#### PR 1.5-1.8: Remove Component Barrel Files (Incremental)

**Strategy**: One domain at a time to minimize risk

**PR 1.5**: Remove `src/components/ui/index.ts`

- Most critical (used everywhere)
- Use codemod: `@/components/ui` → `@/components/ui/{component}`
- **Exception Rule**: Small, stable re-exports (<5 items) can remain if:
  - Used in 20+ files
  - Rarely changes
  - Documented as "stable API"

**PR 1.6**: Remove `src/components/home/index.ts`

- Colocate with route (Epic 2)

**PR 1.7**: Remove `src/components/series/index.ts`, `courses/index.ts`, etc.

- One PR per domain

**PR 1.8**: Remove feature barrel files (`src/features/*/index.ts`)

- One PR per feature

**Validation Checklist** (for each):

- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] Bundle size measured
- [ ] HMR latency measured
- [ ] Manual smoke test (affected routes)

**Risk**: Medium (accumulates across PRs)

- **Mitigation**: Incremental, one domain at a time

---

### Epic 2: Route-Specific Component Colocation (HIGH)

**Priority**: P1  
**Duration**: 1 week  
**PRs**: 6-8

#### PR 2.1: Define Colocation Rules

**Deliverable**: Documentation of component placement rules

**Rules**:

1. **`app/[route]/_components/`**: Components used ONLY by that route
2. **`features/[feature]/components/`**: Reusable components across multiple routes for same feature
3. **`components/ui/`**: Truly shared design system primitives
4. **`components/layout/`**: Shared layout components (navbar, footer)

**Decision Tree**:

```
Is component used by single route?
├─ YES → app/[route]/_components/
└─ NO → Is it feature-specific?
    ├─ YES → features/[feature]/components/
    └─ NO → Is it design system?
        ├─ YES → components/ui/
        └─ NO → components/[domain]/
```

**Exception**: Components used by 2 routes - evaluate:

- If routes are related (e.g., `/videos` and `/videos/[id]`) → colocate with parent route
- If routes are unrelated → move to `features/` or `components/`

---

#### PR 2.2: Colocate Homepage Components

**Deliverable**: Move `src/components/home/*` → `app/(main)/home/_components/`

**Tasks**:

- [ ] Create `app/(main)/home/_components/` directory
- [ ] Move files from `src/components/home/*`
- [ ] Flatten `src/components/home/components/` → `_components/`
- [ ] Update imports in `app/(main)/home/page.tsx`
- [ ] Run codemod to update all imports: `@/components/home` → `@/app/(main)/home/_components`
- [ ] Delete `src/components/home/` directory

**Validation**:

- [ ] Homepage loads correctly
- [ ] No broken imports
- [ ] TypeScript compilation passes
- [ ] Build succeeds

**Rollback**: Restore `src/components/home/`, revert imports

**Risk**: Medium

- **Mitigation**:
  - Test homepage thoroughly
  - Keep old directory until validation passes
  - Use git mv to preserve history

---

#### PR 2.3-2.7: Colocate Other Route Components

**Same pattern as PR 2.2**:

- PR 2.3: Creator Profile → `app/(main)/creators/[handler]/_components/`
- PR 2.4: Series → `app/(main)/series/_components/`
- PR 2.5: Courses → `app/(main)/courses/_components/`
- PR 2.6: Video → `app/(main)/videos/_components/` (or keep in `features/video/` if reusable)
- PR 2.7: Studio → `app/studio/_components/`

**Risk**: Medium (per PR)

- **Mitigation**: Incremental, one route at a time

---

### Epic 3: Route Consolidation & Redirects (CRITICAL)

**Priority**: P0  
**Duration**: 3-5 days  
**PRs**: 4-5

#### PR 3.1: Setup Redirect Infrastructure

**Deliverable**: Redirect configuration with HTTP 301

**Tasks**:

- [ ] Create `next.config.redirects.ts` (or add to `next.config.ts`)
- [ ] Implement redirect helper with HTTP 301 verification
- [ ] Create `scripts/verify-redirects.js` to test redirects
- [ ] Document redirect strategy

**Redirect Implementation**:

```typescript
// next.config.ts
async redirects() {
  return [
    {
      source: '/login',
      destination: '/sign-in',
      permanent: true, // HTTP 301
    },
    // ... more redirects
  ];
}
```

**Validation**:

- [ ] All redirects return HTTP 301 (not 302)
- [ ] Redirects tested with curl/Postman
- [ ] No redirect loops

**Risk**: Low

---

#### PR 3.2: Consolidate Auth Routes

**Deliverable**: Redirect duplicate auth routes

**Tasks**:

- [ ] Add redirects: `/login` → `/sign-in` (301)
- [ ] Add redirects: `/sign-up` → `/register` (301)
- [ ] Delete `app/(auth)/signup/` directory
- [ ] Update internal links (codemod: `/login` → `/sign-in`)
- [ ] Update middleware if needed
- [ ] Update server actions paths

**Validation**:

- [ ] All redirects return 301
- [ ] Old routes redirect correctly
- [ ] No 404s on old routes
- [ ] SEO: Check redirect chains (max 1 hop)
- [ ] Internal links updated

**SEO Verification**:

- [ ] Use `curl -I` to verify 301 status
- [ ] Check redirect chains (should be direct, not chained)
- [ ] Verify no redirect loops

**Rollback**: Remove redirects, restore deleted routes

**Risk**: High (SEO impact)

- **Mitigation**:
  - HTTP 301 only (permanent)
  - Test all redirects before merge
  - Monitor 404s after deployment
  - Keep redirects for 6+ months

---

#### PR 3.3: Delete Content Routes

**Deliverable**: Remove `content/` and `contents/` routes

**Tasks**:

- [ ] Audit external links (Google Search Console, analytics)
- [ ] If external links exist: Add redirects to `app/studio/*` (301)
- [ ] Delete `app/(main)/content/` directory
- [ ] Delete `app/(main)/contents/` directory
- [ ] Update internal links
- [ ] Update sitemap/robots.txt

**Validation**:

- [ ] No broken internal links
- [ ] External redirects work (if added)
- [ ] 404s handled gracefully

**Risk**: Medium

- **Mitigation**: Check analytics for external links first

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

- **`src/shared/lib/`**: Library instances (Prisma, Stripe, query-client)
- **`src/shared/utils/`**: Pure helper functions (date formatting, string manipulation)
- **`src/shared/stores/`**: Zustand stores
- **Prevent "Kitchen Sink"**:
  - Max 3 levels deep
  - Clear naming conventions
  - Document purpose of each directory

**Exception**: If a utility is used by only one feature, consider colocating it.

---

#### PR 4.2: Migrate `lib/` to `shared/`

**Deliverable**: Consolidate utilities

**Tasks**:

- [ ] Move `src/lib/stores/*` → `src/shared/stores/`
- [ ] Move `src/lib/utils/*` → `src/shared/utils/` (pure functions)
- [ ] Move `src/lib/api/*` → `src/shared/lib/api/` (library instances)
- [ ] Move `src/lib/design-tokens.ts` → `src/shared/lib/design-tokens.ts`
- [ ] Update all imports (codemod: `@/lib/` → `@/shared/lib/` or `@/shared/utils/`)
- [ ] Delete `src/lib/` directory

**Validation**:

- [ ] All imports resolve
- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] No functionality broken

**Rollback**: Restore `src/lib/`, revert imports

**Risk**: Low-Medium

- **Mitigation**:
  - Use git mv to preserve history
  - Test thoroughly before deleting old directory

---

### Epic 5: Server Actions Migration (HIGH)

**Priority**: P1  
**Duration**: 1 week  
**PRs**: 4-5

#### PR 5.1: Define Server Actions Strategy

**Deliverable**: Guidelines for when to use Server Actions vs TanStack Query

**Decision Criteria**:

- ✅ **Use Server Actions**:
  - Mutations requiring server-side validation
  - Sensitive operations (auth, payments)
  - Operations needing automatic cache revalidation
  - File uploads
- ✅ **Use TanStack Query Mutations**:
  - Optimistic UI updates
  - Polling/real-time updates
  - Client-side state management
  - Operations needing retry logic

**Exception**: Hybrid approach - Server Action for mutation, TanStack Query for optimistic UI.

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

- **Mitigation**: Test auth flows thoroughly

---

#### PR 5.3-5.5: Migrate Appropriate Mutations

**Strategy**: Identify mutations that should be Server Actions

**Candidates**:

- Video upload → `app/studio/upload/video/_actions.ts`
- Profile updates → `app/(main)/profile/edit/_actions.ts`
- Content deletion → Colocate with respective routes

**Risk**: Medium

- **Mitigation**:
  - Don't break existing UX
  - Test each mutation before migrating
  - Keep TanStack Query for optimistic UI if needed

---

### Epic 6: React.cache() Optimization (MEDIUM)

**Priority**: P2  
**Duration**: 2-3 days  
**PRs**: 2-3

#### PR 6.1: Audit Non-Fetch Operations

**Deliverable**: List of operations needing `React.cache()`

**Tasks**:

- [ ] Find all non-`fetch()` async operations in Server Components
- [ ] Identify: Direct DB calls, file system ops, third-party clients
- [ ] Document candidates

**Note**: Next.js 15+ deduplicates `fetch()` automatically - **DO NOT** wrap `fetch()`.

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

## Risk Matrix

| Epic                    | Risk Level | Primary Risks                         | Mitigation                                                 |
| ----------------------- | ---------- | ------------------------------------- | ---------------------------------------------------------- |
| Epic 1 (Barrel Files)   | **Medium** | Broken imports, build failures        | Automated codemods, TypeScript validation, incremental PRs |
| Epic 2 (Colocation)     | **Medium** | Import errors, component not found    | Git mv for history, test each route, incremental migration |
| Epic 3 (Routes)         | **High**   | SEO penalties, 404s, redirect loops   | HTTP 301 only, redirect testing, monitor 404s              |
| Epic 4 (Utilities)      | **Low**    | Import errors                         | Git mv, codemod, test before delete                        |
| Epic 5 (Server Actions) | **Medium** | Broken auth, UX regressions           | Test auth flows, keep optimistic UI                        |
| Epic 6 (React.cache)    | **Low**    | Over-caching, performance regressions | Measure before/after, test deduplication                   |

---

## Decision Criteria & Exceptions

### A) Barrel Files - Acceptable Exceptions

**Small, Stable Re-exports (<5 items) are acceptable if**:

- Used in 20+ files
- Rarely changes (stable API)
- Documented as "stable API"
- Examples: `components/ui/button.tsx`, `components/ui/input.tsx` (if always used together)

**Automated Elimination**:

- Use codemod for barrels with 10+ exports
- Manual review for small barrels (5-10 exports)
- Keep if meets exception criteria

---

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

**Rollback**: Keep old directory until validation passes, use git mv

---

### C) Route Redirects

**HTTP 301 Only**:

- Never use 302 (temporary)
- Test all redirects before merge
- Monitor 404s after deployment
- Keep redirects for 6+ months minimum

**Verification**:

- `curl -I <old-url>` → Should return 301
- Check redirect chains (max 1 hop)
- No redirect loops

---

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

---

### E) Type Colocation

**Colocate with API Client When**:

- Type used exclusively by one API client
- Type is API DTO (Data Transfer Object)

**Keep in `types/` When**:

- Type used by 3+ modules
- Type is domain model (not DTO)
- Type is truly global

**Exception**: Used by 2 modules - evaluate case-by-case

**Migration Strategy**:

- Create type adapters if needed (DTO → Domain Model)
- Document type ownership

---

### F) Shared vs Lib

**`src/shared/lib/`**: Library instances only

- Prisma client
- Stripe client
- Query client
- Third-party SDKs

**`src/shared/utils/`**: Pure helper functions

- Date formatting
- String manipulation
- Array/object utilities
- No side effects

**Prevent Kitchen Sink**:

- Max 3 directory levels
- Clear naming conventions
- Document purpose
- Regular audits

---

### G) Test Relocation

**Patterns to Preserve Coverage**:

- Use `git mv` to preserve history
- Update test imports after move
- Run test suite after each move
- Check coverage reports

**Avoid False Negatives**:

- Test paths relative to new location
- Update test utilities if needed
- Verify test discovery works

---

### H) Metrics Measurement

**KPIs to Track**:

- Build time (seconds)
- Bundle size (KB)
- HMR latency (ms)
- Test pass rate (%)
- TypeScript compilation time (s)
- Redirect correctness (301 vs 302)

**Automated Scripts**:

- `scripts/measure-bundle.js`
- `scripts/measure-build-time.js`
- `scripts/measure-hmr.js`
- `scripts/verify-redirects.js`

**Before/After Comparison**:

- Commit baseline metrics
- Measure after each epic
- Compare in PR description

---

### I) PR Granularity

**PR Size Guidelines**:

- Max 20 files changed per PR
- One domain/route per PR
- Clear, testable deliverables
- Independent merges (no blocking)

**Checkpoints**:

- TypeScript compilation passes
- Build succeeds
- Tests pass
- Manual smoke test
- Metrics measured

**Merge Guards**:

- Require CI to pass
- Require metrics comparison
- Require manual review
- No blocking other PRs

---

## Metrics Dashboard

### Baseline Metrics (Pre-Refactor)

```json
{
  "timestamp": "2026-01-23T00:00:00Z",
  "buildTime": {
    "cold": 45.2,
    "incremental": 8.3,
    "unit": "seconds"
  },
  "bundleSize": {
    "main": 1250,
    "vendor": 890,
    "total": 2140,
    "unit": "KB"
  },
  "hmrLatency": {
    "average": 320,
    "p95": 450,
    "unit": "ms"
  },
  "testCoverage": {
    "statements": 68,
    "branches": 62,
    "functions": 71,
    "lines": 69,
    "unit": "percent"
  },
  "typescriptCompilation": {
    "time": 12.5,
    "errors": 0,
    "unit": "seconds"
  }
}
```

### Target Metrics (Post-Refactor)

- **Build Time**: -20% (36s cold, 6.6s incremental)
- **Bundle Size**: -15% (1819 KB total)
- **HMR Latency**: -30% (224ms average)
- **Test Coverage**: Maintain or improve
- **TypeScript Compilation**: -10% (11.25s)

### Measurement Scripts

**`scripts/measure-bundle.js`**:

```javascript
// Measure bundle size from .next/analyze output
// Compare against baseline
```

**`scripts/measure-build-time.js`**:

```javascript
// Time `npm run build` execution
// Track cold vs incremental builds
```

**`scripts/measure-hmr.js`**:

```javascript
// Measure HMR latency in dev mode
// Track average and p95
```

**`scripts/verify-redirects.js`**:

```javascript
// Verify all redirects return HTTP 301
// Check for redirect loops
// Validate redirect chains
```

---

## Rollback Procedures

### Per-PR Rollback

1. **Revert PR**: `git revert <commit-hash>`
2. **Verify**: Run validation checklist
3. **Deploy**: If already deployed, hotfix deployment
4. **Document**: Log rollback reason

### Epic-Level Rollback

1. **Identify Last Good State**: Find last successful deployment
2. **Create Rollback Branch**: `git checkout -b rollback/epic-<n>`
3. **Revert All PRs**: Revert in reverse order
4. **Test Thoroughly**: Full test suite
5. **Deploy**: Emergency deployment
6. **Post-Mortem**: Document issues and learnings

### Partial Rollback

- Keep successful PRs
- Revert only problematic PRs
- Fix issues in new PRs

---

## Validation Checklists

### Pre-PR Checklist

- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] No new warnings/errors
- [ ] Metrics measured and compared
- [ ] Manual smoke test (affected routes)
- [ ] Code review self-check

### Post-Merge Checklist

- [ ] CI/CD pipeline passes
- [ ] Staging deployment successful
- [ ] Smoke test on staging
- [ ] Monitor error logs (24 hours)
- [ ] Monitor 404s (if route changes)
- [ ] Verify metrics improvement
- [ ] Update documentation

### Epic Completion Checklist

- [ ] All PRs merged
- [ ] All validation checklists passed
- [ ] Metrics dashboard updated
- [ ] Documentation updated
- [ ] Team notified of changes
- [ ] Rollback plan tested (dry run)

---

## Tooling & Automation

### Codemods

**jscodeshift Setup**:

```bash
npm install -D jscodeshift @types/jscodeshift
```

**Example Codemod** (Remove barrel imports):

```javascript
// codemods/remove-barrel-imports.js
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Transform: from '@/components/ui' → from '@/components/ui/button'
  // ... implementation
}
```

### IDE Configuration

**.vscode/settings.json**:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

### Regex Patterns

**Find Barrel Imports**:

```regex
from ['"]@/(components|api|types|features)/['"]
```

**Replace with Specific Import**:

```regex
from ['"]@/components/ui['"] → from ['"]@/components/ui/button['"]
```

---

## Communication Plan

### Stakeholder Updates

- **Weekly Status**: Update team on progress
- **Blockers**: Immediate notification
- **Rollbacks**: Immediate notification + post-mortem

### Documentation Updates

- Update `AGENTS.md` with new patterns
- Update `README.md` with new structure
- Create migration guide for future reference

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

## Timeline

**Week 1-2**: Epic 1 (Barrel Files)  
**Week 2-3**: Epic 2 (Colocation)  
**Week 3**: Epic 3 (Routes)  
**Week 4**: Epic 4 (Utilities) + Epic 5 (Server Actions)  
**Week 5**: Epic 6 (React.cache) + Polish  
**Week 6**: Buffer for issues/rollbacks

**Total**: 4-6 weeks (incremental PRs)

---

## Next Steps

1. **Review & Approve Plan**: Team review of execution plan
2. **Setup Measurement**: Run baseline metrics
3. **Create First PR**: PR 1.1 (Setup & Baseline)
4. **Begin Execution**: Follow PR sequence

---

**End of Execution Plan**
