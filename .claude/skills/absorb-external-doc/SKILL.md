---
name: absorb-external-doc
description: Process external documentation and integrate into project knowledge base with smart merging
triggers:
  - absorb docs
  - absorb external doc
  - process external documentation
  - integrate documentation
  - import docs
---

# Absorb External Documentation

Process external documentation files and integrate them into the project's knowledge base. This skill prevents documentation bloat by intelligently merging content.

## Workflow

### Step 1: Scan for External Documents

```bash
ls -la docs/external/
```

If the directory is empty or doesn't exist, report back and exit.

### Step 2: Analyze Each Document

For each file, determine the destination:

| Content Type | Destination | Example |
|--------------|-------------|---------|
| Architecture, patterns, conventions | AGENTS.md | "Our API uses REST..." |
| Code patterns, API reference | AGENTS.md | "Query hooks pattern..." |
| Step-by-step procedures | New Skill | "To deploy: 1. Run..." |
| Configuration reference | AGENTS.md | "Environment variables..." |
| Troubleshooting runbooks | New Skill | "If error X, do Y..." |

**Default:** If unsure, route to AGENTS.md (context is safer than procedures).

### Step 3: Smart Merge Protocol (CRITICAL)

**NEVER simply append text to the end of a file.**

Before ANY edit:

1. **Read the entire destination file first**
2. **Search for existing sections** that cover the same topic
3. **Apply the correct action:**

| Scenario | Action |
|----------|--------|
| Topic exists | **UPDATE** the existing section. Merge old and new rules into one cohesive block. |
| Topic is new | **CREATE** a new section in the logical location (not just at the end). |

**Prohibited Patterns:**
- Creating "State Management (New)" when "State Management" exists
- Adding "Additional Notes on X" at the bottom
- Appending "See also: newer docs" references
- Duplicate headers or near-duplicate content

**Goal:** Single source of truth. One section per topic. Clean and consolidated.

#### Example: Merging API Documentation

**Existing AGENTS.md section:**
```markdown
### API Patterns
- Use TanStack Query for data fetching
- Mutations have optimistic updates
```

**New doc says:** "Always invalidate queries after mutations"

**Correct merge:**
```markdown
### API Patterns
- Use TanStack Query for data fetching
- Mutations have optimistic updates
- Always invalidate queries after mutations
```

**Wrong:** Creating a new "### API Patterns (Updated)" section.

### Step 4: Apply Updates

#### For AGENTS.md Updates

1. Identify the appropriate existing section (or create new if truly novel)
2. Merge content following existing formatting conventions
3. Condense verbose external docs to match AGENTS.md style (~20-30 lines max per topic)
4. Preserve all actionable information

#### For New Skill Creation

1. Create directory: `.claude/skills/{skill-name}/`
2. Create `SKILL.md` with YAML frontmatter:

```yaml
---
name: {skill-name}
description: {one-line description}
triggers:
  - {trigger phrase 1}
  - {trigger phrase 2}
---
```

3. Convert content to skill format with clear steps and code examples

### Step 5: Clean Up

After successful integration:
1. Delete the original file from `docs/external/`
2. Verify deletion

### Step 6: Report & Call to Action

Provide a summary, then **always end with a proactive offer:**

```
## Absorption Complete

### Processed:
- `docs/external/example.md` → Updated AGENTS.md (API Patterns section)

### Removed:
- docs/external/example.md

---

**I have integrated the knowledge from `example.md`.**

Based on these new rules, would you like me to scan your codebase now and apply these changes to:
- `src/api/queries/*.ts` (query invalidation patterns)
- `src/api/mutations/*.ts` (mutation patterns)
```

**Important:** Always identify specific target files based on what was absorbed. Be concrete, not generic.

## Decision Criteria Summary

| Signal | Route |
|--------|-------|
| "How to...", "Steps to...", numbered procedures | → New Skill |
| "We use...", "Our pattern is...", reference info | → AGENTS.md |
| Mixed content | → Split appropriately |
