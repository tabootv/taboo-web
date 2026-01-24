# Step 3: Route-Specific Component Colocation

**Priority**: P1 (HIGH)
**PRs**: 8
**Status**: Not Started

---

## Previous Epics Summary

| Step | Epic | Status | Key Outcomes |
|------|------|--------|--------------|
| 1 | Barrel Files Elimination | Not Started | Pending: Remove barrel files, establish direct imports |
| 2 | Route Consolidation | Not Started | Pending: Consolidate duplicate routes with 301 redirects |

> **Update this section** after Steps 1-2 are complete with actual outcomes.

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

### PR 3.4: Colocate Series Components

**Deliverable**: Move series components to route

**Tasks**:
- [ ] Create `app/(main)/series/_components/`
- [ ] Move `src/components/series/*`
- [ ] Update imports
- [ ] Delete old directory

**Validation**:
- [ ] Series pages work
- [ ] No broken imports

**Rollback**: Restore old directory

**Risk**: Medium

---

### PR 3.5: Colocate Courses Components

**Deliverable**: Move courses components to route

**Tasks**:
- [ ] Create `app/(main)/courses/_components/`
- [ ] Move `src/components/courses/*`
- [ ] Update imports
- [ ] Delete old directory

**Validation**:
- [ ] Courses pages work
- [ ] No broken imports

**Rollback**: Restore old directory

**Risk**: Medium

---

### PR 3.6: Colocate Video Components

**Deliverable**: Organize video components

**Decision**: Video components may be used across multiple routes. Evaluate:
- Single route only → `app/(main)/videos/_components/`
- Multiple routes → `features/video/components/`

**Tasks**:
- [ ] Audit video component usage
- [ ] Create appropriate directory
- [ ] Move `src/components/video/*`
- [ ] Update imports
- [ ] Delete old directory

**Validation**:
- [ ] Video pages work
- [ ] Video player works everywhere used
- [ ] No broken imports

**Rollback**: Restore old directory

**Risk**: Medium

---

### PR 3.7: Colocate Studio Components

**Deliverable**: Move studio components to route

**Tasks**:
- [ ] Create `app/studio/_components/`
- [ ] Move `src/components/studio/*`
- [ ] Update imports
- [ ] Delete old directory

**Validation**:
- [ ] Studio pages work
- [ ] Upload flows work
- [ ] No broken imports

**Rollback**: Restore old directory

**Risk**: Medium

---

### PR 3.8: Clean Up Remaining Component Directories

**Deliverable**: Remove empty/obsolete component directories

**Tasks**:
- [ ] Audit remaining `src/components/*` directories
- [ ] Remove empty directories
- [ ] Consolidate truly shared components in `components/ui/` or `components/layout/`
- [ ] Update any remaining imports

**Validation**:
- [ ] No empty directories
- [ ] All components properly placed
- [ ] TypeScript passes
- [ ] Build succeeds

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

| Previous | Current | Next |
|----------|---------|------|
| [Step 2: Route Consolidation](./02-epic-route-consolidation.md) | **Step 3: Component Colocation** | [Step 4: Server Actions](./04-epic-server-actions.md) |
