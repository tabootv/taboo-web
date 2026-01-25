# Step 5: Utility Directory Consolidation

**Priority**: P2 (MEDIUM)
**PRs**: 3
**Status**: Complete

---

## Previous Epics Summary

| Step | Epic                     | Status      | Key Outcomes                                               |
| ---- | ------------------------ | ----------- | ---------------------------------------------------------- |
| 1    | Barrel Files Elimination | ✅ Complete | Removed barrel files, established direct imports pattern   |
| 2    | Route Consolidation      | ✅ Complete | Consolidated duplicate routes with 301 redirects           |
| 3    | Component Colocation     | ✅ Complete | Moved route-specific components to `_components/`          |
| 4    | Server Actions Migration | ✅ Complete | Colocated server actions with routes, integrated auth-store|

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

The codebase has duplicate utility directories that need consolidation:
- `src/lib/` (24 files) - Stores, utils, API helpers
- `src/shared/` (10 files) - Providers, query client, config

This epic consolidates all utilities into a single `src/shared/` directory with clear organization.

**Current State**:
```
src/
├── lib/                    # 24 files - TO BE REMOVED
│   ├── stores/             # 7 stores + barrel
│   ├── utils/              # 10 utils + barrel
│   ├── api/                # 1 file + barrel
│   ├── validations/        # 1 file
│   ├── firstpromoter/      # 1 file
│   ├── design-tokens.ts
│   └── utils.ts            # Main formatting utils
└── shared/                 # 10 files - TO BE EXPANDED
    ├── components/         # Providers, error boundary
    └── lib/                # Query client, config, utils
```

**Target State**:
```
src/
└── shared/
    ├── components/         # Shared components & providers
    ├── lib/                # Library instances (query-client, config, etc.)
    ├── stores/             # Zustand stores
    └── utils/              # Pure helper functions
```

**Impact**: ~206 import updates across 161 files

---

## PR Breakdown

### PR 5.1: Define Utility Organization Rules ✅

**Deliverable**: Clear rules for `shared/` organization

**Status**: Complete

**Rules**:
- `src/shared/lib/` - Library instances (Prisma, Stripe, query-client)
- `src/shared/utils/` - Pure helper functions (date formatting, string manipulation)
- `src/shared/stores/` - Zustand stores
- Max 3 levels deep
- Clear naming conventions

**Tasks**:
- [x] Document organization rules
- [x] Audit current utility locations
- [x] Create migration plan

**Current State Audit**:

1. **`src/lib/` (24 files)** - To be consolidated into `src/shared/`
   ```
   src/lib/
   ├── api/
   │   ├── home-data.ts       → shared/lib/api/
   │   └── index.ts           → DELETE (barrel)
   ├── design-tokens.ts       → shared/lib/
   ├── firstpromoter/
   │   └── client.ts          → shared/lib/firstpromoter/
   ├── stores/
   │   ├── auth-store.ts      → shared/stores/
   │   ├── live-chat-store.ts → shared/stores/
   │   ├── saved-videos-store.ts → shared/stores/
   │   ├── shorts-store.ts    → shared/stores/
   │   ├── sidebar-store.ts   → shared/stores/
   │   ├── studio-sidebar-store.ts → shared/stores/
   │   ├── watchlist-store.ts → shared/stores/
   │   └── index.ts           → DELETE (barrel)
   ├── utils/
   │   ├── affiliate-tracking.ts → shared/utils/
   │   ├── array.ts           → shared/utils/
   │   ├── country.ts         → shared/utils/
   │   ├── debounce.ts        → shared/utils/
   │   ├── highlightMatch.tsx → shared/utils/
   │   ├── routes.ts          → shared/utils/
   │   ├── search-utils.ts    → shared/utils/
   │   ├── social.ts          → shared/utils/
   │   ├── tags.ts            → shared/utils/
   │   └── index.ts           → DELETE (barrel)
   ├── utils.ts               → shared/utils/formatting.ts
   └── validations/
       └── upload.ts          → shared/lib/validations/
   ```

2. **`src/shared/` (10 files)** - Already correctly structured
   ```
   src/shared/
   ├── components/            # Keep as-is
   │   ├── error-boundary.tsx
   │   └── providers/
   │       ├── index.ts       → DELETE (barrel)
   │       └── query-provider.tsx
   ├── lib/
   │   ├── api/
   │   │   ├── query-client.ts
   │   │   └── query-keys.ts
   │   ├── config/
   │   │   ├── env.ts
   │   │   └── feature-flags.ts
   │   └── utils/             → MERGE with src/lib/utils
   │       ├── error-handler.ts
   │       ├── index.ts       → DELETE (barrel)
   │       └── redirect.ts
   └── config/                → DELETE (empty)
   ```

3. **Import Usage Statistics**:
   - `@/lib/` imports: **206 occurrences** across **161 files**
   - `@/shared/` imports: **17 occurrences** across **15 files**
   - No deep nesting issues found (all within 3 levels)

4. **Barrel Files to Remove**:
   - `src/lib/stores/index.ts` (7 exports)
   - `src/lib/utils/index.ts` (14 exports)
   - `src/lib/api/index.ts` (4 exports)
   - `src/shared/lib/utils/index.ts` (4 exports)
   - `src/shared/components/providers/index.ts` (1 export)

**Migration Strategy**:

| Source | Target | Impact |
|--------|--------|--------|
| `@/lib/utils` | `@/shared/utils/formatting` | ~100 imports |
| `@/lib/utils/*` | `@/shared/utils/*` | ~30 imports |
| `@/lib/stores/*` | `@/shared/stores/*` | ~50 imports |
| `@/lib/api/*` | `@/shared/lib/api/*` | ~5 imports |
| `@/lib/design-tokens` | `@/shared/lib/design-tokens` | ~10 imports |
| `@/lib/validations/*` | `@/shared/lib/validations/*` | ~5 imports |
| `@/lib/firstpromoter/*` | `@/shared/lib/firstpromoter/*` | ~5 imports |

**Validation**:
- [x] Documentation complete
- [x] All utilities categorized
- [x] Migration plan created

**Risk**: Low

---

### PR 5.2: Migrate `lib/` to `shared/` ✅

**Deliverable**: Consolidate utilities

**Status**: Complete

**Tasks**:

**Phase 1: Move Files (preserve git history)**
- [x] Create directories: `src/shared/stores/`, `src/shared/utils/`
- [x] Move stores (7 files): `git mv src/lib/stores/*.ts src/shared/stores/`
- [x] Move utils (10 files):
  - [x] `git mv src/lib/utils.ts src/shared/utils/formatting.ts`
  - [x] `git mv src/lib/utils/*.ts src/shared/utils/`
- [x] Move lib files:
  - [x] `git mv src/lib/api/home-data.ts src/shared/lib/api/`
  - [x] `git mv src/lib/design-tokens.ts src/shared/lib/`
  - [x] `git mv src/lib/firstpromoter/ src/shared/lib/`
  - [x] `git mv src/lib/validations/ src/shared/lib/`
- [x] Move `src/shared/lib/utils/*.ts` → `src/shared/utils/` (merged utils)

**Phase 2: Update Imports**
- [x] Update store imports: `@/lib/stores/*` → `@/shared/stores/*`
- [x] Update barrel imports: `@/lib/stores` → `@/shared/stores/auth-store`
- [x] Update formatting utils: `@/lib/utils` → `@/shared/utils/formatting`
- [x] Update util imports: `@/lib/utils/*` → `@/shared/utils/*`
- [x] Update API imports: `@/lib/api/*` → `@/shared/lib/api/*`
- [x] Update design-tokens: `@/lib/design-tokens` → `@/shared/lib/design-tokens`
- [x] Update validations: `@/lib/validations/*` → `@/shared/lib/validations/*`
- [x] Update firstpromoter: `@/lib/firstpromoter/*` → `@/shared/lib/firstpromoter/*`
- [x] Update shared barrel: `@/shared/lib/utils/*` → `@/shared/utils/*`
- [x] Update providers barrel: `@/shared/components/providers` → direct import
- [x] Fix internal cross-references in moved files (formatting.ts)

**Phase 3: Cleanup**
- [x] Delete barrel files (5 files):
  - [x] `src/lib/stores/index.ts`
  - [x] `src/lib/utils/index.ts`
  - [x] `src/lib/api/index.ts`
  - [x] `src/shared/lib/utils/index.ts`
  - [x] `src/shared/components/providers/index.ts`
- [x] Delete empty `src/lib/` directory
- [x] Delete empty `src/shared/lib/utils/` directory

**Validation**:
- [x] All imports resolve
- [x] TypeScript compilation passes (`npx tsc --noEmit`)
- [x] Lint passes (no new errors, pre-existing warnings only)

**Files Modified**: ~165 files (imports updated)

**Rollback**: `git revert` the migration commit

**Risk**: Medium (completed successfully)

---

### PR 5.3: Cleanup Barrel Files & Final Structure ✅

**Deliverable**: Remove remaining barrel files and document final structure

**Status**: Merged with PR 5.2 (completed together)

**Tasks**:
- [x] All barrel files deleted as part of PR 5.2
- [x] All imports updated to use direct imports
- [x] Final structure verified

**Validation**:
- [x] No barrel files in `src/shared/`
- [x] All imports work
- [x] TypeScript passes

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

## Final Target Structure

After migration, `src/shared/` will contain:

```
src/shared/
├── components/               # Shared components
│   ├── error-boundary.tsx
│   └── providers/
│       └── query-provider.tsx
├── lib/                      # Library instances & config
│   ├── api/
│   │   ├── home-data.ts
│   │   ├── query-client.ts
│   │   └── query-keys.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── feature-flags.ts
│   ├── design-tokens.ts
│   ├── firstpromoter/
│   │   └── client.ts
│   └── validations/
│       └── upload.ts
├── stores/                   # Zustand stores
│   ├── auth-store.ts
│   ├── live-chat-store.ts
│   ├── saved-videos-store.ts
│   ├── shorts-store.ts
│   ├── sidebar-store.ts
│   ├── studio-sidebar-store.ts
│   └── watchlist-store.ts
└── utils/                    # Pure helper functions
    ├── affiliate-tracking.ts
    ├── array.ts
    ├── country.ts
    ├── debounce.ts
    ├── error-handler.ts
    ├── formatting.ts         # (from lib/utils.ts)
    ├── highlightMatch.tsx
    ├── redirect.ts
    ├── routes.ts
    ├── search-utils.ts
    ├── social.ts
    └── tags.ts
```

---

## Success Criteria

- [x] `src/lib/` directory removed
- [x] All utilities categorized and migration plan created (PR 5.1)
- [x] All utilities migrated to `src/shared/` (PR 5.2)
- [x] Clear organization: `lib/`, `utils/`, `stores/`
- [x] No directories > 3 levels deep (verified in audit)
- [x] All barrel files removed (PR 5.2/5.3)
- [x] All imports updated (~165 files)
- [x] TypeScript passes
- [x] Lint passes (no new errors)

---

## Navigation

| Previous | Current | Next |
|----------|---------|------|
| [Step 4: Server Actions](./04-epic-server-actions.md) | **Step 5: Utility Consolidation** | [Step 6: React.cache()](./06-epic-react-cache.md) |
