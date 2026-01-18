---
name: add-feature-flag
description: Add feature flags to toggle features during development
triggers:
  - add feature flag
  - toggle feature
  - feature gate
  - disable feature
  - enable feature
---

# Add Feature Flag

This skill guides adding and using feature flags to enable/disable features during development.

## When to Use Feature Flags

- Features with incomplete backend implementation
- Experimental features being tested
- Features pending design approval
- Features blocked by external dependencies

## Usage

### In Client Components

```tsx
import { useFeature } from '@/hooks/use-feature';
import { Feature } from '@/components/feature';

function MyComponent() {
  // Method 1: Using the hook
  const myFeatureEnabled = useFeature('MY_FEATURE');

  return <div>{myFeatureEnabled && <NewFeature />}</div>;
}

function MyOtherComponent() {
  // Method 2: Using the wrapper component
  return (
    <div>
      <Feature name="MY_FEATURE">
        <NewFeature />
      </Feature>
    </div>
  );
}
```

### In Server Components

```tsx
import { isFeatureEnabled } from '@/shared/lib/config/feature-flags';

export default async function Page() {
  const myFeatureEnabled = isFeatureEnabled('MY_FEATURE');

  return <div>{myFeatureEnabled && <NewFeature />}</div>;
}
```

### Guarding Mutations/API Calls

```tsx
import { useFeature } from '@/hooks/use-feature';
import { useMyMutation } from '@/api/mutations';

function FeatureButton() {
  const featureEnabled = useFeature('MY_FEATURE');
  const mutation = useMyMutation();

  const handleClick = () => {
    if (!featureEnabled) return;  // Don't call if disabled
    mutation.mutate(data);
  };

  if (!featureEnabled) return null;  // Hide button entirely

  return <button onClick={handleClick}>Action</button>;
}
```

## Adding a New Feature Flag

### Step 1: Add to Config

Edit `src/shared/lib/config/feature-flags.ts`:

```typescript
export const FEATURES = {
  // ... existing features

  MY_NEW_FEATURE: {
    enabled: process.env.NEXT_PUBLIC_FEATURE_MY_NEW_FEATURE === 'true',
    name: 'My New Feature',
    description: 'What this feature does',
    impacts: ['Component A', 'Component B', 'API endpoint X'],
    reason: 'Why it is disabled (e.g., backend not ready)',
  },
};
```

### Step 2: Add Environment Variable

Add to `.env.local.example`:

```bash
NEXT_PUBLIC_FEATURE_MY_NEW_FEATURE=false
```

Add to `.env.local`:

```bash
NEXT_PUBLIC_FEATURE_MY_NEW_FEATURE=false
```

### Step 3: Use in Code

```tsx
const featureEnabled = useFeature('MY_NEW_FEATURE');

// or

<Feature name="MY_NEW_FEATURE">
  <MyNewFeatureComponent />
</Feature>
```

## Current Feature Flags

### BOOKMARK_SYSTEM

**Status**: Disabled

Allows users to save/bookmark videos and view them in profile's "Saved" tab.

**Reason**: Backend not ready - bookmark persistence under development

**Impacts**:
- Save button in `VideoCardEnhanced`
- Save button in `ShortPlayer`
- Profile page "Saved" tab
- `useToggleBookmark()` mutation hook
- `useBookmarkedVideos()` query hook

**To Enable**:
```bash
NEXT_PUBLIC_FEATURE_BOOKMARK_SYSTEM=true
```

### WATCH_HISTORY

**Status**: Disabled

Allows users to view their video watch history in the profile page.

**Reason**: Backend not ready - history tracking under development

**Impacts**:
- Profile page "History" tab
- History navigation in sidebar
- `useHistoryVideos()` query hook

**To Enable**:
```bash
NEXT_PUBLIC_FEATURE_WATCH_HISTORY=true
```

## Testing Checklist

For each feature flag:

- [ ] Feature works correctly when enabled
- [ ] Feature is completely hidden when disabled (no errors)
- [ ] No console errors in either state
- [ ] API calls are blocked when disabled
- [ ] Mutations don't fire when disabled
- [ ] UI gracefully handles missing functionality

## Important Notes

- Feature flags are **build-time** (not runtime) - restart dev server after changes
- Flags default to **disabled** (opt-in, not opt-out)
- TypeScript provides autocomplete for feature names
- Always document the "why" in the `reason` field
