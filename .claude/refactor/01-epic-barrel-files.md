# Step 1: Barrel Files Elimination

**Priority**: P0 (CRITICAL)
**PRs**: 8
**Status**: Completed

---

## Previous Epics Summary

> **This is Step 1** - No previous epics to summarize.

---

## Context References

For shared guidance, see:

- [Best Practices: Barrel Files Exceptions](./00-context.md#a-barrel-files---acceptable-exceptions)
- [Risk Matrix](./00-context.md#comprehensive-risk-matrix)
- [CI/CD Integration](./00-context.md#cicd-integration)
- [Merge & Rollback Checklists](./00-context.md#merge--rollback-checklists)

---

## Overview

Barrel files (`index.ts`) that re-export multiple modules cause 200-800ms import costs and slow builds. This epic eliminates barrel files across the codebase, requiring direct imports instead.

**Current Pattern**: `import { Button, Input } from '@/components/ui'`

**Required Pattern**: `import { Button } from '@/components/ui/button'`

---

## PR Breakdown

### PR 1.1: Setup Measurement & Baseline

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

**Risk**: Low

---

### PR 1.2: Split Monolithic Types File

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

- **Colocate**: Types used exclusively by one API client
- **Keep in `types/`**: Types used by 3+ modules or truly global
- **Exception**: Types used by 2 modules - evaluate case-by-case

**Validation**:

- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] Bundle size: `<baseline>` KB (should decrease slightly)

**Rollback**: Revert PR, restore `src/types/index.ts`

**Risk**: Medium

---

### PR 1.3: Remove API Client Barrel File

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

### PR 1.4: Remove API Queries Barrel File

**Deliverable**: Delete `src/api/queries/index.ts`, update imports

**Tasks**:

- [ ] Create codemod: `@/api/queries` → `@/api/queries/{specific}.queries`
- [ ] Run codemod across codebase
- [ ] Delete `src/api/queries/index.ts`
- [ ] Verify no broken imports

**Validation**:

- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds

**Rollback**: Restore `src/api/queries/index.ts`, revert imports

**Risk**: Low

---

### PR 1.5: Remove Components UI Barrel File

**Deliverable**: Delete `src/components/ui/index.ts`, update imports

**Tasks**:

- [ ] Create codemod: `@/components/ui` → `@/components/ui/{component}`
- [ ] Run codemod (most critical, used everywhere)
- [ ] Delete `src/components/ui/index.ts`

**Exception Rule**: Small, stable re-exports (<5 items) can remain if:

- Used in 20+ files
- Rarely changes
- Documented as "stable API"

**Validation**:

- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] All UI components render correctly

**Rollback**: Restore `src/components/ui/index.ts`, revert imports

**Risk**: Medium (used everywhere)

---

### PR 1.6: Remove Home Component Barrel File

**Deliverable**: Delete `src/components/home/index.ts`

**Note**: This barrel will be removed as part of colocation in Step 3.

**Tasks**:

- [ ] Create codemod: `@/components/home` → direct component imports
- [ ] Run codemod
- [ ] Delete `src/components/home/index.ts`

**Validation**:

- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] Homepage renders correctly

**Rollback**: Restore barrel file, revert imports

**Risk**: Medium

---

### PR 1.7: Remove Series/Courses/Studio Barrel Files

**Deliverable**: Delete remaining component barrel files

**Tasks**:

- [ ] Remove `src/components/series/index.ts`
- [ ] Remove `src/components/courses/index.ts`
- [ ] Remove `src/components/studio/index.ts`
- [ ] Update all imports to direct paths

**Validation**:

- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] Affected pages render correctly

**Rollback**: Restore barrel files, revert imports

**Risk**: Medium

---

### PR 1.8: Remove Feature Barrel Files

**Deliverable**: Delete `src/features/*/index.ts` files

**Tasks**:

- [ ] Remove `src/features/video/index.ts`
- [ ] Remove `src/features/shorts/index.ts`
- [ ] Update all imports to direct paths

**Validation**:

- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] Video and shorts features work correctly

**Rollback**: Restore barrel files, revert imports

**Risk**: Medium

---

## Success Criteria

- [ ] All barrel files removed (except documented exceptions)
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] Bundle size reduced (target: -15%)
- [ ] Build time improved (target: -20%)
- [ ] HMR latency improved
- [ ] All imports use direct paths

---

## Navigation

| Previous               | Current                  | Next                                                            |
| ---------------------- | ------------------------ | --------------------------------------------------------------- |
| [Index](./00-index.md) | **Step 1: Barrel Files** | [Step 2: Route Consolidation](./02-epic-route-consolidation.md) |
