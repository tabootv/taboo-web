# Step 2: Route Consolidation & Redirects

**Priority**: P0 (CRITICAL)
**PRs**: 5
**Status**: Not Started

---

## Previous Epics Summary

| Step | Epic | Status | Key Outcomes |
|------|------|--------|--------------|
| 1 | Barrel Files Elimination | Not Started | Pending: Remove barrel files, establish direct imports |

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

### PR 2.1: Setup Redirect Infrastructure

**Deliverable**: Redirect configuration with HTTP 301

**Tasks**:
- [ ] Create redirect helper in `next.config.ts`
- [ ] Create `scripts/verify-redirects.js`
- [ ] Document redirect strategy

**Example `next.config.ts`**:
```typescript
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
- [ ] All redirects return HTTP 301
- [ ] No redirect loops
- [ ] Redirect chains max 1 hop

**Rollback**: Remove redirect config

**Risk**: Low

---

### PR 2.2: Consolidate Auth Routes

**Deliverable**: Redirect duplicate auth routes

**Tasks**:
- [ ] Add redirect: `/login` → `/sign-in` (HTTP 301)
- [ ] Add redirect: `/sign-up` → `/register` (HTTP 301)
- [ ] Add redirect: `/signup` → `/register` (HTTP 301)
- [ ] Delete `app/(auth)/signup/` directory
- [ ] Delete `app/(auth)/login/` directory (if exists)
- [ ] Update internal links (codemod: `/login` → `/sign-in`)
- [ ] Update middleware if needed
- [ ] Update server actions paths

**Validation**:
- [ ] All redirects return 301
- [ ] Old routes redirect correctly
- [ ] No 404s on old routes
- [ ] SEO: Check redirect chains (max 1 hop)
- [ ] Auth flows work end-to-end

**Rollback**: Remove redirects, restore deleted routes

**Risk**: High (SEO impact)

---

### PR 2.3: Consolidate Content Routes

**Deliverable**: Remove `content/` and `contents/` routes

**Tasks**:
- [ ] Audit external links (Google Search Console)
- [ ] If external links exist: Add redirects to `app/studio/*` (301)
- [ ] Delete `app/(main)/content/` directory
- [ ] Delete `app/(main)/contents/` directory
- [ ] Update internal links

**Validation**:
- [ ] No 404s on old routes
- [ ] Redirects work correctly
- [ ] Studio routes accessible

**Rollback**: Restore content directories

**Risk**: Medium

---

### PR 2.4: Consolidate Search Routes

**Deliverable**: Standardize search route

**Tasks**:
- [ ] Decide canonical route: `/search` or `/searches`
- [ ] Add redirect from non-canonical to canonical (HTTP 301)
- [ ] Delete non-canonical route directory
- [ ] Update internal links

**Validation**:
- [ ] Search functionality works
- [ ] Redirect returns 301
- [ ] No 404s

**Rollback**: Restore deleted route

**Risk**: Medium

---

### PR 2.5: Remove Route Group Redundancy

**Deliverable**: Clean up `app/(studio)/studio/` structure

**Tasks**:
- [ ] Audit `app/(studio)/studio/` for redundancy
- [ ] Move to `app/studio/` (direct route, no route group)
- [ ] Update all internal links
- [ ] Set up redirect if needed

**Validation**:
- [ ] Studio pages work correctly
- [ ] No broken links
- [ ] TypeScript passes

**Rollback**: Restore route group structure

**Risk**: Medium

---

## Success Criteria

- [ ] All duplicate routes consolidated
- [ ] All redirects use HTTP 301 (permanent)
- [ ] No redirect loops
- [ ] No redirect chains > 1 hop
- [ ] All internal links updated
- [ ] No 404 errors introduced
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

| Previous | Current | Next |
|----------|---------|------|
| [Step 1: Barrel Files](./01-epic-barrel-files.md) | **Step 2: Route Consolidation** | [Step 3: Component Colocation](./03-epic-component-colocation.md) |
