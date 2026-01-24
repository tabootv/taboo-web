# Step 4: Server Actions Migration

**Priority**: P1 (HIGH)
**PRs**: 5
**Status**: Not Started

---

## Previous Epics Summary

| Step | Epic | Status | Key Outcomes |
|------|------|--------|--------------|
| 1 | Barrel Files Elimination | Not Started | Pending: Remove barrel files, establish direct imports |
| 2 | Route Consolidation | Not Started | Pending: Consolidate duplicate routes with 301 redirects |
| 3 | Component Colocation | Not Started | Pending: Move route-specific components to `_components/` |

> **Update this section** after Steps 1-3 are complete with actual outcomes.

---

## Context References

For shared guidance, see:
- [Best Practices: Server Actions vs TanStack Query](./00-context.md#d-server-actions-vs-tanstack-query)
- [Gap Analysis: Server Actions](./00-context.md#server-actions-underutilization)
- [Ideal Structure](./00-context.md#ideal-structure)
- [Merge & Rollback Checklists](./00-context.md#merge--rollback-checklists)

---

## Overview

Currently only 5 server actions exist, all centralized in `src/server/actions/auth.actions.ts`. Server actions should be colocated with their routes as `_actions.ts` files.

**Current**: `src/server/actions/auth.actions.ts` (centralized)

**Required**: `app/(auth)/sign-in/_actions.ts` (colocated)

---

## When to Use Server Actions vs TanStack Query

### Use Server Actions When:
- Server-side validation required
- Sensitive operations (payments, auth)
- Automatic cache revalidation needed
- File uploads
- Form submissions

### Use TanStack Query When:
- Optimistic UI updates
- Polling/real-time data
- Client-side state management
- Retry logic needed
- Complex caching strategies

### Hybrid Approach:
Server Action for mutation + TanStack Query for optimistic UI

---

## PR Breakdown

### PR 4.1: Define Server Actions Strategy

**Deliverable**: Guidelines for when to use Server Actions vs TanStack Query

**Tasks**:
- [ ] Document decision criteria
- [ ] Audit existing mutations for migration candidates
- [ ] Create server action templates

**Validation**:
- [ ] Documentation complete
- [ ] All mutations categorized

**Risk**: Low

---

### PR 4.2: Colocate Auth Server Actions

**Deliverable**: Move actions to route-specific locations

**Tasks**:
- [ ] Create `app/(auth)/sign-in/_actions.ts` - loginAction
- [ ] Create `app/(auth)/register/_actions.ts` - registerAction
- [ ] Create `app/(auth)/forgot-password/_actions.ts` - password actions
- [ ] Split `src/server/actions/auth.actions.ts` content
- [ ] Update all imports
- [ ] Delete `src/server/actions/` directory

**Validation**:
- [ ] All auth actions work correctly
- [ ] No broken imports
- [ ] Auth flows tested end-to-end:
  - [ ] Login
  - [ ] Registration
  - [ ] Password reset
  - [ ] Logout

**Rollback**: Restore `src/server/actions/`, revert imports

**Risk**: Medium

---

### PR 4.3: Migrate Video Upload Actions

**Deliverable**: Server action for video upload

**Candidate**: Video upload should be a server action for:
- File handling
- Server-side validation
- Automatic cache revalidation

**Tasks**:
- [ ] Create `app/studio/upload/video/_actions.ts`
- [ ] Implement upload server action
- [ ] Add proper error handling
- [ ] Add progress tracking (if applicable)

**Validation**:
- [ ] Video upload works
- [ ] Error states handled
- [ ] Large files handled correctly

**Rollback**: Revert to previous implementation

**Risk**: Medium

---

### PR 4.4: Migrate Profile Update Actions

**Deliverable**: Server action for profile updates

**Tasks**:
- [ ] Create `app/(main)/profile/edit/_actions.ts`
- [ ] Implement profile update action
- [ ] Add validation
- [ ] Add cache revalidation

**Validation**:
- [ ] Profile updates work
- [ ] Validation errors shown
- [ ] Cache updates correctly

**Rollback**: Revert changes

**Risk**: Medium

---

### PR 4.5: Migrate Content Deletion Actions

**Deliverable**: Server actions for content deletion

**Tasks**:
- [ ] Identify all delete operations
- [ ] Create colocated server actions
- [ ] Add confirmation flows
- [ ] Add proper error handling

**Validation**:
- [ ] Delete operations work
- [ ] Confirmations shown
- [ ] Error states handled
- [ ] Permissions enforced

**Rollback**: Revert changes

**Risk**: Medium

---

## Server Action Best Practices

### File Naming
```
app/
└── (auth)/
    └── sign-in/
        ├── page.tsx
        └── _actions.ts    # Server actions for this route
```

### Action Template
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitAction(formData: FormData) {
  // 1. Validate input
  const validated = schema.parse(Object.fromEntries(formData))

  // 2. Perform operation
  const result = await db.insert(...)

  // 3. Revalidate cache
  revalidatePath('/affected-route')

  // 4. Redirect or return
  redirect('/success')
}
```

---

## Success Criteria

- [ ] All server actions colocated with routes
- [ ] `src/server/actions/` directory removed
- [ ] Clear distinction between Server Actions and TanStack Query
- [ ] All auth flows work correctly
- [ ] All mutations tested end-to-end
- [ ] TypeScript passes
- [ ] Build succeeds

---

## Navigation

| Previous | Current | Next |
|----------|---------|------|
| [Step 3: Component Colocation](./03-epic-component-colocation.md) | **Step 4: Server Actions** | [Step 5: Utility Consolidation](./05-epic-utility-consolidation.md) |
