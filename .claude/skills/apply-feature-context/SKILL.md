---
name: apply-feature-context
description: Apply features to files using rules from a specific AGENTS.md section as ground truth
triggers:
  - with context
  - apply with context
  - use context
  - using context from
---

# Apply Feature with Context

Apply features to files while strictly adhering to rules from a specific section in AGENTS.md. This ensures consistency with documented project patterns.

## Trigger Pattern

```
With context [Section Name], apply [Feature] to [File/Component]
```

**Examples:**
- "With context API Patterns, apply data fetching to UserProfile"
- "With context Design System, apply styling to NavigationBar"
- "With context Component Library, apply MediaCard grid to HomePage"

## Workflow

### Step 1: Context Extraction

1. **Read AGENTS.md** in full
2. **Parse headers** - Identify all H2 (`##`) and H3 (`###`) sections
3. **Fuzzy match** - Find the section that best matches `[Section Name]`
   - Match is case-insensitive
   - Partial matches are acceptable (e.g., "API" matches "API Patterns")
4. **Extract content** - Get all text from the matched header until the next header of the same or higher level

**Error Handling:**

If no matching section is found:

```
❌ Section "[Section Name]" not found in AGENTS.md.

Available sections:
## Project Overview
## Commands
## Code Style
## Architecture
  ### Directory Structure
  ### Content Types
  ### API Patterns
  ### Public API: Map Videos
  ### Zustand Store Usage
  ### Hooks Usage
## Design System
  ### Typography Classes
  ### Component Library
  ### Atmospheric Backgrounds
## Authentication
## Key Files
## Environment Variables

Please specify one of the above sections.
```

### Step 2: Analysis

1. **Read the target file** - Load `[File/Component]` content
2. **Understand the feature** - Parse what `[Feature]` entails
3. **Map rules to implementation** - Determine exactly how to implement the feature while following every rule from the extracted section
4. **Plan the changes** - Before editing, outline what will be modified

**Analysis Output Format:**

```
## Context Loaded: [Section Name]

Rules extracted:
- [Rule 1 from section]
- [Rule 2 from section]
- ...

## Target: [File/Component]

Planned changes:
1. [Change 1]
2. [Change 2]
...
```

### Step 3: Execution

1. **Modify the code** - Apply the planned changes
2. **Follow all extracted rules** - Every modification must comply with the section's guidelines
3. **Verify compliance** - Double-check that no rules were violated

**Required Final Output:**

After completing the modifications, you MUST include this statement:

```
✅ Applied feature using rules from section '[Section Name]'.
```

This confirms to the user which ground truth was used for the implementation.

## Example Workflow

**User request:** "With context API Patterns, apply data fetching to `src/components/UserProfile.tsx`"

**Step 1 Output:**
```
## Context Loaded: API Patterns

Rules extracted:
- Use TanStack Query hooks for data fetching (useVideo, useVideoList, etc.)
- Import from '@/api/queries'
- Destructure { data, isLoading } from hook
- Use mutation hooks for actions (from '@/api/mutations')
- Mutations include optimistic updates
- Direct client calls for non-component code only
```

**Step 2 Output:**
```
## Target: src/components/UserProfile.tsx

Current state: Component fetches user data with useEffect + useState

Planned changes:
1. Replace useEffect/useState with useUser query hook
2. Import { useUser } from '@/api/queries'
3. Destructure { data: user, isLoading }
4. Add loading state handling
```

**Step 3 Output:**
```
[Code modifications applied]

✅ Applied feature using rules from section 'API Patterns'.
```

## Constraints

- **Single source of truth** - Only use rules from the specified section
- **No assumptions** - If a rule isn't in the section, don't infer it
- **Explicit compliance** - Every change must trace back to an extracted rule
- **Ask if unclear** - If the section lacks guidance for a specific aspect, ask the user
