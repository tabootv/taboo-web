# Feature Flags

This document lists all available feature flags, their current status, and implementation details.

## Overview

Feature flags allow us to enable/disable features during development without removing code. This is useful for:

- Features with incomplete backend implementation
- Experimental features being tested
- Features pending design approval
- Features blocked by external dependencies

## Usage

### In Client Components

```tsx
import { useFeature } from '@/lib/hooks/use-feature';
import { Feature } from '@/components/feature';

function MyComponent() {
  // Method 1: Using the hook
  const bookmarksEnabled = useFeature('BOOKMARK_SYSTEM');

  return <div>{bookmarksEnabled && <SaveButton />}</div>;
}

function MyOtherComponent() {
  // Method 2: Using the wrapper component
  return (
    <div>
      <Feature name="BOOKMARK_SYSTEM">
        <SaveButton />
      </Feature>
    </div>
  );
}
```

### In Server Components

```tsx
import { isFeatureEnabled } from '@/utils/feature-flags';

export default async function ProfilePage() {
  const bookmarksEnabled = isFeatureEnabled('BOOKMARK_SYSTEM');

  return <div>{bookmarksEnabled && <SavedTab />}</div>;
}
```

### Guarding Mutations/API Calls

```tsx
import { useFeature } from '@/lib/hooks/use-feature';
import { useToggleBookmark } from '@/api/mutations';

function SaveButton({ video }) {
  const bookmarksEnabled = useFeature('BOOKMARK_SYSTEM');
  const toggleBookmark = useToggleBookmark();

  // Don't call mutation if feature is disabled
  const handleSave = () => {
    if (!bookmarksEnabled) return;
    toggleBookmark.mutate(video.id);
  };

  // Hide button entirely if disabled
  if (!bookmarksEnabled) return null;

  return <button onClick={handleSave}>Save</button>;
}
```

## Available Features

### BOOKMARK_SYSTEM

**Status**: 🔴 Disabled

**Name**: Bookmark System

**Description**: Allows users to save/bookmark videos and view them in their profile's "Saved" tab.

**Reason**: Backend not ready - bookmark persistence under development

**Impacts**:

- Save button in `VideoCardEnhanced` component
- Save button in `ShortPlayer` component
- Profile page "Saved" tab visibility
- `POST /videos/{id}/toggle-bookmark` API endpoint
- `POST /v2/shorts/{uuid}/toggle-bookmark` API endpoint
- `useToggleBookmark()` mutation hook
- `useToggleShortBookmark()` mutation hook
- `useBookmarkedVideos()` query hook

**Environment Variable**: `NEXT_PUBLIC_FEATURE_BOOKMARK_SYSTEM`

**To Enable**:

1. Set `NEXT_PUBLIC_FEATURE_BOOKMARK_SYSTEM=true` in `.env.local`
2. Restart dev server
3. Verify save buttons appear and "Saved" tab is visible in profile

**Backend Requirements**:

- Bookmark persistence working correctly
- API endpoints returning proper responses
- Database schema supports bookmarks

### WATCH_HISTORY

**Status**: 🔴 Disabled

**Name**: Watch History

**Description**: Allows users to view their video watch history in the profile page.

**Reason**: Backend not ready - history tracking system under development

**Impacts**:

- Profile page "History" tab visibility
- History navigation item in sidebar
- `GET /profile/watch-history` API endpoint
- `useHistoryVideos()` query hook

**Environment Variable**: `NEXT_PUBLIC_FEATURE_WATCH_HISTORY`

**To Enable**:

1. Set `NEXT_PUBLIC_FEATURE_WATCH_HISTORY=true` in `.env.local`
2. Restart dev server
3. Verify "History" tab appears in profile and sidebar

**Backend Requirements**:

- History tracking working correctly
- API endpoint returning proper responses
- Database schema supports watch history

---

## Adding New Features

To add a new feature flag:

1. **Add to config** (`src/shared/lib/config/feature-flags.ts`):

```typescript
export const FEATURES = {
  // ... existing features
  MY_NEW_FEATURE: {
    enabled: process.env.NEXT_PUBLIC_FEATURE_MY_NEW_FEATURE === 'true',
    name: 'My New Feature',
    description: 'What this feature does',
    impacts: ['Component A', 'Component B', 'API endpoint X'],
    reason: 'Why it is disabled (if applicable)',
  },
};
```

2. **Add environment variable** (`.env.local.example` and `.env.local`):

```bash
NEXT_PUBLIC_FEATURE_MY_NEW_FEATURE=false
```

3. **Document here** (add new section to this file)

4. **Use in code**:

```tsx
const myFeatureEnabled = useFeature('MY_NEW_FEATURE');
// or
<Feature name="MY_NEW_FEATURE">...</Feature>;
```

---

## Testing Feature Flags

### Manual Testing Checklist

For each feature flag:

- [ ] Feature works correctly when enabled
- [ ] Feature is completely hidden when disabled (no errors)
- [ ] No console errors in either state
- [ ] API calls are blocked when disabled
- [ ] Mutations don't fire when disabled
- [ ] UI gracefully handles missing functionality

### Automated Testing (Future)

Consider adding:

- Unit tests for feature flag logic
- Integration tests for feature-gated components
- E2E tests with flags enabled/disabled

---

## Notes

- Feature flags are **build-time** (not runtime) - restart dev server to change
- Flags default to **disabled** (opt-in, not opt-out)
- Use TypeScript - you'll get autocomplete for feature names
- Document the "why" in the `reason` field
- Keep this document updated when adding/removing features
