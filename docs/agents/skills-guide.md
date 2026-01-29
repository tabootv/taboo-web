# Agent Skills Guide

> **For AI assistants:** How to discover, invoke, and extend agent skills for TabooTV development.

---

## Overview

Agent skills are specialized capabilities that enhance AI-assisted development. They contain domain-specific patterns, workflows, and automation for common tasks.

**Two skill systems:**
- **Universal skills** (`.agents/skills/`) – Available to all AI assistants
- **Claude-specific skills** (`.claude/skills/`) – Optimized for Claude Code

---

## Quick Reference: All 12 Skills

| Skill | Purpose | Triggers | Files |
|-------|---------|----------|-------|
| **refactoring-patterns** | Simplify code, extract logic | "refactor", "simplify", "complex" | `.agents/skills/refactoring-patterns/` |
| **api-integration** | TanStack Query, API clients, OpenAPI | "API", "query", "mutation", "fetch" | `.agents/skills/api-integration/` |
| **ui-components** | Tailwind CSS, shadcn, design system | "component", "UI", "style", "design" | `.agents/skills/ui-components/` |
| **testing** | Vitest, unit tests, component tests | "test", "unit test", "spec", "coverage" | `.agents/skills/testing/` |
| **typescript-patterns** | Type system, interfaces, generics | "type", "interface", "generic", "type-safe" | `.agents/skills/typescript-patterns/` |
| **bundling-optimization** | Code splitting, lazy loading, bundle | "bundle", "performance", "split", "optimize" | `.agents/skills/bundling-optimization/` |
| **code-organization** | Module structure, feature boundaries | "architecture", "structure", "module", "boundary" | `.agents/skills/code-organization/` |
| **linting-practices** | ESLint, code quality, best practices | "lint", "warning", "code quality", "best practices" | `.agents/skills/linting-practices/` |
| **clean-code** | Pragmatic standards, concise code | "clean code", "standards", "pragmatic" | `.agents/skills/clean-code/` |
| **commit-work** | Git commits, staging, conventional commits | "commit", "git", "stage", "message" | `.agents/skills/commit-work/` |
| **component-refactoring** | React complexity reduction, hook extraction | "complexity", "refactor", "hook extraction" | `.agents/skills/component-refactoring/` |
| **vercel-react-best-practices** | React 19, Next.js 16 performance | "performance", "React", "Next.js", "optimization" | `.agents/skills/vercel-react-best-practices/` |

---

## How to Invoke a Skill

### Method 1: Request in Task Description

```
User: "I need to refactor this complex component"
AI: Detects keyword "refactor" → Loads refactoring-patterns skill
AI: Applies skill patterns and workflows to the refactoring task
```

### Method 2: Explicit Skill Invocation

```
User: "Use the testing skill to write component tests for LoginForm"
AI: Explicitly loads .agents/skills/testing/SKILL.md
AI: Follows testing patterns and examples to create tests
```

### Method 3: Auto-Detection via Trigger Keywords

The system monitors for **trigger keywords** during task execution:

**Trigger Keywords for Each Skill:**

```
refactoring-patterns:
  - "refactor", "simplify", "reduce complexity", "extract", "DRY"

api-integration:
  - "API", "query hook", "mutation", "TanStack Query", "fetch data", "HTTP"

ui-components:
  - "component", "UI", "button", "card", "design system", "Tailwind", "shadcn"

testing:
  - "test", "unit test", "component test", "spec", "coverage", "Vitest"

typescript-patterns:
  - "type", "interface", "generic", "type-safe", "strict", "type checking"

bundling-optimization:
  - "bundle size", "performance", "code splitting", "lazy load", "optimize"

code-organization:
  - "architecture", "structure", "module boundaries", "feature module", "organize"

linting-practices:
  - "lint", "ESLint", "code quality", "warning", "error", "best practices"

clean-code:
  - "clean code", "pragmatic", "standards", "concise", "readable"

commit-work:
  - "commit", "git", "stage", "conventional commit", "commit message"

component-refactoring:
  - "complexity", "lines of code", "hook extraction", "reduce complexity"

vercel-react-best-practices:
  - "React", "Next.js", "performance", "optimization", "SSR", "CSR"
```

**Example:**
```
User: "This component is getting too complex. It's 450 lines with nested hooks."
AI: Detects keywords: "complex", "lines", "hooks" 
AI: → Automatically loads component-refactoring skill
AI: → Applies hook extraction and complexity reduction patterns
```

---

## Skill Structure

Each skill follows this pattern:

```
.agents/skills/[skill-name]/
├── SKILL.md              (Main skill documentation)
├── patterns.md           (Code patterns & examples)
├── workflows.md          (Step-by-step workflows)
└── checklist.md          (Implementation checklist)
```

### Inside SKILL.md

```markdown
# [Skill Name] Skill

## When to Use
- Specific triggers and keywords
- Example scenarios
- Common use cases

## Patterns & Examples
- Code samples
- Before/after comparisons
- Best practices

## Workflows
1. Step-by-step process
2. Validation points
3. Common pitfalls

## Checklist
- [ ] Task item 1
- [ ] Task item 2
- [ ] Validation step

## Cross-Links
- Related skills
- Documentation references
```

---

## Extending Skills

### Adding a New Pattern to Existing Skill

1. **Locate the skill:** `.agents/skills/[skill-name]/SKILL.md`
2. **Add pattern section:** Include new code example in "Patterns & Examples"
3. **Update workflow:** Add step if it changes the process
4. **Test it:** Apply pattern to actual task
5. **Document:** Add trigger keywords if applicable

**Example:** Adding a new TanStack Query pattern

```bash
# Edit the API integration skill
vim .agents/skills/api-integration/SKILL.md

# Add new pattern under "Patterns & Examples"
## Infinite Scroll Pattern
```

### Creating a New Skill

1. **Create directory:**
   ```bash
   mkdir -p .agents/skills/new-skill-name
   ```

2. **Create SKILL.md** with structure above

3. **Add trigger keywords** to AGENTS.md Skill Registry

4. **Link from:** docs/CONTEXT_ARCHITECTURE.md and docs/reference/skills.md

5. **Test by:** Invoking skill with trigger keywords

---

## Where Skills Live

### Universal Skills (All AI Assistants)

```
.agents/skills/
├── refactoring-patterns/
├── api-integration/
├── ui-components/
├── testing/
├── typescript-patterns/
├── bundling-optimization/
├── code-organization/
├── linting-practices/
├── clean-code/
├── commit-work/
├── component-refactoring/
└── vercel-react-best-practices/
```

### Claude-Specific Skills

```
.claude/skills/
├── create-component/
├── frontend-design/
├── migrate-api/
├── sync-project-docs/
├── absorb-external-doc/
├── add-feature-flag/
├── apply-feature-context/
├── audit-website/
└── [others]/
```

---

## Best Practices for Using Skills

### 1. Use Trigger Keywords

Don't say: *"Please make this code better"*  
Do say: *"This function is getting complex – refactor it"*

The second triggers the refactoring-patterns skill automatically.

### 2. Load Minimal Skills

Don't load all skills at once – it bloats context.  
Do load only the skill relevant to the current task.

### 3. Chain Skills When Needed

Some tasks benefit from multiple skills:

```
Task: "Build a new component and write tests for it"
Skills: ui-components → testing
```

### 4. Reference Skill Patterns

When applying a skill, **reference** the specific pattern being used:

```
AI: "Using the 'TanStack Query Pagination Pattern' from api-integration skill..."
AI: [shows pattern]
AI: "Applying this pattern to your code..."
```

### 5. Document Skill Usage in Commits

```
git commit -m "refactor(components): Simplify MediaCard component

- Used refactoring-patterns skill: Extract logic to custom hook
- Reduced cyclomatic complexity from 8 to 4
- Applied clean-code principles for readability"
```

---

## Common Skill Combinations

### Building a New Feature

1. **code-organization** – Plan feature structure
2. **ui-components** – Build UI component
3. **api-integration** – Add API queries/mutations
4. **typescript-patterns** – Type the feature
5. **testing** – Write component tests
6. **commit-work** – Commit changes

### Refactoring Complex Code

1. **refactoring-patterns** – Identify issues
2. **component-refactoring** (if React) – Extract hooks
3. **typescript-patterns** – Improve types
4. **clean-code** – Ensure readability
5. **testing** – Validate changes
6. **commit-work** – Commit refactoring

### Optimizing Performance

1. **bundling-optimization** – Analyze bundle
2. **vercel-react-best-practices** – Apply React patterns
3. **code-organization** – Restructure if needed
4. **testing** – Verify performance gains
5. **commit-work** – Document improvements

---

## Troubleshooting

### "Skill didn't load automatically"

**Problem:** Trigger keywords not recognized  
**Solution:** Use explicit keywords from the trigger list above

**Example:**
- ❌ "Make this faster" (too generic)
- ✅ "Optimize performance with code splitting" (uses trigger keywords)

### "Multiple skills could apply"

**Problem:** Task matches triggers for multiple skills  
**Solution:** Load the most relevant skill first, then chain others if needed

**Example:** "Build and test a component"
- Primary skill: `ui-components` (building)
- Secondary skill: `testing` (after building)

### "Need a pattern not in current skill"

**Problem:** Skill doesn't cover your specific use case  
**Solution:**
1. Check related skills (they may have the pattern)
2. Look in `docs/reference/` for background
3. Extend the skill with new pattern
4. Submit for review/consolidation

---

## Skill Discovery

### Finding Skills by Task

```bash
# Search trigger keywords in AGENTS.md
grep -r "performance\|optimize" AGENTS.md

# Results show:
# → bundling-optimization skill
# → vercel-react-best-practices skill
```

### Finding Skills by Domain

| Domain | Primary Skills | Secondary Skills |
|--------|---|---|
| **Component Development** | ui-components | clean-code, vercel-react-best-practices |
| **API & Data** | api-integration | typescript-patterns, testing |
| **Testing** | testing | component-refactoring, vercel-react-best-practices |
| **Code Quality** | clean-code, refactoring-patterns | linting-practices, component-refactoring |
| **Architecture** | code-organization | refactoring-patterns, bundling-optimization |
| **Performance** | bundling-optimization, vercel-react-best-practices | code-organization, component-refactoring |

---

## Integration with AGENTS.md

Skills are referenced in **AGENTS.md Skill Registry**:

```
## Skill Registry

| Skill | Triggers | Purpose | Docs |
| ... | ... | ... | .agents/skills/[skill-name]/ |
```

**When adding/updating skills:**
1. Update `.agents/skills/[skill-name]/SKILL.md`
2. Update trigger keywords in **AGENTS.md Skill Registry**
3. Update `docs/reference/skills.md` with new entries
4. Verify links work correctly

---

## See Also

- **AGENTS.md** – Trigger keywords and skill registry
- **docs/reference/skills.md** – Complete skill index
- **docs/CONTEXT_ARCHITECTURE.md** – How layers work
- **docs/agents/** – Specialized guides for specific domains

---

*Last updated: January 27, 2026*  
*Skill system: 12 universal + Claude-specific skills*  
*Next review: When new skills are added*
