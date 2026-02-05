---
name: sonar-scan
description: Run SonarJS analysis and fix code quality issues
triggers:
  - sonar
  - sonar-scan
  - complexity
  - cognitive complexity
  - lint-deep
  - code quality scan
---

# SonarJS Code Quality Scanner

This skill runs SonarJS analysis to detect and fix code quality issues, with a focus on:

- **Cognitive Complexity** violations (threshold: 15)
- **Null safety** (`null-dereference`, `no-redundant-optional`)
- **Code smell detection** (duplicate strings, nested conditionals, identical functions, etc.)
- **Nested ternary cleanup** (`no-nested-conditional`)

## Usage

```
/sonar-scan                           # Scan entire src/ directory
/sonar-scan src/components/           # Scan specific directory
/sonar-scan src/hooks/use-upload.ts   # Scan specific file
/sonar-scan --staged                  # Scan only staged files
```

## Workflow

### Step 1: Run the Scanner

Execute the scanner script to generate the report:

```bash
node scripts/sonar-scan.mjs [target]
```

The script outputs:
- **JSON report**: Full ESLint output at `/private/tmp/claude/.../scratchpad/sonar-report.json`
- **Markdown summary**: Human-readable at `/private/tmp/claude/.../scratchpad/sonar-summary.md`

### Step 2: Read and Analyze the Report

Read the summary file to understand the findings:

```bash
cat /private/tmp/claude/.../scratchpad/sonar-summary.md
```

Or read the full JSON for programmatic analysis:

```bash
cat /private/tmp/claude/.../scratchpad/sonar-report.json
```

### Step 3: Prioritize Fixes

Apply fixes in this priority order:

1. **Safe Auto-Fixes** (apply immediately without asking):
   - `sonarjs/prefer-immediate-return` - Return directly instead of assigning to variable
   - `sonarjs/prefer-single-boolean-return` - Simplify boolean returns
   - `sonarjs/no-redundant-jump` - Remove unnecessary continue/return
   - `sonarjs/no-collapsible-if` - Merge nested if statements
   - Unused `eslint-disable` directives - Remove stale disable comments

2. **Medium Refactors** (explain briefly, then apply):
   - `sonarjs/no-nested-conditional` - Extract nested ternaries to variables or functions
   - `sonarjs/no-redundant-optional` - Remove unnecessary optional chaining

3. **Complex Refactors** (show plan and ask for confirmation):
   - `sonarjs/cognitive-complexity` - Requires function decomposition
   - `sonarjs/no-identical-functions` - Requires extraction to shared utility
   - `sonarjs/no-duplicate-string` - Requires constant extraction
   - `sonarjs/no-nested-functions` - Requires function extraction

### Step 4: Apply Fixes

For **safe fixes**, run ESLint with auto-fix:

```bash
npx eslint --config eslint.sonar.config.mjs --fix [file]
```

For **complex refactors**, propose a refactoring plan before making changes.

### Step 5: Verify Fixes

Re-run the scanner to confirm all issues are resolved:

```bash
node scripts/sonar-scan.mjs [target]
```

---

## Contextual Awareness & Interoperability

### Skill Synergy

This skill must be used in conjunction with `@skills/vercel-react-best-practices`.

### Conflict Resolution

If a SonarJS refactoring suggestion conflicts with a Next.js/React best practice, **React Best Practices take precedence**:

| SonarJS Suggestion | React Constraint | Resolution |
|-------------------|------------------|------------|
| Extract nested logic to reduce complexity | Breaks Rule of Hooks | Keep hooks at component top-level; extract non-hook logic only |
| Move conditional logic to separate function | Server Component constraints | Ensure extracted function is compatible with RSC |
| Simplify nested conditionals | Hydration safety | Preserve hydration-safe patterns |
| Extract repeated JSX | Component boundaries | Don't introduce unnecessary client boundaries |

### Unified Goal

Achieve a Cognitive Complexity score of **< 15** without sacrificing the architectural integrity defined by Next.js/React standards.

### Verification Checklist

When proposing a fix for a Sonar violation, verify:

- [ ] Hooks remain at component top-level (not inside conditionals or loops)
- [ ] Server Components don't use client-only APIs after refactor
- [ ] Hydration-safe patterns are preserved
- [ ] No unnecessary `'use client'` boundaries introduced
- [ ] TanStack Query patterns remain intact
- [ ] Error boundaries and Suspense boundaries are respected

---

## Cognitive Complexity Refactoring Patterns

### Pattern 1: Extract Early Returns

**Before (Complexity: 8)**:
```typescript
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        return doSomething(user);
      } else {
        return handleNoPermission();
      }
    } else {
      return handleInactive();
    }
  } else {
    return handleNoUser();
  }
}
```

**After (Complexity: 4)**:
```typescript
function processUser(user: User | null) {
  if (!user) return handleNoUser();
  if (!user.isActive) return handleInactive();
  if (!user.hasPermission) return handleNoPermission();
  return doSomething(user);
}
```

### Pattern 2: Extract Complex Conditions

**Before**:
```typescript
if (user && user.roles && user.roles.includes('admin') && !user.suspended) {
  // ...
}
```

**After**:
```typescript
const isActiveAdmin = user?.roles?.includes('admin') && !user?.suspended;
if (isActiveAdmin) {
  // ...
}
```

### Pattern 3: Extract Switch-Heavy Logic to Maps

**Before (Complexity: 12)**:
```typescript
function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'yellow';
    case 'approved': return 'green';
    case 'rejected': return 'red';
    case 'review': return 'blue';
    default: return 'gray';
  }
}
```

**After (Complexity: 1)**:
```typescript
const STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  review: 'blue',
};

function getStatusColor(status: string) {
  return STATUS_COLORS[status] ?? 'gray';
}
```

### Pattern 4: Fix Nested Ternaries

**Before**:
```typescript
const label = isLoading ? 'Loading...' : hasError ? 'Error' : data ? data.name : 'Unknown';
```

**After (Option A - Variables)**:
```typescript
const getLabel = () => {
  if (isLoading) return 'Loading...';
  if (hasError) return 'Error';
  return data?.name ?? 'Unknown';
};
const label = getLabel();
```

**After (Option B - Early conditions)**:
```typescript
// If used in JSX, extract to computed variable
const errorLabel = hasError ? 'Error' : null;
const loadingLabel = isLoading ? 'Loading...' : null;
const label = loadingLabel ?? errorLabel ?? data?.name ?? 'Unknown';
```

### Pattern 5: Extract Helper Functions (React-Safe)

**Before**:
```typescript
function UserDashboard({ userId }: Props) {
  const { data: user } = useUser(userId);

  // Complex rendering logic inside component
  let content;
  if (user?.isAdmin) {
    if (user.department === 'engineering') {
      content = <EngineeringAdminView />;
    } else {
      content = <GenericAdminView />;
    }
  } else if (user?.isManager) {
    content = <ManagerView />;
  } else {
    content = <EmployeeView />;
  }

  return <div>{content}</div>;
}
```

**After**:
```typescript
// Extract non-hook logic to pure function
function getUserContent(user: User | undefined) {
  if (user?.isAdmin) {
    return user.department === 'engineering'
      ? <EngineeringAdminView />
      : <GenericAdminView />;
  }
  if (user?.isManager) return <ManagerView />;
  return <EmployeeView />;
}

function UserDashboard({ userId }: Props) {
  const { data: user } = useUser(userId);
  return <div>{getUserContent(user)}</div>;
}
```

---

## Configuration Reference

### ESLint Sonar Config (`eslint.sonar.config.mjs`)

```javascript
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import sonarjs from 'eslint-plugin-sonarjs';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  sonarjs.configs.recommended,
  {
    rules: {
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-nested-conditional': 'error',
      'sonarjs/null-dereference': 'error',
      // ... other rules
    }
  }
]);
```

### Threshold Reference

| Rule | Threshold | Rationale |
|------|-----------|-----------|
| `cognitive-complexity` | 15 | Matches SonarLint IDE default |
| `no-duplicate-string` | 3 | Allow 2 duplicates before extraction |

---

## Troubleshooting

### "No files matching the pattern"

Ensure the target path exists and contains `.ts`, `.tsx`, `.js`, or `.jsx` files.

### "Cannot find module 'eslint-plugin-sonarjs'"

Run `npm install -D eslint-plugin-sonarjs` to install the dependency.

### High complexity but unclear how to refactor

1. Identify the deepest nesting level
2. Extract early returns to flatten structure
3. Extract pure helper functions (not hooks)
4. Consider if the function is doing too much (Single Responsibility)
