# Step 5: Utility Directory Consolidation

**Priority**: P2 (MEDIUM)
**PRs**: 3
**Status**: Not Started

---

## Previous Epics Summary

| Step | Epic | Status | Key Outcomes |
|------|------|--------|--------------|
| 1 | Barrel Files Elimination | Not Started | Pending: Remove barrel files, establish direct imports |
| 2 | Route Consolidation | Not Started | Pending: Consolidate duplicate routes with 301 redirects |
| 3 | Component Colocation | Not Started | Pending: Move route-specific components to `_components/` |
| 4 | Server Actions Migration | Not Started | Pending: Colocate server actions with routes |

> **Update this section** after Steps 1-4 are complete with actual outcomes.
>
> **Note**: Step 5 and Step 6 can run in parallel.

---

## Context References

For shared guidance, see:
- [Best Practices: Shared vs Lib](./00-context.md#f-shared-vs-lib)
- [Gap Analysis: Redundant Directories](./00-context.md#redundant-directory-structures)
- [Ideal Structure](./00-context.md#ideal-structure)
- [Merge & Rollback Checklists](./00-context.md#merge--rollback-checklists)

---

## Overview

The codebase has duplicate utility directories:
- `src/shared/` vs `src/lib/`
- Nested structures that exceed 3 levels

This epic consolidates utilities into a single `src/shared/` directory with clear organization.

**Current**:
```
src/
├── lib/
│   ├── stores/
│   ├── utils/
│   └── api/
└── shared/
    └── providers/
```

**Required**:
```
src/
└── shared/
    ├── lib/        # Library instances (query-client, etc.)
    ├── utils/      # Pure helper functions
    └── stores/     # Zustand stores
```

---

## PR Breakdown

### PR 5.1: Define Utility Organization Rules

**Deliverable**: Clear rules for `shared/` organization

**Rules**:
- `src/shared/lib/` - Library instances (Prisma, Stripe, query-client)
- `src/shared/utils/` - Pure helper functions (date formatting, string manipulation)
- `src/shared/stores/` - Zustand stores
- Max 3 levels deep
- Clear naming conventions

**Tasks**:
- [ ] Document organization rules
- [ ] Audit current utility locations
- [ ] Create migration plan

**Validation**:
- [ ] Documentation complete
- [ ] All utilities categorized

**Risk**: Low

---

### PR 5.2: Migrate `lib/` to `shared/`

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
- [ ] All functionality works

**Rollback**: Restore `src/lib/`, revert imports

**Risk**: Low-Medium

---

### PR 5.3: Flatten Deep Nesting

**Deliverable**: Remove unnecessary nesting

**Tasks**:
- [ ] Identify directories > 3 levels deep
- [ ] Flatten structure where appropriate
- [ ] Update imports
- [ ] Document final structure

**Validation**:
- [ ] No directories > 3 levels deep
- [ ] All imports work
- [ ] TypeScript passes

**Rollback**: Restore previous structure

**Risk**: Low

---

## Directory Organization Rules

### `src/shared/lib/` - Library Instances

Contains initialized library instances:
```
shared/lib/
├── query-client.ts     # TanStack Query client
├── prisma.ts           # Prisma client (if used)
├── stripe.ts           # Stripe client
├── design-tokens.ts    # Design system tokens
└── api/
    └── home-data.ts    # API utilities
```

### `src/shared/utils/` - Pure Functions

Contains pure helper functions:
```
shared/utils/
├── date.ts             # Date formatting
├── string.ts           # String manipulation
├── url.ts              # URL utilities
└── validation.ts       # Validation helpers
```

### `src/shared/stores/` - Zustand Stores

Contains all Zustand stores:
```
shared/stores/
├── auth-store.ts       # Authentication state
├── ui-store.ts         # UI state
└── player-store.ts     # Video player state
```

---

## Kitchen Sink Prevention

To prevent `shared/` from becoming a dumping ground:

1. **Max 3 levels deep** - Enforce in code review
2. **Clear naming** - Files named by function, not "utils" or "helpers"
3. **Regular audits** - Monthly review of directory structure
4. **Single responsibility** - Each file does one thing

---

## Success Criteria

- [ ] `src/lib/` directory removed
- [ ] All utilities in `src/shared/`
- [ ] Clear organization: `lib/`, `utils/`, `stores/`
- [ ] No directories > 3 levels deep
- [ ] All imports updated
- [ ] TypeScript passes
- [ ] Build succeeds

---

## Navigation

| Previous | Current | Next |
|----------|---------|------|
| [Step 4: Server Actions](./04-epic-server-actions.md) | **Step 5: Utility Consolidation** | [Step 6: React.cache()](./06-epic-react-cache.md) |
