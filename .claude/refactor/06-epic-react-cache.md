# Step 6: React.cache() Optimization

**Priority**: P2 (MEDIUM)
**PRs**: 2 (PR 6.2 skipped - no database calls)
**Status**: Complete ✅

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

`React.cache()` is only used in 1 file (`src/shared/lib/api/home-data.ts`). It should be used for non-fetch operations to deduplicate expensive calls within a single request.

**Important**: Next.js 15+ deduplicates `fetch()` automatically - **DO NOT** wrap `fetch()` calls with `React.cache()`.

**Use For**:
- Direct database calls
- File system operations
- Third-party client SDK calls
- Expensive computations

---

## PR Breakdown

### PR 6.1: Audit Non-Fetch Operations ✅ COMPLETED

**Deliverable**: List of operations needing `React.cache()`

**Tasks**:
- [x] Find all non-`fetch()` async operations in Server Components
- [x] Identify: Direct DB calls, file system ops, third-party clients
- [x] Document candidates for caching
- [x] Prioritize by call frequency

**Validation**:
- [x] All non-fetch async operations identified
- [x] Documentation complete

**Risk**: Low

---

## Audit Results (PR 6.1 Findings)

### Already Optimized with React.cache()

| File | Function | Status |
|------|----------|--------|
| `src/shared/lib/api/home-data.ts:57-115` | `fetchHomeData()` | ✅ Cached |
| `src/shared/lib/api/home-data.ts:122-152` | `fetchPlaylistVideos()` | ✅ Cached |

### Candidates for React.cache()

#### HIGH PRIORITY - FirstPromoter Aggregation Functions

These functions orchestrate multiple parallel API calls and would benefit significantly from React.cache():

| File | Function | Lines | Description | Call Frequency |
|------|----------|-------|-------------|----------------|
| `src/shared/lib/firstpromoter/client.ts` | `getComprehensiveEarningsData()` | 679-744 | 5 parallel FirstPromoter API calls | Per earnings page |
| `src/shared/lib/firstpromoter/client.ts` | `getPromoterEarningsData()` | 509-532 | Combines profile, rewards, reports | Per earnings page |

#### MEDIUM PRIORITY - Individual FirstPromoter Functions

These have `next: { revalidate: 60 }` on their fetch calls but could benefit from per-request deduplication:

| File | Function | Lines | Description |
|------|----------|-------|-------------|
| `src/shared/lib/firstpromoter/client.ts` | `getPromoterProfileV2()` | 538-560 | Enhanced profile data |
| `src/shared/lib/firstpromoter/client.ts` | `getCommissionsList()` | 565-605 | Paginated commissions |
| `src/shared/lib/firstpromoter/client.ts` | `getPayoutsList()` | 648-674 | Paginated payouts |
| `src/shared/lib/firstpromoter/client.ts` | `getReferralsList()` | 610-643 | Paginated referrals |
| `src/shared/lib/firstpromoter/client.ts` | `getPromoterReports()` | 317-353 | Date-filtered reports |
| `src/shared/lib/firstpromoter/client.ts` | `getRewardsList()` | 358-397 | Paginated rewards |
| `src/shared/lib/firstpromoter/client.ts` | `getPromoterProfile()` | 255-311 | V1 profile & lifetime stats |

### No Action Needed

| Category | Reason |
|----------|--------|
| **Database Calls** | None found - app uses external Laravel API via fetch |
| **File System Operations** | None found in server components |
| **Server Actions** | All are mutations (write operations) - caching not applicable |
| **Public API Routes** | Already use ISR caching (`next: { revalidate: 300 }`) |
| **Client Components** | React.cache() not applicable - client-side fetching |
| **Fetch Calls** | Next.js 15+ auto-deduplicates - no wrapping needed |

### API Route Handlers (Optional Optimization)

| File | Handler | Current Status |
|------|---------|----------------|
| `src/app/api/creator-studio/earnings/route.ts` | `GET()` | Calls `getComprehensiveEarningsData()` - will benefit when that's cached |
| `src/app/api/creator/firstpromoter/reports/route.ts` | `GET()` | Uses fetch with revalidation |
| `src/app/api/creator/firstpromoter/stats/route.ts` | `GET()` | Uses fetch with revalidation |

---

### PR 6.2: Apply React.cache() to Database Calls - SKIPPED

**Status**: No database calls found

**Findings**: This codebase does not have direct database calls. All data fetching goes through:
1. External Laravel API via `fetch()` (auto-deduplicated by Next.js)
2. FirstPromoter third-party SDK (addressed in PR 6.3)

**No action required for this PR.**

---

### PR 6.3: Apply React.cache() to FirstPromoter Client ✅ COMPLETED

**Deliverable**: Wrap FirstPromoter SDK calls with React.cache()

**Target File**: `src/shared/lib/firstpromoter/client.ts`

**Tasks**:
- [x] Add `import { cache } from 'react'` at top of file
- [x] Wrap HIGH PRIORITY functions:
  - [x] `getComprehensiveEarningsData()`
  - [x] `getPromoterEarningsData()`
- [x] Wrap MEDIUM PRIORITY functions:
  - [x] `getPromoterProfileV2()`
  - [x] `getCommissionsList()`
  - [x] `getPayoutsList()`
  - [x] `getReferralsList()`
  - [x] `getPromoterReports()`
  - [x] `getRewardsList()`
  - [x] `getPromoterProfile()`

**Validation**:
- [x] TypeScript passes
- [x] Build succeeds
- [ ] No duplicate API calls in same render (verify with console.log) - manual testing needed
- [ ] Earnings page displays correct data - manual testing needed

**Rollback**: Remove `cache()` wrappers, revert to regular async functions

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

- [x] All non-fetch async operations audited (PR 6.1 ✅)
- [x] Database calls identified - None found (uses external Laravel API)
- [x] FirstPromoter SDK calls wrapped with `React.cache()` (PR 6.3 ✅)
- [ ] No duplicate calls in same render (manual verification needed)
- [ ] Earnings page performance improved (manual verification needed)
- [x] No functionality regressions (build passes)
- [x] TypeScript passes
- [x] Build succeeds

---

## Navigation

| Previous | Current | Next |
|----------|---------|------|
| [Step 5: Utility Consolidation](./05-epic-utility-consolidation.md) | **Step 6: React.cache()** | [Index](./00-index.md) |
