# Step 2: Route Consolidation & Redirects

**Priority**: P0 (CRITICAL)
**PRs**: 5
**Status**: Complete (All PRs 2.1-2.5 Done)

---

## Previous Epics Summary

| Step | Epic                     | Status    | Key Outcomes                                           |
| ---- | ------------------------ | --------- | ------------------------------------------------------ |
| 1    | Barrel Files Elimination | Completed | Pending: Remove barrel files, establish direct imports |

> **Update this section** after Step 1 is complete with actual outcomes.

---

## Context References

For shared guidance, see:

- [Best Practices: Route Redirects](./00-context.md#c-route-redirects)
- [Gap Analysis: Duplicate Routes](./00-context.md#duplicate-routes-critical)
- [Risk Matrix](./00-context.md#comprehensive-risk-matrix)
- [Merge & Rollback Checklists](./00-context.md#merge--rollback-checklists)

---

## Overview

The codebase has duplicate routes that cause SEO confusion and maintenance overhead:

- **Auth**: `login/`, `sign-in/`, `sign-up/`, `signup/`, `register/` (5 routes)
- **Content**: `content/` vs `contents/`
- **Search**: `search/` vs `searches/`

This epic consolidates routes with HTTP 301 redirects.

---

## PR Breakdown

### PR 2.1: Setup Redirect Infrastructure ✅

**Deliverable**: Redirect configuration with HTTP 301

**Status**: Complete

**Tasks**:

- [x] Create redirect helper in `next.config.ts`
- [x] Create `scripts/verify-redirects.js`
- [x] Document redirect strategy

**Implementation Details**:

1. **`next.config.ts`** - Added `routeRedirects` array with:
   - Organized sections for each route consolidation PR
   - Commented placeholder redirects for PRs 2.2-2.4
   - All redirects use `permanent: true` (HTTP 301)

2. **`scripts/verify-redirects.js`** - Validation script that:
   - Parses active redirects from `next.config.ts`
   - Detects redirect loops
   - Detects redirect chains > 1 hop
   - Validates all use HTTP 301
   - Optional live testing with `--test-live` flag

3. **NPM Scripts**:
   - `npm run verify-redirects` - Static analysis
   - `npm run verify-redirects:live` - Test against running server

**Usage**:

```typescript
// In next.config.ts - routeRedirects array at top of file
const routeRedirects: Redirect[] = [
  {
    source: '/login',
    destination: '/sign-in',
    permanent: true, // HTTP 301
  },
];

// Used by async redirects() function
async redirects() {
  return routeRedirects;
}
```

**Validation**:

- [x] All redirects return HTTP 301
- [x] No redirect loops
- [x] Redirect chains max 1 hop

**Rollback**: Remove redirect config

**Risk**: Low

---

### PR 2.2: Consolidate Auth Routes ✅

**Deliverable**: Redirect duplicate auth routes

**Status**: Complete

**Tasks**:

- [x] Add redirect: `/login` → `/sign-in` (HTTP 301)
- [x] Add redirect: `/sign-up` → `/register` (HTTP 301)
- [x] Add redirect: `/signup` → `/register` (HTTP 301)
- [x] Delete `app/(auth)/signup/` directory
- [x] Delete `app/(auth)/login/` directory
- [x] Delete `app/(auth)/sign-up/` directory
- [x] Update internal links - N/A (all links already use canonical routes)
- [x] Update middleware (`proxy.ts`) - Removed duplicate routes from PUBLIC_ROUTES and AUTH_PAGES
- [x] Update server actions paths - N/A (no server actions use old routes)

**Implementation Details**:

1. **`next.config.ts`** - Enabled 3 auth redirects:
   - `/login` → `/sign-in`
   - `/signup` → `/register`
   - `/sign-up` → `/register`

2. **`src/proxy.ts`** - Updated route arrays:
   - Removed `/login`, `/signup`, `/sign-up` from `PUBLIC_ROUTES`
   - Reduced `AUTH_PAGES` to canonical routes only: `['/sign-in', '/register']`

3. **Deleted directories**:
   - `src/app/(auth)/login/`
   - `src/app/(auth)/signup/`
   - `src/app/(auth)/sign-up/`

**Validation**:

- [x] All redirects return 301
- [x] Old routes redirect correctly (via next.config.ts)
- [x] No 404s on old routes (redirects handle them)
- [x] SEO: No redirect chains (max 1 hop verified)
- [x] Auth flows work end-to-end (internal links use canonical routes)

**Rollback**: Restore redirects to commented state, restore deleted route directories

**Risk**: High (SEO impact) - Mitigated by proper 301 redirects

---

### PR 2.3: Consolidate Content Routes ✅

**Deliverable**: Remove duplicate `/content/` route, keep `/contents/` as canonical

**Status**: Complete

**Decision**: Keep `/contents/` (has detailed video/short management), remove `/content/` (simpler dashboard).

**Tasks**:

- [x] Audit content routes structure
- [x] Add redirect: `/content` → `/contents/videos` (HTTP 301)
- [x] Add redirect: `/content/create` → `/contents/videos/create` (HTTP 301)
- [x] Add redirect: `/content/edit/*` → `/contents/videos` (HTTP 301)
- [x] Delete `app/(main)/content/` directory
- [x] Keep `app/(main)/contents/` directory (canonical)

**Implementation Details**:

1. **`next.config.ts`** - Enabled 3 content redirects:
   - `/content` → `/contents/videos`
   - `/content/create` → `/contents/videos/create`
   - `/content/edit/:path*` → `/contents/videos` (fallback since param structure differs)

2. **Deleted directory**:
   - `src/app/(main)/content/`

3. **Kept directories** (canonical):
   - `src/app/(main)/contents/videos/`
   - `src/app/(main)/contents/shorts/`

**Validation**:

- [x] No 404s on old routes (redirects handle them)
- [x] Redirects return HTTP 301
- [x] TypeScript passes
- [x] Contents routes remain functional

**Rollback**: Restore `/content/` directory, comment out redirects

**Risk**: Medium - Mitigated by proper 301 redirects

---

### PR 2.4: Consolidate Search Routes ✅

**Deliverable**: Standardize search route

**Status**: Complete

**Decision**: Use `/searches` as canonical (already used by ~15 internal references).

**Tasks**:

- [x] Decide canonical route: `/searches` (simpler implementation, already widely used)
- [x] Add redirect: `/search` → `/searches` (HTTP 301)
- [x] Delete `app/(main)/search/` directory
- [x] Update `SearchInput.tsx` to use `/searches`

**Implementation Details**:

1. **`next.config.ts`** - Added search redirect:
   - `/search` → `/searches`

2. **`src/components/search/SearchInput.tsx`** - Updated route:
   - Changed `/search?q=` to `/searches?q=`

3. **Deleted directory**:
   - `src/app/(main)/search/`

**Validation**:

- [x] Search functionality works (via `/searches`)
- [x] Redirect returns HTTP 301
- [x] TypeScript passes
- [x] No redirect loops or chains

**Rollback**: Restore `/search/` directory, comment out redirect

**Risk**: Medium - Mitigated by proper 301 redirect

---

### PR 2.5: Remove Route Group Redundancy ✅

**Deliverable**: Clean up `app/(studio)/studio/` structure

**Status**: Complete

**Tasks**:

- [x] Audit `app/(studio)/studio/` for redundancy
- [x] Move to `app/studio/` (direct route, no route group)
- [x] Update all internal links - N/A (URLs unchanged)
- [x] Set up redirect if needed - N/A (URLs unchanged)

**Implementation Details**:

Before:
```
src/app/(studio)/           ← route group wrapper
├── layout.tsx
├── __tests__/
└── studio/                 ← /studio URL
    ├── page.tsx
    └── ...
```

After:
```
src/app/studio/             ← direct route /studio
├── layout.tsx              ← moved from (studio)/
├── __tests__/              ← moved from (studio)/
├── page.tsx
└── ...
```

**Changes**:
- Moved `(studio)/layout.tsx` → `studio/layout.tsx`
- Moved `(studio)/__tests__/` → `studio/__tests__/`
- Moved `(studio)/studio/*` → `studio/*`
- Deleted `(studio)/` route group wrapper

**Validation**:

- [x] Studio pages work correctly (same URLs)
- [x] No broken links (no URL changes)
- [x] TypeScript passes

**Rollback**: Recreate `(studio)/` wrapper, move files back

**Risk**: Low - No URL changes, purely folder structure cleanup

---

## Success Criteria

- [x] All duplicate routes consolidated
- [x] All redirects use HTTP 301 (permanent)
- [x] No redirect loops
- [x] No redirect chains > 1 hop
- [x] All internal links updated
- [x] No 404 errors introduced (redirects handle old URLs)
- [ ] SEO rankings maintained (monitor post-deploy)

---

## SEO Monitoring

After deployment, monitor for 2 weeks:

- [ ] Google Search Console: Check for 404 errors
- [ ] Google Search Console: Check crawl stats
- [ ] Analytics: Check traffic to old URLs
- [ ] Rankings: Monitor key page positions

---

## Navigation

| Previous                                          | Current                         | Next                                                              |
| ------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| [Step 1: Barrel Files](./01-epic-barrel-files.md) | **Step 2: Route Consolidation** | [Step 3: Component Colocation](./03-epic-component-colocation.md) |
