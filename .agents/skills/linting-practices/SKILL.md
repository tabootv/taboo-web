---
name: linting-practices
description: "ESLint configuration, pre-commit hooks, code quality standards, lint-staged workflow"
allowed-tools: Read, Write, Edit, Bash
version: 1.0
priority: HIGH
---

# Linting & Code Quality – TabooTV Quality Standards

> **CORE GOAL:** Maintain code quality automatically through linting, pre-commit checks, and CI/CD validation.

---

## When to Use This Skill

**Trigger Keywords:**
- "ESLint error"
- "Fix lint violations"
- "Update linting rules"
- "Pre-commit checks"
- "Code quality gate"
- "Prettier formatting"
- "Type errors in CI"

---

## Pre-Commit Workflow

### How It Works

```
User runs: git add / git commit

↓

.husky/pre-commit (runs automatically)
  └── npx lint-staged

↓

.lintstagedrc.json defines what to lint:
  ├── *.{ts,tsx} → run eslint --fix + prettier --write
  └── *.{json,css} → run prettier --write

↓

Staged files are linted & formatted

↓

If lint fails → commit is blocked
If lint passes → commit proceeds
```

### Pre-Push Checks

Before pushing, full validation runs:

```
User runs: git push

↓

.husky/pre-push (runs automatically)

↓

1. Type-check: npm run type-check
2. Lint all files: npm run lint
3. Format check: npm run format:check

↓

If any fails → push is blocked
If all pass → push proceeds
```

---

## ESLint Configuration

### Current Rules

```javascript
// eslint.config.mjs
defineConfig([
  ...nextVitals,           // Next.js core web vitals
  ...nextTs,               // TypeScript rules
  {
    rules: {
      // TypeScript - balanced strictness
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // React - Next.js optimized
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-html-link-for-pages': 'error',
      
      // Relaxed for development
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
])
```

### Running Linting

```bash
# Check for lint violations (warnings + errors)
npm run lint

# Auto-fix violations
npm run lint:fix

# Check specific file
npm run lint -- src/features/video/components/video-card.tsx

# Show detailed output
npm run lint -- --format=verbose
```

---

## Prettier Configuration

### Current Setup

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

### Running Prettier

```bash
# Format all files
npm run format

# Check formatting (don't modify)
npm run format:check

# Format specific file
npx prettier --write src/features/video/components/video-card.tsx

# Format entire folder
npx prettier --write src/features/video/
```

---

## TypeScript Type Checking

### Current Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "lib": ["dom", "dom.iterable", "esnext"],
    "moduleResolution": "bundler"
  }
}
```

### Running Type Check

```bash
# Check entire project
npm run type-check

# With clean build (removes cache)
npm run type-check:clean

# Watch mode (check on file change)
npm run type-check -- --watch

# Generate detailed report
npm run type-check -- --listFiles
```

---

## Lint-Staged Configuration

### Current Setup

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css}": ["prettier --write"]
}
```

### How It Works

1. **Stage files** with `git add`
2. **Commit** with `git commit`
3. **Hook triggers** `.husky/pre-commit`
4. **Lint-staged runs** eslint + prettier on staged files only
5. **If successful** → commit proceeds
6. **If failed** → commit blocked, fix and retry

### Example Workflow

```bash
# Edit files
vim src/features/video/components/video-card.tsx

# Stage changes
git add src/features/video/components/video-card.tsx

# Commit (pre-commit hook runs automatically)
git commit -m "refactor: simplify video card component"

# Hook runs:
# - eslint --fix (auto-fixes violations)
# - prettier --write (auto-formats code)
# - If files changed, they're re-staged
# - Commit proceeds with formatted code

# Result: clean, formatted commit
```

---

## Common Lint Errors & Fixes

### Error: "no-unused-vars"

```typescript
// ❌ Unused parameter
function handleClick(event, data) {
  console.log(data); // event is unused
}

// ✅ Fix 1: Remove unused param
function handleClick(data) {
  console.log(data);
}

// ✅ Fix 2: Prefix with underscore
function handleClick(_event, data) {
  console.log(data);
}

// ✅ Fix 3: Use it
function handleClick(event, data) {
  event.preventDefault();
  console.log(data);
}
```

### Error: "@typescript-eslint/no-explicit-any"

```typescript
// ❌ Using any
function process(data: any): any {
  return data.value;
}

// ✅ Use unknown instead
function process(data: unknown): unknown {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return data.value;
  }
}

// ✅ Or type it properly
interface Data {
  value: string;
}
function process(data: Data): string {
  return data.value;
}
```

### Error: "react-hooks/exhaustive-deps"

```typescript
// ❌ Missing dependency
useEffect(() => {
  console.log(videoId); // videoId used but not in deps
}, []);

// ✅ Include dependency
useEffect(() => {
  console.log(videoId);
}, [videoId]);

// ✅ Or use useCallback
const handleClick = useCallback(() => {
  console.log(videoId);
}, [videoId]);
```

---

## CI/CD Validation

### GitHub Actions Workflow

```yaml
name: Lint & Type Check

on: [push, pull_request]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run format:check
```

### Checks Performed

| Check | Command | Fails If |
|-------|---------|----------|
| **TypeScript** | `npm run type-check` | Type errors exist |
| **Linting** | `npm run lint` | Violations found |
| **Formatting** | `npm run format:check` | Code not formatted |

---

## Best Practices

### Before Committing

```bash
# Run pre-push checks locally (before pushing)
npm run type-check
npm run lint
npm run format:check

# Or just let husky handle it
git push  # .husky/pre-push runs these
```

### For New Team Members

```bash
# Install husky hooks
npm install

# Hooks are ready automatically
git commit -m "feat: my feature"  # pre-commit hook runs
git push                           # pre-push hook runs
```

### Disabling Pre-Commit Temporarily

```bash
# ⚠️ Only for emergency fixes
git commit -m "hotfix: urgent" --no-verify

# ⚠️ This skips linting - use sparingly!
```

---

## Monitoring & Reports

### Test Coverage Targets

```
Lines:       70%
Branches:    60%
Functions:   70%
Statements:  70%
```

### Bundle Size Targets

```
Main bundle:  < 500KB (gzipped)
Chunks:       < 200KB each
CSS:          < 100KB
```

### Performance Targets

```
FCP:  < 1.5s (First Contentful Paint)
LCP:  < 2.5s (Largest Contentful Paint)
CLS:  < 0.1  (Cumulative Layout Shift)
```

---

## Troubleshooting

### "Hook failed"

```bash
# Pre-commit hook failed
# Check output for error

# Common causes:
# - Syntax errors
# - TypeScript errors
# - Lint violations

# Fix the error and retry
npm run lint:fix  # Auto-fix lint errors
npm run format    # Auto-format code
git add .         # Re-stage fixed files
git commit ...    # Retry commit
```

### "Husky not running"

```bash
# Verify husky is installed
npx husky install

# Verify hooks exist
ls -la .husky/pre-commit .husky/pre-push

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### "Prettier conflict with ESLint"

```bash
# Both tools try to format
# Solution: ESLint only checks, Prettier formats

# Run both (in order)
npm run lint:fix  # ESLint auto-fixes
npm run format    # Prettier formats

# Commit result
git add .
git commit ...
```

---

## When Complete: Self-Check

- [ ] Code passes: `npm run type-check`
- [ ] Code passes: `npm run lint`
- [ ] Code passes: `npm run format:check`
- [ ] Pre-commit hook runs before commit
- [ ] Pre-push hook runs before push
- [ ] No `any` types (use `unknown`)
- [ ] No unused variables
- [ ] Prettier formatting applied

---

## Related Skills

- **clean-code** — General code quality
- **typescript-patterns** — Type safety
- **testing** — Test quality
