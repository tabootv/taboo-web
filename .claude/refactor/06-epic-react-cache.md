# Step 6: React.cache() Optimization

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
| 5 | Utility Consolidation | Not Started | Pending: Consolidate utilities in `src/shared/` |

> **Update this section** after Steps 1-5 are complete with actual outcomes.
>
> **Note**: Step 5 and Step 6 can run in parallel.

---

## Context References

For shared guidance, see:
- [Gap Analysis: React.cache() Underutilization](./00-context.md#reactcache-underutilization)
- [Best Practices](./00-context.md#best-practices--conventions)
- [Merge & Rollback Checklists](./00-context.md#merge--rollback-checklists)

---

## Overview

`React.cache()` is only used in 1 file (`src/lib/api/home-data.ts`). It should be used for non-fetch operations to deduplicate expensive calls within a single request.

**Important**: Next.js 15+ deduplicates `fetch()` automatically - **DO NOT** wrap `fetch()` calls with `React.cache()`.

**Use For**:
- Direct database calls
- File system operations
- Third-party client SDK calls
- Expensive computations

---

## PR Breakdown

### PR 6.1: Audit Non-Fetch Operations

**Deliverable**: List of operations needing `React.cache()`

**Tasks**:
- [ ] Find all non-`fetch()` async operations in Server Components
- [ ] Identify: Direct DB calls, file system ops, third-party clients
- [ ] Document candidates for caching
- [ ] Prioritize by call frequency

**Candidates to Look For**:
```typescript
// These should be wrapped with React.cache()
await db.query(...)           // Direct database calls
await fs.readFile(...)        // File system operations
await stripe.customers.get()  // Third-party SDK calls
await prisma.user.findMany()  // Prisma queries
```

**Validation**:
- [ ] All non-fetch async operations identified
- [ ] Documentation complete

**Risk**: Low

---

### PR 6.2: Apply React.cache() to Database Calls

**Deliverable**: Wrap database calls with React.cache()

**Tasks**:
- [ ] Identify all direct database calls in Server Components
- [ ] Wrap with `React.cache()`:
  ```typescript
  import { cache } from 'react'

  export const getUser = cache(async (id: string) => {
    return await db.users.findUnique({ where: { id } })
  })
  ```
- [ ] Ensure cache key uniqueness (function arguments)
- [ ] Test deduplication

**Validation**:
- [ ] No duplicate database calls in same render
- [ ] Performance improved (measure with logging)
- [ ] Functionality unchanged

**Rollback**: Remove `cache()` wrappers

**Risk**: Low

---

### PR 6.3: Apply React.cache() to Third-Party Clients

**Deliverable**: Wrap third-party SDK calls with React.cache()

**Tasks**:
- [ ] Identify third-party client calls (Stripe, analytics, etc.)
- [ ] Wrap with `React.cache()`
- [ ] Test deduplication

**Validation**:
- [ ] No duplicate API calls in same render
- [ ] Third-party rate limits not exceeded
- [ ] Functionality unchanged

**Rollback**: Remove `cache()` wrappers

**Risk**: Low

---

## React.cache() Best Practices

### When to Use

```typescript
// YES - Use React.cache() for:
import { cache } from 'react'

// Database calls
export const getUser = cache(async (id: string) => {
  return await prisma.user.findUnique({ where: { id } })
})

// Third-party SDK calls
export const getStripeCustomer = cache(async (customerId: string) => {
  return await stripe.customers.retrieve(customerId)
})

// File system operations
export const getConfig = cache(async () => {
  return await fs.readFile('./config.json', 'utf-8')
})
```

### When NOT to Use

```typescript
// NO - Don't wrap fetch() - Next.js deduplicates automatically
export const getUser = cache(async (id: string) => {
  return await fetch(`/api/users/${id}`)  // DON'T DO THIS
})
```

### Cache Key Behavior

- Cache key is based on function arguments
- Same arguments = same cache entry
- Different arguments = different cache entries

```typescript
// These are cached separately:
getUser('user-1')  // Cache key: ['user-1']
getUser('user-2')  // Cache key: ['user-2']
```

### Request Scope

- `React.cache()` is per-request
- Cache is cleared after each request
- Not a global cache (use Redis/LRU for that)

---

## Verification

After applying `React.cache()`, verify deduplication:

```typescript
// Add temporary logging
export const getUser = cache(async (id: string) => {
  console.log(`Fetching user: ${id}`)  // Should only log once per request
  return await prisma.user.findUnique({ where: { id } })
})
```

---

## Success Criteria

- [ ] All non-fetch async operations audited
- [ ] Database calls wrapped with `React.cache()`
- [ ] Third-party SDK calls wrapped with `React.cache()`
- [ ] No duplicate calls in same render (verified)
- [ ] Performance improved
- [ ] No functionality regressions
- [ ] TypeScript passes
- [ ] Build succeeds

---

## Navigation

| Previous | Current | Next |
|----------|---------|------|
| [Step 5: Utility Consolidation](./05-epic-utility-consolidation.md) | **Step 6: React.cache()** | [Index](./00-index.md) |
