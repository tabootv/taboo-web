# Architecture Refactor - Execution Plan

**Source Document**: `/ARCHITECTURE_REFACTOR_CONSOLIDATED.md`
**Status**: Ready for Execution
**Last Updated**: 2026-01-24

---

## Quick Navigation

Say **"continue to step N"** to execute the corresponding epic:

| Step | Epic | Priority | Status | PRs | Est. Duration |
|------|------|----------|--------|-----|---------------|
| 1 | [Barrel Files Elimination](./01-epic-barrel-files.md) | P0 CRITICAL | Not Started | 8 | 1-2 weeks |
| 2 | [Route Consolidation](./02-epic-route-consolidation.md) | P0 CRITICAL | Not Started | 5 | 3-5 days |
| 3 | [Component Colocation](./03-epic-component-colocation.md) | P1 HIGH | Not Started | 8 | 1 week |
| 4 | [Server Actions](./04-epic-server-actions.md) | P1 HIGH | Not Started | 5 | 1 week |
| 5 | [Utility Consolidation](./05-epic-utility-consolidation.md) | P2 MEDIUM | Not Started | 3 | 2-3 days |
| 6 | [React.cache()](./06-epic-react-cache.md) | P2 MEDIUM | Not Started | 3 | 2-3 days |

---

## Shared Resources

- [Context & Best Practices](./00-context.md) - Risk Matrix, CI/CD, Checklists
- [Ideal Structure](./00-context.md#ideal-structure) - Target architecture
- [Validation Scripts](./00-context.md#validation-scripts) - Bundle measurement, redirect verification

---

## Execution Order

```
Step 1 (Barrel Files) ─────────────────────────────────────────┐
         │                                                      │
         v                                                      │ P0 Critical
Step 2 (Route Consolidation) ──────────────────────────────────┤
         │                                                      │
         v                                                      │
Step 3 (Component Colocation) ─────────────────────────────────┤
         │                                                      │ P1 High
         v                                                      │
Step 4 (Server Actions) ───────────────────────────────────────┤
         │                                                      │
         ├──────────────┬──────────────────────────────────────┘
         v              v
Step 5 (Utils)    Step 6 (Cache)                    <── P2 Medium (can run in parallel)
```

---

## Progress Tracking

Update this section as work progresses:

### Current Sprint

- **Active Step**: None
- **Active PR**: None
- **Blockers**: None

### Completed PRs

| Step | Epic | PRs Completed |
|------|------|---------------|
| 1 | Barrel Files | 0/8 |
| 2 | Route Consolidation | 0/5 |
| 3 | Component Colocation | 0/8 |
| 4 | Server Actions | 0/5 |
| 5 | Utility Consolidation | 0/3 |
| 6 | React.cache() | 0/3 |

---

## How to Use

1. **Start execution**: Say "continue to step 1" to begin with barrel files
2. **Resume work**: Say "continue to step N" to pick up where you left off
3. **Check status**: Reference this index for overall progress
4. **Get context**: Each step file includes a summary of previous epics

---

## Baseline Metrics (To Be Captured in Step 1)

| Metric | Baseline | Current | Target | Status |
|--------|----------|---------|--------|--------|
| Build Time (cold) | TBD | TBD | -20% | Pending |
| Bundle Size (total) | TBD | TBD | -15% | Pending |
| HMR Latency (avg) | TBD | TBD | -30% | Pending |
| Test Coverage | TBD | TBD | Maintain | Pending |

---

## Success Criteria

### Must Have

- [ ] All barrel files removed (except documented exceptions)
- [ ] All routes consolidated with proper HTTP 301 redirects
- [ ] Components colocated correctly
- [ ] Build time improved by 15%+
- [ ] Bundle size reduced by 10%+
- [ ] No broken imports
- [ ] All tests pass
- [ ] No SEO regressions

### Nice to Have

- [ ] HMR latency improved by 20%+
- [ ] Test coverage maintained or improved
- [ ] Developer ergonomics improved
- [ ] Documentation complete
