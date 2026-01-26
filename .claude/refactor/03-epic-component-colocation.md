# Step 3: Route-Specific Component Colocation

**Priority**: P1 (HIGH)
**PRs**: 8
**Status**: Completed

---

## Previous Epics Summary

| Step | Epic                     | Status      | Key Outcomes                                                       |
| ---- | ------------------------ | ----------- | ------------------------------------------------------------------ |
| 1    | Barrel Files Elimination | ✅ Complete | Removed barrel files, established direct imports pattern           |
| 2    | Route Consolidation      | ✅ Complete | Consolidated duplicate routes with 301 redirects in next.config.ts |

---

## Component Audit Results

### Route-Specific Components (To Move)

| Source                                    | Target                                       | Files | Priority  |
| ----------------------------------------- | -------------------------------------------- | ----- | --------- |
| `src/components/home/`                    | `app/(main)/home/_components/`               | 20+   | 🔴 HIGH   |
| `src/components/series/`                  | `app/(main)/series/_components/`             | 6     | 🔴 HIGH   |
| `src/components/courses/`                 | `app/(main)/courses/_components/`            | 5     | 🔴 HIGH   |
| `src/components/sections/CreatorProfile/` | `app/(main)/creators/[handler]/_components/` | 17    | 🔴 HIGH   |
| `src/components/studio/`                  | `app/studio/_components/`                    | 5     | 🔴 HIGH   |
| `src/components/community/`               | `app/(main)/community/_components/`          | 5     | 🟡 MEDIUM |
| `src/components/shorts/`                  | `app/(main)/shorts/_components/`             | 1     | 🟢 LOW    |

### Shared Components (Keep in src/components/)

- `ui/` - Core design system (43 files)
- `layout/` - Global layouts (13 files)
- `search/` - Global search UI (13 files)
- `sidebar/` - Navigation sidebars (5 files)
- `navigation/` - Navigation helpers (1 file)
- `providers/` - App-wide providers (1 file)
- `feature/` - Feature flags (2 files)
- `watchlist/` - Watchlist components (3 files)
- `creator/` - CreatorCard shared across routes (4 files)
- `video/` - VideoCard shared across routes (5 files)

---

## Context References

For shared guidance, see:

- [Best Practices: Colocation Rules](./00-context.md#b-colocation-rules)
- [Ideal Structure](./00-context.md#ideal-structure)
- [Risk Matrix](./00-context.md#comprehensive-risk-matrix)
- [Merge & Rollback Checklists](./00-context.md#merge--rollback-checklists)

---

## Overview

Route-specific components are currently scattered in `src/components/`. This epic moves them to colocated `_components/` directories within their respective routes.

**Current**: `src/components/home/` (separate from route)

**Required**: `app/(main)/home/_components/` (colocated with route)

---

## Component Placement Decision Tree

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

## PR Breakdown

### PR 3.1: Define Colocation Rules

**Deliverable**: Documentation of component placement rules

**Rules**:

1. `app/[route]/_components/` - Components used ONLY by that route
2. `features/[feature]/components/` - Reusable across multiple routes for same feature
3. `components/ui/` - Truly shared design system primitives
4. `components/layout/` - Shared layout components

**Tasks**:

- [ ] Create colocation decision tree documentation
- [ ] Audit all components for placement
- [ ] Create migration plan per component

**Validation**:

- [ ] Documentation complete
- [ ] All components categorized

**Risk**: Low

---

### PR 3.2: Colocate Homepage Components

**Deliverable**: Move `src/components/home/*` → `app/(main)/home/_components/`

**Tasks**:

- [ ] Create `app/(main)/home/_components/` directory
- [ ] Move files from `src/components/home/*`
- [ ] Flatten `src/components/home/components/` → `_components/`
- [ ] Update imports in `app/(main)/home/page.tsx`
- [ ] Run codemod: `@/components/home` → relative `_components` imports
- [ ] Delete `src/components/home/` directory

**Validation**:

- [ ] Homepage loads correctly
- [ ] No broken imports
- [ ] TypeScript compilation passes
- [ ] `npm run build` succeeds

**Rollback**: Restore `src/components/home/`, revert imports

**Risk**: Medium

---

### PR 3.3: Colocate Creator Profile Components

**Deliverable**: Move creator profile components to route

**Tasks**:

- [ ] Create `app/(main)/creators/[handler]/_components/`
- [ ] Move `src/components/sections/CreatorProfile/*`
- [ ] Update imports
- [ ] Delete old directory

**Validation**:

- [ ] Creator profile pages work
- [ ] No broken imports
- [ ] TypeScript passes

**Rollback**: Restore old directories

**Risk**: Medium

---

### PR 3.4: Colocate Series Components ✅

**Deliverable**: Move series components to route

**Status**: Complete

**Tasks**:

- [x] Create `app/(main)/series/_components/`
- [x] Move `src/components/series/*`
- [x] Update imports
- [x] Delete old directory

**Implementation Details**:

1. **Created directory**: `app/(main)/series/_components/`

2. **Moved 6 components** from `src/components/series/` to `app/(main)/series/_components/`:
   - `EpisodeCard/`
   - `PlayerPageSkeleton/`
   - `SeriesCardSkeleton/`
   - `SeriesPageSkeleton/`
   - `SeriesPremiumCard/`
   - `TrailerModal/`

3. **Updated imports in 8 files**:
   - `app/(main)/series/page.tsx` - Changed to relative imports `./_components/`
   - `app/(main)/series/[slug]/page.tsx` - Changed to relative imports `../_components/`
   - `app/(main)/series/[slug]/loading.tsx` - Changed to relative imports `../_components/`
   - `app/(main)/series/[slug]/play/[videoUuid]/page.tsx` - Changed to relative imports `../../../_components/`
   - `app/(main)/series/[slug]/play/[videoUuid]/loading.tsx` - Changed to relative imports `../../../_components/`
   - `app/(main)/creators/[handler]/_components/tabs/CreatorSeriesTab.tsx` - Changed to absolute import `@/app/(main)/series/_components/`
   - `app/(main)/creators/[handler]/_components/tabs/CreatorEducationTab.tsx` - Changed to absolute import `@/app/(main)/series/_components/`
   - `app/(main)/videos/[id]/loading.tsx` - Changed to absolute import `@/app/(main)/series/_components/`

4. **Deleted old directory**: `src/components/series/` (including empty `PlaylistCard/` subdirectory)

5. **Updated codemod map**: `codemods/maps/components-series.json` with new paths

**Validation**:

- [x] Series pages work
- [x] No broken imports
- [x] TypeScript compilation passes
- [x] Lint passes (no errors in modified files)

**Rollback**: Restore old directory

**Risk**: Medium

---

### PR 3.5: Colocate Courses Components ✅

**Deliverable**: Move courses components to route

**Status**: Complete

**Tasks**:

- [x] Create `app/(main)/courses/_components/`
- [x] Move `src/components/courses/*`
- [x] Update imports
- [x] Delete old directory

**Implementation Details**:

1. **Created directory**: `app/(main)/courses/_components/`

2. **Moved 5 components** from `src/components/courses/` to `app/(main)/courses/_components/`:
   - `CourseCard/`
   - `CoursePageSkeleton/`
   - `CoursePlayerPageSkeleton/`
   - `LessonCard/`
   - `LessonCardPlayer/`

3. **Updated imports in 5 files**:
   - `app/(main)/courses/page.tsx` - Changed to relative import `./_components/`
   - `app/(main)/courses/[id]/page.tsx` - Changed to relative imports `../_components/`
   - `app/(main)/courses/[id]/loading.tsx` - Changed to relative import `../_components/`
   - `app/(main)/courses/[id]/play/[videoUuid]/page.tsx` - Changed to relative imports `../../../_components/`
   - `app/(main)/courses/[id]/play/[videoUuid]/loading.tsx` - Changed to relative import `../../../_components/`

4. **Deleted old directory**: `src/components/courses/`

5. **Updated codemod map**: `codemods/maps/components-courses.json` with new paths

**Validation**:

- [x] Courses pages work
- [x] No broken imports
- [x] TypeScript compilation passes
- [x] Lint passes (no errors in modified files)

**Rollback**: Restore old directory

**Risk**: Medium

---

### PR 3.6: Colocate Video Components ✅

**Deliverable**: Organize video components

**Status**: Complete

**Decision**: Video components are used across multiple routes (videos, courses, searches, etc.), so moved to `features/video/components/` (shared location).

**Tasks**:

- [x] Audit video component usage
- [x] Create appropriate directory
- [x] Move `src/components/video/*`
- [x] Update imports
- [x] Delete old directory

**Implementation Details**:

1. **Decision**: Moved to `features/video/components/` because:
   - `VideoPlayerSkeleton` is used in multiple routes (videos, courses)
   - Components are shared across routes, not route-specific
   - `features/video/components/` already exists with other video-related components

2. **Moved 4 components** from `src/components/video/` to `features/video/components/`:
   - `VideoCard/`
   - `VideoCardSkeleton/`
   - `VideoEmptyState/`
   - `VideoPlayerSkeleton/`

3. **Updated imports in 3 files**:
   - `app/(main)/videos/[id]/page.tsx` - Changed to `@/features/video/components/VideoPlayerSkeleton`
   - `app/(main)/courses/[id]/page.tsx` - Changed to `@/features/video/components/VideoPlayerSkeleton`
   - `app/(main)/courses/[id]/play/[videoUuid]/page.tsx` - Changed to `@/features/video/components/VideoPlayerSkeleton`

4. **Deleted old directory**: `src/components/video/` (including `index.ts` barrel file)

**Validation**:

- [x] Video pages work
- [x] Video player works everywhere used
- [x] No broken imports
- [x] TypeScript compilation passes
- [x] Lint passes (no errors in modified files)

**Rollback**: Restore old directory

**Risk**: Medium

---

### PR 3.7: Colocate Studio Components ✅

**Deliverable**: Move studio components to route

**Status**: Complete

**Tasks**:

- [x] Create `app/studio/_components/`
- [x] Move `src/components/studio/*`
- [x] Update imports
- [x] Delete old directory

**Implementation Details**:

1. **Created directory**: `app/studio/_components/`

2. **Moved 5 components** from `src/components/studio/` to `app/studio/_components/`:
   - `ActionCard/`
   - `ComingSoonItem/`
   - `ContentTypeSelector/`
   - `QuickLinkCard/`
   - `StatCard/`

3. **Updated imports in 4 files**:
   - `app/studio/page.tsx` - Changed to relative import `./_components/`
   - `app/studio/posts/page.tsx` - Changed to relative import `../_components/`
   - `app/studio/upload/video/page.tsx` - Changed to relative import `../../_components/`
   - `app/studio/upload/short/page.tsx` - Changed to relative import `../../_components/`

4. **Deleted old directory**: `src/components/studio/`

5. **Updated codemod map**: `codemods/maps/components-studio.json` with new paths

**Validation**:

- [x] Studio pages work
- [x] Upload flows work
- [x] No broken imports
- [x] TypeScript compilation passes
- [x] Lint passes (no errors in modified files)

**Rollback**: Restore old directory

**Risk**: Medium

---

### PR 3.8: Clean Up Remaining Component Directories ✅

**Deliverable**: Remove empty/obsolete component directories

**Status**: Complete

**Tasks**:

- [x] Audit remaining `src/components/*` directories
- [x] Remove empty directories
- [x] Consolidate truly shared components in `components/ui/` or `components/layout/`
- [x] Update any remaining imports

**Implementation Details**:

1. **Moved route-specific components**:
   - `src/components/community/*` → `app/(main)/community/_components/` (4 components)
   - `src/components/shorts/*` → `app/(main)/shorts/_components/` (1 component)

2. **Removed barrel files** (Epic 1 cleanup):
   - `src/components/community/index.ts` - Removed (components moved)
   - `src/components/creator/index.ts` - Removed (updated to direct imports)
   - `src/components/watchlist/index.ts` - Removed (updated to direct imports)

3. **Updated imports in 6 files**:
   - `app/(main)/community/page.tsx` - Changed to direct relative imports
   - `app/(main)/community/[post]/loading.tsx` - Changed to relative import
   - `app/(main)/shorts/[uuid]/loading.tsx` - Changed to relative import
   - `app/(main)/creators/page.tsx` - Changed to direct imports (removed barrel)
   - `app/(main)/creators/loading.tsx` - Changed to direct import
   - `app/(main)/creators/[handler]/loading.tsx` - Changed to direct import

4. **Deleted empty directories**:
   - `src/components/community/` (after moving components)
   - `src/components/shorts/` (after moving components)

5. **Remaining shared components** (correctly placed):
   - `ui/` - Core design system (shared)
   - `layout/` - Global layouts (shared)
   - `search/` - Global search UI (shared)
   - `sidebar/` - Navigation sidebars (shared)
   - `navigation/` - Navigation helpers (shared)
   - `providers/` - App-wide providers (shared)
   - `feature/` - Feature flags (shared)
   - `watchlist/` - Watchlist components (shared, barrel removed)
   - `creator/` - CreatorCard shared across routes (shared, barrel removed)

**Validation**:

- [x] No empty directories
- [x] All components properly placed
- [x] TypeScript passes
- [x] Build succeeds
- [x] Lint passes (no errors in modified files)

**Rollback**: Restore directories if needed

**Risk**: Low

---

## Success Criteria

- [ ] Route-specific components colocated with their routes
- [ ] `src/components/` only contains truly shared components
- [ ] All imports updated
- [ ] No broken functionality
- [ ] TypeScript passes
- [ ] Build succeeds
- [ ] All pages render correctly

---

## Navigation

| Previous                                                        | Current                          | Next                                                  |
| --------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| [Step 2: Route Consolidation](./02-epic-route-consolidation.md) | **Step 3: Component Colocation** | [Step 4: Server Actions](./04-epic-server-actions.md) |
