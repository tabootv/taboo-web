---
name: refactoring-patterns
description: "Pragmatic refactoring rules for TabooTV codebase: Extract complex logic, simplify component hierarchies, improve maintainability without changing behavior"
allowed-tools: Read, Write, Edit, Bash
version: 1.0
priority: HIGH
---

# Refactoring Patterns – TabooTV Code Simplification

> **CORE GOAL:** Make code simpler, clearer, and easier to maintain **without changing its behavior**.

---

## When to Use This Skill

**Trigger Keywords:**
- "Refactor this component"
- "Simplify this function"
- "Extract this logic"
- "This code is too complex"
- "Break down this component"
- "DRY up this code"
- "Improve maintainability"

---

## Refactoring Principles

| Principle | Application |
|-----------|-------------|
| **Extract to functions** | Repeated logic or complex blocks → separate function |
| **Extract to components** | Reusable UI patterns → new component |
| **Simplify prop drilling** | Too many props down → Context or Zustand |
| **Remove code smells** | Magic numbers → constants; long functions → short |
| **Improve naming** | Unclear names → reveal intent |
| **Reduce complexity** | Deep nesting → guard clauses; large files → modules |
| **Colocation** | Keep related code together (component + hooks) |

---

## Component Refactoring Checklist

### Before Refactoring
- [ ] Understand what the component does
- [ ] Identify what imports it (who uses it)
- [ ] Check if tests exist (refactor tests alongside)
- [ ] Plan: What's being extracted/simplified?

### During Refactoring
- [ ] Extract one thing at a time (don't do 5 things at once)
- [ ] Preserve all existing props and behavior
- [ ] Update type definitions if props change
- [ ] Keep test expectations the same

### After Refactoring
- [ ] Run `npm run type-check` (no errors)
- [ ] Run `npm run lint` (no violations)
- [ ] Run affected tests: `npm run test -- <file.test.ts>`
- [ ] Visually verify in browser (if UI changes)

---

## Common Refactoring Patterns

### Pattern 1: Extract Duplicate Logic

**Before:**
```typescript
function UserProfile() {
  const username = user?.profile?.name || 'Anonymous';
  const email = user?.profile?.email || 'No email';
  return <div>{username} / {email}</div>;
}

function UserCard() {
  const username = user?.profile?.name || 'Anonymous';
  return <span>{username}</span>;
}
```

**After:**
```typescript
// src/shared/utils/user-formatting.ts
export const getUserDisplayName = (user?: User): string =>
  user?.profile?.name || 'Anonymous';

export const getUserEmail = (user?: User): string =>
  user?.profile?.email || 'No email';

// Components use the utility
function UserProfile({ user }: Props) {
  return <div>{getUserDisplayName(user)} / {getUserEmail(user)}</div>;
}
function UserCard({ user }: Props) {
  return <span>{getUserDisplayName(user)}</span>;
}
```

### Pattern 2: Extract Custom Hooks

**Before:**
```typescript
function VideoPlayer({ videoId }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlay = () => { /* complex logic */ };
  const handlePause = () => { /* complex logic */ };
  const handleSeek = (time) => { /* complex logic */ };

  return <>{/* JSX using all this */}</>;
}
```

**After:**
```typescript
// src/features/video/hooks/useVideoPlayer.ts
export function useVideoPlayer(videoId: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlay = () => { /* complex logic */ };
  const handlePause = () => { /* complex logic */ };
  const handleSeek = (time) => { /* complex logic */ };

  return { isPlaying, currentTime, duration, handlePlay, handlePause, handleSeek };
}

// Component becomes simple
function VideoPlayer({ videoId }: Props) {
  const { isPlaying, currentTime, duration, handlePlay, handlePause, handleSeek } = 
    useVideoPlayer(videoId);
  return <>{/* Simple JSX */}</>;
}
```

### Pattern 3: Component Composition (Split Large Components)

**Before:**
```typescript
// VideoDetail.tsx (~500 lines)
function VideoDetail() {
  const video = useVideo(id);
  const comments = useComments(id);
  const [tab, setTab] = useState('comments');
  
  return (
    <div>
      {/* 300 lines of player */}
      {/* 100 lines of info panel */}
      {/* 100 lines of comments section */}
    </div>
  );
}
```

**After:**
```typescript
// src/features/video/components/video-detail.tsx (orchestrator, ~50 lines)
function VideoDetail() {
  const video = useVideo(id);
  const [tab, setTab] = useState('comments');
  
  return (
    <div className="grid gap-4">
      <VideoPlayer videoId={video.id} />
      <VideoInfo video={video} />
      {tab === 'comments' && <VideoComments videoId={video.id} />}
    </div>
  );
}

// src/features/video/components/video-player.tsx (~100 lines)
function VideoPlayer({ videoId }: Props) { /* player logic */ }

// src/features/video/components/video-info.tsx (~100 lines)
function VideoInfo({ video }: Props) { /* info panel logic */ }

// src/features/video/components/video-comments.tsx (~100 lines)
function VideoComments({ videoId }: Props) { /* comments logic */ }
```

### Pattern 4: Replace Prop Drilling with Context/Store

**Before:**
```typescript
// Props passed through 5 levels
function Page({ userId }) {
  return <Section userId={userId} />;
}
function Section({ userId }) {
  return <Card userId={userId} />;
}
function Card({ userId }) {
  return <Avatar userId={userId} />;
}
function Avatar({ userId }) {
  return <img src={`/avatars/${userId}.jpg`} />;
}
```

**After:**
```typescript
// Use Zustand store or Context
import { useAuthStore } from '@/shared/stores/auth-store';

function Page() {
  // userId comes from store, no prop drilling
  return <Section />;
}
function Section() {
  return <Card />;
}
function Card() {
  return <Avatar />;
}
function Avatar() {
  const { user } = useAuthStore();
  return <img src={`/avatars/${user.id}.jpg`} />;
}
```

### Pattern 5: Simplify Conditional Rendering

**Before:**
```typescript
function StatusBadge({ status }: Props) {
  if (status === 'active') {
    return <span className="bg-green-500">Active</span>;
  } else if (status === 'inactive') {
    return <span className="bg-gray-500">Inactive</span>;
  } else if (status === 'pending') {
    return <span className="bg-yellow-500">Pending</span>;
  } else {
    return <span className="bg-red-500">Unknown</span>;
  }
}
```

**After:**
```typescript
const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-green-500' },
  inactive: { label: 'Inactive', className: 'bg-gray-500' },
  pending: { label: 'Pending', className: 'bg-yellow-500' },
  unknown: { label: 'Unknown', className: 'bg-red-500' },
} as const;

function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
  return <span className={config.className}>{config.label}</span>;
}
```

---

## Refactoring Workflow

### Step 1: Analyze
```
Questions to ask:
- What does this code do?
- Is any logic repeated?
- How many responsibilities does it have?
- How many imports/props does it need?
```

### Step 2: Plan
```
Decide:
- Extract function, hook, or component?
- Where should it live (colocated or shared)?
- What are the inputs/outputs?
- Will tests need updates?
```

### Step 3: Extract
```
- Create new file/function
- Move logic with minimal changes
- Update types/interfaces
- Keep same behavior
```

### Step 4: Update Imports
```
- Update all references in codebase
- Use find+replace carefully
- Verify no broken imports
```

### Step 5: Verify
```
- Run type-check: npm run type-check
- Run lint: npm run lint
- Run tests: npm run test -- <file.test.ts>
- Manual test in browser (if UI-related)
```

---

## Red Flags (When NOT to Refactor)

| Flag | Why |
|------|-----|
| **Code works, tests pass** | Don't fix what isn't broken |
| **Mid-feature development** | Refactor after feature is complete |
| **Unclear requirements** | First understand what code should do |
| **Performance-critical path** | Benchmark before/after |
| **Legacy code with no tests** | Add tests first, then refactor |

---

## Naming Guidelines (After Extraction)

| Element | Convention | Example |
|---------|-----------|---------|
| **Function** | Verb + noun | `formatUserName()`, `extractVideoId()` |
| **Hook** | `use` + description | `useVideoPlayer()`, `useVideoComments()` |
| **Component** | PascalCase noun | `VideoPlayer`, `VideoComments` |
| **Utility file** | noun + action | `user-formatting.ts`, `video-utils.ts` |
| **Folder** | plural for collections | `features/video/hooks/`, `shared/utils/` |

---

## When Complete: Self-Check

- [ ] Original behavior is unchanged (tests still pass)
- [ ] New code is simpler/clearer than before
- [ ] No new files created unless truly needed
- [ ] All imports are correct
- [ ] TypeScript and ESLint pass
- [ ] New code follows TabooTV patterns
- [ ] File is not larger/more complex than before

---

## Related Skills

- **clean-code** — General coding standards
- **component-refactoring** — Advanced component complexity reduction
- **code-organization** — Feature module structure
- **testing** — Writing tests alongside refactors
