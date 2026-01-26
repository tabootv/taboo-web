---
name: integrate-branch-feature
description: Orchestrate safe migration of features from source branches into the target branch using git worktrees, with automatic enforcement of architectural standards, sub-skill orchestration, and granular migration planning.
triggers:
  - integrate branch
  - integrate feature branch
  - merge branch with refactor
  - port feature from branch
  - migrate branch feature
  - branch integration
  - worktree integration
---

# Integrate Branch Feature

Safely migrate features from a source branch (Branch X) into the target branch while enforcing TabooTV architectural standards. Uses git worktrees for side-by-side analysis, orchestrates multiple refactoring sub-skills, and produces granular epic-based migration plans.

---

## Architecture Standards Reference

### Target Patterns (MUST Enforce)

| Category | Standard | Reference |
|----------|----------|-----------|
| **Components** | `_components/` colocation for route-specific | `app/[route]/_components/` |
| **Server Components** | Server Components by default | `'use client'` only when needed |
| **API Layer** | TanStack Query hooks | `src/api/queries/`, `src/api/mutations/` |
| **Imports** | Direct imports, NO barrel files | `from '@/api/queries/video.queries'` |
| **State** | Zustand stores for client state | `src/shared/stores/` |
| **Server Actions** | Colocated `_actions.ts` files | `app/[route]/_actions.ts` |
| **Design Tokens** | Import from design-tokens.ts | `@/shared/lib/design-tokens.ts` |

### Architectural Smells to Detect

| Smell | Detection Pattern | Target Refactor |
|-------|-------------------|-----------------|
| **Barrel File Import** | `from '@/components/ui'` | Direct: `from '@/components/ui/button'` |
| **Poor Colocation** | `src/components/[route]/` | Move to `app/[route]/_components/` |
| **Client-Heavy** | `'use client'` at page level | Split Server/Client components |
| **Legacy API** | `fetch()` in components | TanStack Query hooks |
| **Scattered Actions** | `src/actions/` or `lib/actions/` | Colocate to `_actions.ts` |
| **Inline Styles** | Hard-coded colors/spacing | Design tokens |
| **Monolithic Components** | 300+ lines, complexity > 50 | Extract hooks & sub-components |

---

## Execution Protocol

### Phase 1: Initialize Worktree & Scan

**Step 1.1: Create Git Worktree**

```bash
# Create worktree for source branch analysis
git worktree add ../taboo-web-branch-x [branch-name]

# Verify worktree
git worktree list
```

**Step 1.2: Deep Scan Source Branch**

Analyze the source branch for:
- All modified/added files (vs. common ancestor)
- Component complexity metrics
- Import patterns (barrel files, relative paths)
- README.md and technical notes for absorption
- Feature boundaries (what constitutes a single "feature")

```bash
# Find modified files
cd ../taboo-web-branch-x
git diff --name-only $(git merge-base HEAD develop)..HEAD

# Identify new features by directory
git diff --stat $(git merge-base HEAD develop)..HEAD | grep -E "^\s*(src/|app/)"
```

**Step 1.3: Identify Documentation for Absorption**

Scan for technical documentation that should be routed to `absorb-external-doc`:

```bash
find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" \
  | xargs grep -l -E "(pattern|convention|architecture|how to)"
```

---

### Phase 2: Generate Comparative Report

For each modified file/feature, generate a report in this format:

```markdown
# Branch Integration Report: [branch-name] → [target-branch]

**Generated:** [timestamp]
**Source Branch:** [branch-name]
**Target Branch:** [target-branch]

## Summary

| Metric | Count |
|--------|-------|
| Files Modified | X |
| New Features | Y |
| Architectural Smells | Z |
| Estimated Epics | N |

---

## Feature Analysis

### Feature 1: [Feature Name]

**Source State (Branch X):**
- Files: `src/components/new-feature/`, `src/hooks/useNewFeature.ts`
- Smells Detected:
  - ❌ Barrel file import: `from '@/components/ui'`
  - ❌ Poor colocation: Component in `src/components/` not route
  - ⚠️ Complexity: 65 (threshold: 50)

**Target Implementation:**
- Move to: `app/(main)/feature/_components/`
- Refactors Required:
  - Convert barrel imports to direct imports
  - Split Server/Client components
  - Extract custom hook for state logic
- Sub-Skills: `vercel-react-best-practices`, `component-refactoring`, `clean-code`
- Effort: M

---

## Documentation for Absorption

| Source File | Destination | Action |
|-------------|-------------|--------|
| `docs/FEATURE_SPEC.md` | AGENTS.md (API Patterns) | Merge |
| `README-feature.md` | New Skill | Create |
```

---

### Phase 3: Build Migration Plan

**Step 3.1: Create Migration Directory**

```bash
mkdir -p temp/migration-plan/
```

**Step 3.2: Generate Epic Files**

Create one `.md` file per epic (logical grouping of related changes):

**File: `temp/migration-plan/01-epic-[feature-name].md`**

```markdown
# Epic 1: [Feature Name] Migration

**Priority:** P0 | P1 | P2
**Estimated Effort:** S | M | L
**Dependencies:** None | Epic X

---

## Pre-Migration Checklist

- [ ] Source worktree accessible
- [ ] Target branch up to date
- [ ] No uncommitted changes in target

---

## Tasks

### Task 1.1: Port Core Logic

**Source:** `../taboo-web-branch-x/src/components/feature/index.tsx`
**Target:** `app/(main)/feature/_components/feature-core.tsx`

**Changes Required:**
- [ ] Copy file to target location
- [ ] Convert imports: `@/components/ui` → direct imports
- [ ] Add `'use client'` directive if needed
- [ ] Update path aliases

**Validation:**
```bash
pnpm type-check
```

---

### Task 1.2: Extract Custom Hook

**Source:** State logic in component (lines 45-120)
**Target:** `app/(main)/feature/_components/use-feature-state.ts`

**Changes Required:**
- [ ] Extract useState/useEffect to custom hook
- [ ] Export hook from new file
- [ ] Update component to use hook

**Validation:**
```bash
pnpm type-check
pnpm lint
```

---

### Task 1.3: Invoke Sub-Skills

**Sequence:**
1. [ ] `vercel-react-best-practices` - Enforce barrel file elimination
2. [ ] `component-refactoring` - Reduce complexity (if > 50)
3. [ ] `clean-code` - Sanitize naming, remove dead code

---

## Post-Migration Checklist

- [ ] `pnpm type-check` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` passes
- [ ] Feature renders correctly (manual test)
- [ ] No broken imports

---

## Rollback Plan

```bash
git checkout -- app/(main)/feature/
git clean -fd app/(main)/feature/_components/
```
```

---

### Phase 4: Execute & Orchestrate

**Step 4.1: Execute Epics Sequentially**

For each epic in `temp/migration-plan/`:

1. **Read the epic file** and understand all tasks
2. **Execute tasks in order**, checking off as complete
3. **Invoke sub-skills at designated points**

**Sub-Skill Orchestration Order:**

| Order | Skill | Purpose | Trigger Condition |
|-------|-------|---------|-------------------|
| 1 | `vercel-react-best-practices` | Enforce colocation, Server-First, no barrels | Always |
| 2 | `component-refactoring` | Reduce complexity, extract hooks | Complexity > 50 OR lineCount > 300 |
| 3 | `clean-code` | Naming, SRP, DRY, KISS | Always |
| 4 | `sync-project-docs` | Update /docs with new feature | If feature adds patterns |
| 5 | `absorb-external-doc` | Integrate READMEs/specs | If documentation found |

**Step 4.2: Validation Per Epic**

After completing each epic:

```bash
# Type check
pnpm type-check

# Build check
pnpm build

# Lint check
pnpm lint

# Run affected tests (if available)
pnpm test -- --filter=[feature-name]
```

**If validation fails:**
- DO NOT proceed to next epic
- Fix the issue in current epic
- Re-run validation
- Update epic file with any changes

---

### Phase 5: Validate Complete Integration

**Step 5.1: Full Build Validation**

```bash
pnpm type-check
pnpm build
pnpm lint
pnpm test
```

**Step 5.2: Manual Smoke Test Checklist**

```markdown
## Smoke Test Checklist

- [ ] Application starts without errors
- [ ] New feature routes are accessible
- [ ] Feature functionality works as expected
- [ ] No console errors
- [ ] No regressions in existing features
```

**Step 5.3: Generate Integration Summary**

```markdown
# Integration Complete: [branch-name] → [target-branch]

**Completed:** [timestamp]

## Epics Completed

| Epic | Status | Notes |
|------|--------|-------|
| Epic 1: [Name] | ✅ Complete | - |
| Epic 2: [Name] | ✅ Complete | Required extra refactor |

## Refactors Applied

| Refactor Type | Count | Files Affected |
|---------------|-------|----------------|
| Barrel → Direct Import | X | file1.ts, file2.ts |
| Component Colocation | Y | ... |
| Complexity Reduction | Z | ... |

## Documentation Updated

- AGENTS.md: Added [section]
- New Skill Created: [skill-name]

## Validation Results

- Type Check: ✅ Pass
- Build: ✅ Pass
- Lint: ✅ Pass
- Tests: ✅ Pass (X/X)
```

---

### Phase 6: Clean Up

**Step 6.1: Remove Worktree**

```bash
git worktree remove ../taboo-web-branch-x --force
```

**Step 6.2: Remove Migration Plan (Optional)**

```bash
# Keep for reference or remove
rm -rf temp/migration-plan/
```

**Step 6.3: Final Commit**

If all validations pass and user approves:

```bash
git add .
git commit -m "feat: integrate [branch-name] with refactored architecture

- Ported [feature names]
- Enforced colocation pattern
- Eliminated barrel file imports
- Reduced component complexity
- Updated documentation

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Quick Reference Tables

### Smell Detection Patterns

| Smell | Regex/Pattern | Severity |
|-------|---------------|----------|
| Barrel Import (UI) | `from ['"]@/components/ui['"]` | HIGH |
| Barrel Import (API) | `from ['"]@/api/(queries\|mutations)['"]` | HIGH |
| Poor Colocation | Files in `src/components/[route-name]/` | MEDIUM |
| Page-Level Client | `'use client'` in `page.tsx` | MEDIUM |
| Legacy Fetch | `fetch\(` in component files | LOW |
| Inline Styles | `style=\{\{` or hard-coded hex | LOW |

### Component Complexity Thresholds

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Complexity Score | 0-25 | 26-50 | >50 |
| Line Count | <150 | 150-300 | >300 |
| useState Count | 0-3 | 4-6 | >6 |
| useEffect Count | 0-2 | 3-4 | >4 |

### Sub-Skill Reference

| Skill | Invocation | When to Use |
|-------|------------|-------------|
| `vercel-react-best-practices` | Automatic (always) | Performance patterns, bundle optimization |
| `component-refactoring` | If complexity > 50 | Split components, extract hooks |
| `clean-code` | Automatic (always) | Naming, SRP, remove dead code |
| `sync-project-docs` | If new patterns added | Update AGENTS.md, PROJECT_CONTEXT.md |
| `absorb-external-doc` | If docs found in branch | Merge specs into knowledge base |

---

## Error Handling

### Worktree Creation Fails

```
Error: fatal: '[branch-name]' is already checked out
```

**Resolution:**
```bash
# Find existing worktree
git worktree list

# Remove if stale
git worktree remove [path] --force

# Or use different path
git worktree add ../taboo-web-branch-x-2 [branch-name]
```

### Build Fails During Epic

**DO NOT continue to next epic.**

1. Read error message carefully
2. Identify root cause (usually import path or type mismatch)
3. Fix in current epic context
4. Re-run validation
5. Update epic file with fix notes

### Merge Conflicts

If source branch is significantly diverged:

1. **Option A:** Rebase source branch first (recommended)
   ```bash
   cd ../taboo-web-branch-x
   git rebase develop
   ```

2. **Option B:** Cherry-pick individual commits
   ```bash
   git cherry-pick [commit-hash]
   ```

3. **Option C:** Manual conflict resolution during migration
   - Document conflicts in epic file
   - Resolve using target branch patterns

---

## Constraints

1. **Never break the build** - Each epic must leave codebase in working state
2. **Never skip validation** - Always run type-check and build after each epic
3. **Never merge directly** - Always go through migration plan process
4. **Single source of truth** - Documentation updates follow `absorb-external-doc` patterns
5. **Preserve git history** - Use meaningful commits per epic, not one giant commit

---

## Example Workflow

**User:** "Integrate branch `feat/shorts-player-v2` into `develop`"

**AI Response:**

```
## Branch Integration: feat/shorts-player-v2 → develop

### Phase 1: Initializing Worktree

Creating worktree at ../taboo-web-shorts-v2...
✅ Worktree created successfully

### Phase 2: Scanning Source Branch

Analyzing 23 modified files...

**Architectural Smells Detected:**
- 8 barrel file imports
- 3 components in wrong location
- 1 component with complexity 72

### Phase 3: Comparative Report Generated

| Feature | Source Smells | Target Refactors | Effort |
|---------|---------------|------------------|--------|
| ShortsPlayer | Barrel imports, complexity 72 | Direct imports, split component | M |
| ShortsGestures | Poor colocation | Move to _components/ | S |
| ShortsAPI | Legacy fetch | TanStack Query | M |

### Phase 4: Migration Plan Created

Created 3 epics in temp/migration-plan/:
1. 01-epic-shorts-player.md
2. 02-epic-shorts-gestures.md
3. 03-epic-shorts-api.md

**Ready to execute. Shall I proceed with Epic 1?**
```

---

## Related Skills

- `vercel-react-best-practices` - Performance optimization rules
- `component-refactoring` - Complexity reduction
- `clean-code` - Pragmatic coding standards
- `sync-project-docs` - Documentation synchronization
- `absorb-external-doc` - External documentation integration
