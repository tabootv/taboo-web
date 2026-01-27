---
name: transmute-external-pattern
description: Ingest, translate, and integrate features from external repositories (any framework) into React/Next.js 15 with strict architectural alignment
triggers:
  - transmute external pattern
  - translate external feature
  - port feature from external repo
  - integrate external code
  - cross-framework migration
  - external pattern integration
---

# Transmute External Pattern

Ingest, translate, and integrate features from external repositories (Vue, Svelte, Angular, Vanilla JS, etc.) into React/Next.js 15 code that adheres to TabooTV's architectural standards. This skill builds upon `integrate-branch-feature` but focuses on cross-framework translation with a "transmutation" layer that converts foreign framework patterns to React/Next.js equivalents.

---

## Input Parameters

1. **external_repo_path**: Local path to external repository (or sparse-checkout)
2. **target_feature_intent**: Clear description of what to extract/replicate

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
| **Types** | DTO in API client, Domain in types/ | `src/api/client/`, `src/types/` |
| **Type Adapters** | DTO → Domain conversion functions | Colocated with API client |

---

## Execution Protocol

### Phase 1: Discovery & Analysis

**Step 1.1: Repository Structure Analysis**

```bash
# Detect framework from package.json
cd [external_repo_path]
cat package.json | grep -E "(vue|svelte|angular|react)" | head -5

# Identify entry points
find . -name "main.*" -o -name "index.*" -o -name "App.*" | grep -v node_modules | head -10

# Map component structure
find . -type f \( -name "*.vue" -o -name "*.svelte" -o -name "*.tsx" -o -name "*.jsx" \) | grep -v node_modules
```

Analyze the source repository for:
- Framework/language detection (Vue, Svelte, Angular, Vanilla JS, etc.)
- Entry points and feature boundaries
- File structure and component hierarchy
- Configuration files (package.json, tsconfig, etc.)

**Step 1.2: Feature Extraction**

Locate files matching `target_feature_intent`:

```bash
# Search for feature-related files
find . -type f \( -iname "*[feature-keyword]*" -o -path "*/[feature-keyword]/*" \) | grep -v node_modules

# Identify dependencies
grep -r "import\|require" [feature-files] | head -20
```

Extract:
- Dependencies and imports
- State management patterns
- Lifecycle hooks and computed properties
- Styling approach (CSS modules, Tailwind, styled-components, etc.)

**Step 1.3: Logic Audit**

Trace the feature's logic:
- Data flow (props → state → effects → render)
- Side effects and async operations
- Event handlers and user interactions
- API calls and data fetching patterns
- Business logic and validation rules

---

### Phase 2: Cross-Framework Translation Map

#### Vue → React/Next.js

| Vue Pattern | React/Next.js Equivalent | Notes |
|-------------|------------------------|-------|
| `ref()` / `reactive()` | `useState()` / `useReducer()` | State management |
| `computed()` | `useMemo()` | Derived state |
| `watch()` / `watchEffect()` | `useEffect()` | Side effects |
| `onMounted()` | `useEffect(() => {}, [])` | Mount lifecycle |
| `onUnmounted()` | `useEffect(() => cleanup, [])` | Cleanup |
| `v-if` | Conditional rendering `{condition && <Component />}` | Conditional |
| `v-for` | `.map()` with keys | Lists |
| `v-model` | Controlled inputs with `value` + `onChange` | Two-way binding |
| `props` | Props interface | Type definitions |
| `emit()` | Callback props | Event communication |
| `provide/inject` | React Context | Dependency injection |
| `<template>` | JSX fragments | Template syntax |
| `defineComponent()` | Function components | Component definition |
| Vuex/Pinia | Zustand (client) or TanStack Query (server) | State management |
| `<script setup>` | Function component with hooks | Composition API |

**Example Translation:**

```vue
<!-- Vue Source -->
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

onMounted(() => {
  console.log('Mounted')
})
</script>

<template>
  <div v-if="count > 0">
    <p v-for="i in doubled" :key="i">{{ i }}</p>
  </div>
</template>
```

```tsx
// React/Next.js Target
'use client'

import { useState, useMemo, useEffect } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  const doubled = useMemo(() => count * 2, [count])

  useEffect(() => {
    console.log('Mounted')
  }, [])

  if (count <= 0) return null

  return (
    <div>
      {Array.from({ length: doubled }, (_, i) => (
        <p key={i}>{i + 1}</p>
      ))}
    </div>
  )
}
```

#### Svelte → React/Next.js

| Svelte Pattern | React/Next.js Equivalent | Notes |
|----------------|------------------------|-------|
| `$:` reactive statements | `useMemo()` or `useEffect()` | Reactive declarations |
| `{#if}` blocks | Conditional rendering | Conditionals |
| `{#each}` blocks | `.map()` | Lists |
| `bind:value` | Controlled inputs | Two-way binding |
| `on:click` | `onClick` handlers | Events |
| `$store` | Zustand store or Context | Stores |
| `onMount()` | `useEffect(() => {}, [])` | Lifecycle |
| `<script context="module">` | Module-level code | Top-level logic |

**Example Translation:**

```svelte
<!-- Svelte Source -->
<script>
  import { onMount } from 'svelte'
  let count = 0
  $: doubled = count * 2

  onMount(() => {
    console.log('Mounted')
  })
</script>

{#if count > 0}
  {#each Array(doubled) as _, i}
    <p>{i + 1}</p>
  {/each}
{/if}
```

```tsx
// React/Next.js Target
'use client'

import { useState, useMemo, useEffect } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  const doubled = useMemo(() => count * 2, [count])

  useEffect(() => {
    console.log('Mounted')
  }, [])

  if (count <= 0) return null

  return (
    <>
      {Array.from({ length: doubled }, (_, i) => (
        <p key={i}>{i + 1}</p>
      ))}
    </>
  )
}
```

#### Angular → React/Next.js

| Angular Pattern | React/Next.js Equivalent | Notes |
|-----------------|------------------------|-------|
| `@Component()` | Function component | Component definition |
| `@Input()` | Props interface | Inputs |
| `@Output()` | Callback props | Outputs |
| `@Injectable()` | Custom hooks or Zustand | Services |
| `ngOnInit()` | `useEffect(() => {}, [])` | Initialization |
| `ngOnDestroy()` | `useEffect(() => cleanup, [])` | Cleanup |
| `*ngIf` | Conditional rendering | Conditionals |
| `*ngFor` | `.map()` | Lists |
| `[(ngModel)]` | Controlled inputs | Two-way binding |
| RxJS Observables | TanStack Query or `useEffect` | Async data |
| Dependency Injection | Props or Context | DI |

#### Vanilla JS → React/Next.js

| Vanilla Pattern | React/Next.js Equivalent | Notes |
|----------------|------------------------|-------|
| DOM manipulation | JSX and refs | Rendering |
| `addEventListener` | Event handlers | Events |
| `fetch()` | TanStack Query hooks | Data fetching |
| Module pattern | ES modules | Code organization |
| Class-based | Function components | Components |

---

### Phase 3: Strategy Document Generation

**CRITICAL:** Generate Strategy Document BEFORE any code implementation.

**Location:** `temp/transmutation-strategy/[feature-name].md`

**Template Structure:**

```markdown
# Transmutation Strategy: [Feature Name]

**Generated:** [timestamp]
**Source Repository:** [external_repo_path]
**Target Feature Intent:** [description]
**Source Framework:** [Vue/Svelte/Angular/Vanilla JS]

## Logic Audit

### Original Implementation
- **Files Analyzed:** [list]
- **Core Logic:** [description]
- **Data Flow:** [diagram/description]
- **State Management:** [pattern used]
- **Side Effects:** [list]
- **API Integration:** [endpoints, methods]

### Component Structure
[Tree diagram of component hierarchy]

### Dependencies
- **External Libraries:** [list]
- **Internal Modules:** [list]
- **Styling:** [approach]

## Gap Analysis

### Missing Dependencies
- [ ] Library X not in package.json
- [ ] API client pattern differs
- [ ] Type definitions needed

### Incompatibilities
- [ ] Framework-specific patterns (e.g., Vue directives)
- [ ] State management approach differs
- [ ] Routing structure incompatible
- [ ] Styling system mismatch

### Architectural Gaps
- [ ] No colocation strategy in source
- [ ] Barrel file imports present
- [ ] Server/Client boundary unclear
- [ ] Type adapters needed (DTO → Domain)

## Transformation Map

### Step 1: Type System Translation
**Source Types:** [location]
**Target Types:**
- DTO: `src/api/client/[domain].client.ts`
- Domain: `src/types/[domain].ts`
- Adapter: `src/api/client/[domain].client.ts` (adapter function)

**Type Adapter Pattern:**

```typescript
// DTO (API Response)
export interface NotificationDto {
  id: number
  user_id: number
  message: string
  created_at: string
  read_at: string | null
}

// Domain Type
export interface Notification {
  id: number
  userId: number
  message: string
  createdAt: Date
  readAt: Date | null
}

// Adapter Function
export function adaptNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    userId: dto.user_id,
    message: dto.message,
    createdAt: new Date(dto.created_at),
    readAt: dto.read_at ? new Date(dto.read_at) : null,
  }
}
```

### Step 2: State Management Migration
**Source:** [pattern]
**Target:**
- Server State: TanStack Query (`src/api/queries/`)
- Client State: Zustand (`src/shared/stores/`)
- Component State: `useState` / `useReducer`

### Step 3: Component Structure
**Source:** [structure]
**Target:**
- Route-specific: `app/(main)/[route]/_components/`
- Feature-specific: `features/[feature]/components/`
- Shared: `components/[domain]/`

### Step 4: API Integration
**Source:** [fetch/axios pattern]
**Target:**
- Client: `src/api/client/[domain].client.ts`
- Query Hook: `src/api/queries/[domain].queries.ts`
- Mutation Hook: `src/api/mutations/[domain].mutations.ts`

### Step 5: Server Actions (if mutations)
**Target:** `app/[route]/_actions.ts`

### Step 6: Styling Translation
**Source:** [CSS modules/Tailwind/styled-components]
**Target:** Tailwind CSS with design tokens (`@/shared/lib/design-tokens.ts`)

## Implementation Plan

### Epic 1: Core Type System
- [ ] Extract and translate types
- [ ] Create DTO interfaces
- [ ] Create domain types
- [ ] Build type adapters

### Epic 2: API Layer
- [ ] Create API client
- [ ] Build query hooks
- [ ] Build mutation hooks (if needed)
- [ ] Add query keys

### Epic 3: Component Migration
- [ ] Translate component logic
- [ ] Apply colocation rules
- [ ] Split Server/Client components
- [ ] Convert styling to Tailwind

### Epic 4: State Management
- [ ] Migrate to Zustand (if client state)
- [ ] Migrate to TanStack Query (if server state)
- [ ] Remove framework-specific state

### Epic 5: Integration & Validation
- [ ] Fix imports (direct, no barrels)
- [ ] Apply architectural standards
- [ ] Run type-check
- [ ] Run lint
- [ ] Build validation

## Sub-Skills to Invoke

1. **vercel-react-best-practices** - Performance patterns, bundle optimization
2. **component-refactoring** - Complexity reduction, hook extraction
3. **clean-code** - Naming, SRP, DRY
4. **sync-project-docs** - Update ARCHITECTURE.md

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Type mismatches | HIGH | Create comprehensive adapters |
| State management complexity | MEDIUM | Incremental migration |
| Styling differences | LOW | Manual Tailwind conversion |
| Performance regressions | MEDIUM | Benchmark before/after |
```

---

### Phase 4: Execution Protocol

**Step 4.1: Type System Setup**

1. Extract types from source code
2. Create DTO interfaces in API client files (`src/api/client/[domain].client.ts`)
3. Create domain types in `src/types/[domain].ts`
4. Build adapter functions (DTO → Domain) in the API client file

**Type Adapter Example:**

```typescript
// src/api/client/notification.client.ts
export interface NotificationDto {
  id: number
  user_id: number
  message: string
  created_at: string
  read_at: string | null
}

export interface Notification {
  id: number
  userId: number
  message: string
  createdAt: Date
  readAt: Date | null
}

export function adaptNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    userId: dto.user_id,
    message: dto.message,
    createdAt: new Date(dto.created_at),
    readAt: dto.read_at ? new Date(dto.read_at) : null,
  }
}
```

**Step 4.2: API Layer Creation**

1. Create API client following existing patterns in `src/api/client/`
2. Build TanStack Query hooks in `src/api/queries/`
3. Add query keys to `src/api/query-keys.ts`
4. Handle errors and loading states

**Step 4.3: Component Translation**

1. Convert framework syntax to JSX
2. Translate lifecycle hooks to React hooks:
   - `onMounted` → `useEffect(() => {}, [])`
   - `onUnmounted` → `useEffect(() => cleanup, [])`
   - `computed` → `useMemo`
   - `watch` → `useEffect`
3. Convert directives to standard JavaScript:
   - `v-if` / `*ngIf` → `{condition && <Component />}`
   - `v-for` / `*ngFor` → `.map()`
   - `v-model` / `[(ngModel)]` → Controlled inputs
4. Apply colocation rules (`_components/` folders)

**Step 4.4: State Management Migration**

- **Server state** → TanStack Query (`src/api/queries/`)
- **Client state** → Zustand (`src/shared/stores/`) if complex, or `useState` if simple
- Remove framework-specific state management (Vuex, Pinia, Svelte stores, etc.)

**Step 4.5: Styling Conversion**

1. Extract CSS/styling from source
2. Convert to Tailwind classes
3. Use design tokens for colors/spacing (`@/shared/lib/design-tokens.ts`)
4. Remove framework-specific styling

**Step 4.6: Architectural Enforcement**

1. Invoke `vercel-react-best-practices` for barrel file elimination
2. Invoke `component-refactoring` if complexity > 50
3. Invoke `clean-code` for naming and structure
4. Ensure direct imports only (no barrel files)
5. Verify Server/Client component split

**Sub-Skill Orchestration Order:**

| Order | Skill | Purpose | Trigger Condition |
|-------|-------|---------|-------------------|
| 1 | `vercel-react-best-practices` | Enforce colocation, Server-First, no barrels | Always |
| 2 | `component-refactoring` | Reduce complexity, extract hooks | Complexity > 50 OR lineCount > 300 |
| 3 | `clean-code` | Naming, SRP, DRY, KISS | Always |
| 4 | `sync-project-docs` | Update /docs with new feature | If feature adds patterns |

**Step 4.7: Validation**

After each epic, run validation:

```bash
# Type check
pnpm type-check

# Lint check
pnpm lint

# Build check
pnpm build
```

**If validation fails:**
- DO NOT proceed to next epic
- Fix the issue in current epic
- Re-run validation
- Update Strategy Document with fix notes

---

### Phase 5: Documentation Sync

**Step 5.1: Update Architecture Docs**

- Invoke `sync-project-docs` to update `docs/ARCHITECTURE.md` (if it exists) or `docs/PROJECT_CONTEXT.md`
- Document new patterns if introduced
- Update `AGENTS.md` if new conventions established

**Step 5.2: Generate Integration Summary**

Create summary in `temp/transmutation-strategy/[feature-name]-complete.md`:

```markdown
# Transmutation Complete: [Feature Name]

**Completed:** [timestamp]
**Source Framework:** [framework]
**Files Created:** [list]
**Files Modified:** [list]

## Translation Summary

| Original Pattern | Translated To | Location |
|-----------------|---------------|----------|
| Vue ref() | useState() | [file] |
| Vue computed() | useMemo() | [file] |
| Vuex store | Zustand store | [file] |

## Architectural Compliance

- ✅ Direct imports (no barrels)
- ✅ Component colocation
- ✅ Server/Client split
- ✅ Type adapters (DTO → Domain)
- ✅ TanStack Query for server state
- ✅ Design tokens for styling

## Validation Results

- Type Check: ✅ Pass
- Lint: ✅ Pass
- Build: ✅ Pass
```

---

## Framework Detection Logic

**Detection Patterns:**

```bash
# Vue Detection
if [ -f "package.json" ] && grep -q "vue" package.json; then
  FRAMEWORK="vue"
fi

# Svelte Detection
if [ -f "package.json" ] && grep -q "svelte" package.json; then
  FRAMEWORK="svelte"
fi

# Angular Detection
if [ -f "angular.json" ] || [ -f "package.json" ] && grep -q "@angular/core" package.json; then
  FRAMEWORK="angular"
fi

# React Detection (might be source repo)
if [ -f "package.json" ] && grep -q "react" package.json && ! grep -q "next" package.json; then
  FRAMEWORK="react"
fi

# Vanilla JS (fallback)
if [ -z "$FRAMEWORK" ]; then
  FRAMEWORK="vanilla"
fi
```

**File Pattern Detection:**

- **Vue:** `*.vue` files, `vue.config.js`
- **Svelte:** `*.svelte` files, `svelte.config.js`
- **Angular:** `*.component.ts`, `angular.json`
- **React:** `*.tsx`, `*.jsx` (but check if Next.js)
- **Vanilla:** No framework-specific files

---

## Key Files to Reference

- **Architecture Standards:** `.claude/refactor/00-context.md`
- **Type Patterns:** `src/types/` (domain types), `src/api/client/` (DTOs)
- **Component Patterns:** `app/(main)/[route]/_components/`
- **API Patterns:** `src/api/queries/`, `src/api/mutations/`
- **Design Tokens:** `src/shared/lib/design-tokens.ts`
- **Query Keys:** `src/api/query-keys.ts`

---

## Constraints

1. **Never skip Strategy Document** - Must generate before implementation
2. **Always enforce architectural standards** - No exceptions for external code
3. **Type safety first** - Create adapters for all external types
4. **Server-first approach** - Default to Server Components
5. **No framework-specific code** - Complete translation required
6. **Direct imports only** - No barrel file imports
7. **Colocation required** - Route-specific components in `_components/`

---

## Error Handling

### Framework Detection Fails

- Fall back to manual analysis
- Ask user to specify framework
- Proceed with generic translation patterns

### Type Mismatches

- Create comprehensive adapter layer
- Document type differences in Strategy Document
- Use `unknown` types with runtime validation if needed
- Create type guards for runtime safety

### Incompatible Patterns

- Document in Gap Analysis section of Strategy Document
- Propose alternative implementation following TabooTV patterns
- Request user approval for architectural decisions

### Build Failures

- DO NOT continue to next epic
- Fix issues in current epic
- Re-run validation
- Update Strategy Document with resolution

---

## Example Workflow

**User:** "Transmute the notification system from this Vue repo at `/path/to/vue-notifications`"

**AI Response:**

```
## Transmutation: Vue Notification System

### Phase 1: Discovery
✅ Detected Vue 3 with Composition API
✅ Found notification components in `src/components/notifications/`
✅ Using Pinia for state management
✅ Using Vue Router for navigation

### Phase 2: Analysis
- Core Logic: Real-time notifications with WebSocket
- State: Pinia store with reactive notifications array
- Components: NotificationList, NotificationItem, NotificationBadge

### Phase 3: Strategy Document Generated
📄 `temp/transmutation-strategy/notifications.md`

**Key Transformations:**
- Pinia store → Zustand store (`src/shared/stores/notifications-store.ts`)
- Vue components → React Server/Client components
- Vue Router → Next.js App Router
- WebSocket → Laravel Reverb integration
- Vue `ref()` → React `useState()`
- Vue `computed()` → React `useMemo()`

**Ready to proceed with implementation?**
```

---

## Related Skills

- `integrate-branch-feature` - Similar workflow for internal branches
- `vercel-react-best-practices` - Performance optimization
- `component-refactoring` - Complexity reduction
- `clean-code` - Code quality
- `sync-project-docs` - Documentation updates
- `absorb-external-doc` - Documentation integration

---

## Quick Reference Tables

### Framework Detection Patterns

| Framework | Package.json Key | File Extensions | Config Files |
|-----------|-----------------|-----------------|--------------|
| Vue | `"vue"` | `.vue` | `vue.config.js` |
| Svelte | `"svelte"` | `.svelte` | `svelte.config.js` |
| Angular | `"@angular/core"` | `.component.ts` | `angular.json` |
| React | `"react"` | `.tsx`, `.jsx` | `next.config.ts` |
| Vanilla | None | `.js`, `.ts` | None |

### Translation Priority

| Pattern | Priority | Complexity |
|---------|----------|------------|
| State Management | HIGH | Medium |
| Lifecycle Hooks | HIGH | Low |
| Directives | MEDIUM | Low |
| Computed Properties | MEDIUM | Low |
| Styling | LOW | High |
| Type System | HIGH | Medium |

---

## Notes

- This skill requires access to the external repository path
- Strategy Document generation is mandatory before code implementation
- All translations must pass through architectural filters
- Type adapters are required for all external API types
- Server Components are the default; use Client Components only when necessary
