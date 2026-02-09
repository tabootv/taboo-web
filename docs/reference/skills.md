# Available Skills & Tools Index

This file indexes all available skills and tools for AI assistant reference.

> **When to use:** Looking for specialized tools or capabilities. Most day-to-day tasks don't need skills.

---

## Quick Navigation

| Category | When to Use | Files |
|----------|------------|-------|
| **Component development** | Building UI components | `create-component`, `frontend-design` |
| **Refactoring** | Simplifying complex code | `component-refactoring` |
| **API migration** | Updating to TanStack Query | `migrate-api` |
| **Documentation** | Syncing docs after changes | `sync-project-docs` |
| **Code quality** | Code review, standards | `clean-code`, `commit-work` |
| **Testing** | Component testing, analysis | `component-refactoring` (includes testing) |
| **Performance** | React/Next.js optimization | `web-performance-optimization`, `.agents/skills/vercel-react-best-practices` |
| **Feature integration** | Complex branch merges | `integrate-branch-feature` |
| **Hovers & patterns** | Netflix-style interactions | `implement-hover-card` |

---

## Claude Skills (.claude/skills/)

These are specialized for Claude Code and similar AI assistants.

### 1. create-component
- **Purpose:** Create UI components following design system
- **When:** Building new components from scratch
- **Files:** `.claude/skills/create-component/SKILL.md`

### 2. frontend-design
- **Purpose:** Create distinctive, production-grade frontend interfaces
- **When:** Building pages, artifacts, complex UI
- **Files:** `.claude/skills/frontend-design/SKILL.md`

### 3. component-refactoring
- **Purpose:** Reduce complexity, extract hooks, improve code quality
- **When:** Component > 300 lines or complexity > 50
- **Files:** `.claude/skills/component-refactoring/SKILL.md`

### 4. migrate-api
- **Purpose:** Migrate legacy API calls to TanStack Query
- **When:** Updating old data fetching patterns
- **Files:** `.claude/skills/migrate-api/SKILL.md`

### 5. sync-project-docs
- **Purpose:** Synchronize docs after structural changes
- **When:** Refactoring code, creating new modules
- **Files:** `.claude/skills/sync-project-docs/SKILL.md`

### 6. integrate-branch-feature
- **Purpose:** Safe migration of features from branches
- **When:** Merging feature branches with architectural standards
- **Files:** `.claude/skills/integrate-branch-feature/SKILL.md`

### 7. apply-feature-context
- **Purpose:** Apply features using AGENTS.md rules
- **When:** Implementing features guided by project patterns
- **Files:** `.claude/skills/apply-feature-context/SKILL.md`

### 8. transmute-external-pattern
- **Purpose:** Translate patterns from other frameworks into React/Next.js
- **When:** Adopting patterns from external repositories
- **Files:** `.claude/skills/transmute-external-pattern/SKILL.md`

### 9. absorb-external-doc
- **Purpose:** Process and integrate external documentation
- **When:** Incorporating external libraries or knowledge bases
- **Files:** `.claude/skills/absorb-external-doc/SKILL.md`

### 10. add-feature-flag
- **Purpose:** Add feature flags for toggling features
- **When:** Rolling out features gradually
- **Files:** `.claude/skills/add-feature-flag/SKILL.md`

### 11. implement-hover-card
- **Purpose:** Netflix-style hover cards with overflow expansion
- **When:** Building hover interactions for media
- **Files:** `.claude/skills/implement-hover-card/SKILL.md`

---

## Copilot Skills (.agents/skills/)

These are universal across AI assistants.

### General Skills

#### daily-meeting-update
- **Purpose:** Interactive daily standup/meeting update generator
- **When:** Preparing standup updates, daily syncs
- **Triggers:** "daily", "standup", "scrum update", "status update"
- **Files:** `.agents/skills/daily-meeting-update/SKILL.md`

#### clean-code
- **Purpose:** Pragmatic coding standards (concise, no over-engineering)
- **When:** Writing code that follows project style
- **Files:** `.agents/skills/clean-code/SKILL.md`

#### commit-work
- **Purpose:** High-quality git commits with clear messages
- **When:** Staging changes, writing commit messages
- **Triggers:** "commit", "stage", "split commits"
- **Files:** `.agents/skills/commit-work/SKILL.md`

#### audit-website
- **Purpose:** Website SEO, technical, content, security audits
- **When:** Analyzing websites, debugging SEO issues
- **Files:** `.agents/skills/audit-website/SKILL.md`

### React & Next.js

#### vercel-react-best-practices
- **Purpose:** React & Next.js performance optimization from Vercel
- **When:** Writing React/Next.js code, optimizing performance
- **Contains 70+ rules:** Bundle optimization, rendering, caching, etc.
- **Files:** `.agents/skills/vercel-react-best-practices/AGENTS.md` + `rules/`

#### web-performance-optimization
- **Purpose:** Diagnose and fix performance issues using streaming, caching, and bundle optimization
- **When:** Page loads slowly, bundle size regression, new feature needs perf optimization
- **Triggers:** "performance", "slow page", "LCP", "CLS", "bundle size"
- **Files:** `.agents/skills/web-performance-optimization/SKILL.md`

---

## When NOT to Use Skills

- Simple bug fixes → Just code it
- Quick questions → Check Layer 2 docs first
- Standard patterns → Already in AGENTS.md
- One-line changes → Don't invoke skills

---

## How to Invoke Skills

### In Claude Code / Similar
```
/skill create-component
/skill component-refactoring
/skill migrate-api
```

### In Copilot CLI
Skills are automatically available based on task keywords.

---

## Performance Best Practices

For performance optimization, always refer to:
- `.agents/skills/vercel-react-best-practices/AGENTS.md` (overview)
- `.agents/skills/vercel-react-best-practices/rules/` (70+ specific patterns)

Key optimization areas:
1. Bundle size (dynamic imports, lazy loading)
2. Rendering (memo, useMemo, useCallback)
3. Server state (React Cache, server components)
4. Client state (SWR deduplication, lazy init)
5. Events (event delegation, passive listeners)

---

## Reference

- **All skills:** `.claude/skills/` and `.agents/skills/`
- **Layer 2 task-specific docs:** `docs/agents/`
- **Main context:** `AGENTS.md` (this layer)
