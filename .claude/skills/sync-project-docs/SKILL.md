---
name: sync-project-docs
description: Synchronize and maintain project documentation after structural changes, refactors, or new implementations
triggers:
  - sync docs
  - sync project docs
  - update documentation
  - sync documentation
  - refresh docs
  - update project docs
  - documentation sync
  - maintain docs
---

# Sync Project Docs

Synchronize and maintain the project's internal documentation to ensure accuracy after structural changes, refactors, or new feature implementations. This skill enforces strict centralization, minimalist consolidation, and context alignment.

## Context

This project maintains a **Living Documents** approach to documentation:

| Document | Purpose | Location | Update Frequency |
|----------|---------|----------|------------------|
| `README.md` | Project overview, quick start, commands | Root | On major changes |
| `AGENTS.md` | AI context, coding patterns, architecture overview | Root | On pattern/architecture changes |
| `PROJECT_CONTEXT.md` | Deep technical knowledge base | `/docs` | On implementation details |
| `DESIGN_SYSTEM.md` | Design tokens, components, styling | `/docs` | On design changes |

**Centralization Rule:** All technical documentation (except README.md and AGENTS.md) MUST reside in `/docs`. No scattered `.md` files in root or feature folders.

## Objective

When triggered, analyze recent changes and synchronize documentation to maintain accuracy and consistency across all living documents.

## Execution Protocol

### Step 1: Audit Recent Changes

Identify what changed by examining:
- Git diff or recent commits
- New/modified files in `src/`
- Changes to directory structure
- New patterns or architectural decisions

```bash
# Suggested commands to understand scope
git log --oneline -10
git diff --stat HEAD~5
```

### Step 2: Classify Changes

Route each change to the appropriate document:

| Change Type | Target Document | Section to Update |
|-------------|-----------------|-------------------|
| New API endpoint | `AGENTS.md` | API Patterns |
| New component pattern | `AGENTS.md` | Code Style |
| Directory restructure | `AGENTS.md` | Architecture |
| New hook or utility | `PROJECT_CONTEXT.md` | Relevant section |
| State management change | `PROJECT_CONTEXT.md` | State Management |
| Design token update | `DESIGN_SYSTEM.md` | Tokens section |
| New dependency/tool | `README.md` | Tech stack or setup |
| Getting started change | `README.md` | Quick Start |

### Step 3: Smart Merge Protocol

**CRITICAL:** Never create new documentation files. Always merge into existing Living Documents.

**Decision Matrix:**

| Scenario | Action |
|----------|--------|
| Topic exists in target doc | Merge/update existing section |
| Topic is new but related | Add subsection to relevant parent |
| Topic is entirely new category | Add new H2 section to appropriate doc |
| Temporary/WIP documentation | Do NOT document until stable |

**Prohibited Patterns:**
- Creating `docs/feature-x.md` for a single feature
- Adding `CHANGELOG.md` or `CONTRIBUTING.md` at root (use README sections)
- Creating `architecture/` subdirectories with multiple files
- Leaving implementation notes as separate markdown files
- Adding "(New)" or "(Updated)" suffixes to section headers

### Step 4: AGENTS.md Priority Updates

AGENTS.md is the AI's primary onboarding context. Update it IMMEDIATELY when:

1. **Coding patterns change** - Update Code Style section
2. **New architectural decisions** - Update Architecture section
3. **API patterns evolve** - Update API Patterns section
4. **Key files change** - Update Key Files table
5. **Environment variables added** - Update Environment section

**Format consistency:** Match existing section style. Use tables for structured data, code blocks for examples.

### Step 5: Consolidation Sweep & Orphan Cleanup

After updates, check for orphan markdown files and clean them up:

```bash
# Check for markdown files outside allowed locations
find . -name "*.md" -not -path "./docs/*" -not -path "./node_modules/*" \
  -not -path "./.git/*" -not -path "./.claude/*" -not -path "./.agents/*" \
  -not -path "./depreciated/*" -not -path "./component-analysis/*" \
  | grep -v -E "^\./README\.md$|^\./AGENTS\.md$|^\./CHANGELOG\.md$"
```

**Allowed locations:**
- `/README.md`, `/AGENTS.md`, `/CHANGELOG.md` - root files
- `/docs/*` - centralized documentation
- `/.claude/*` - Claude Code skills, configs, and refactor plans
- `/.agents/*` - Agent skills
- `/depreciated/*` - legacy code (excluded from build)
- `/component-analysis/*` - temporary analysis reports

**If orphan files found:**
1. Evaluate if content should be merged into Living Documents
2. If WIP/temporary planning docs - leave until stable
3. If outdated duplicates - **delete them**
4. Update any internal references to deleted files

### Step 6: Verification Checklist

Before completing, verify:

- [ ] AGENTS.md reflects current architecture and patterns
- [ ] PROJECT_CONTEXT.md has accurate technical details
- [ ] DESIGN_SYSTEM.md matches current design tokens
- [ ] README.md quick start commands work
- [ ] No orphan markdown files outside `/docs`
- [ ] All internal doc links resolve correctly

## Constraints

1. **Single Source of Truth** - Each piece of information lives in exactly ONE location
2. **No Duplication** - If content exists, update it; don't create parallel versions
3. **Stability Required** - Only document stable, implemented features (not WIP)
4. **AI Context First** - AGENTS.md updates take priority for pattern changes
5. **Merge Over Create** - Default to consolidation, not new files

## Example Workflow

**Trigger:** User says "sync docs" after completing a refactor

**Analysis:**
- Moved `utils/` to `src/shared/utils/`
- Added new `useAuth` hook
- Changed API response types

**Actions:**
1. Update AGENTS.md Architecture section with new directory structure
2. Update AGENTS.md Key Files table if paths changed
3. Add `useAuth` hook documentation to PROJECT_CONTEXT.md Hooks section
4. Update PROJECT_CONTEXT.md API Layer section with new types

**Output:**
```
Documentation synchronized:
- AGENTS.md: Updated Architecture (directory structure), Key Files table
- PROJECT_CONTEXT.md: Added useAuth hook, updated API response types
- No orphan files detected
```

## Important Notes

- This skill should be triggered after significant changes, not after every commit
- When in doubt about where content belongs, prefer AGENTS.md for patterns and PROJECT_CONTEXT.md for implementation details
- Keep AGENTS.md concise (~200 lines max) - it's a quick reference, not exhaustive documentation
- PROJECT_CONTEXT.md can be more detailed but should remain scannable with clear headers
