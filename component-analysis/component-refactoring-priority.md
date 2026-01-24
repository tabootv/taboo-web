# Component Refactoring Priority List

This document provides a prioritized list of components to refactor based on complexity score, user impact, and technical debt.

## Priority Tiers

### 🔴 Tier 1: Critical (Refactor First)
**Impact**: High user-facing impact, high complexity, core features
**Timeline**: Immediate - Next 2-4 weeks

### 🟡 Tier 2: Important (Refactor Soon)
**Impact**: Medium user-facing impact, moderate complexity
**Timeline**: Next 1-2 months

### 🟢 Tier 3: Nice to Have (Refactor When Time Permits)
**Impact**: Low user-facing impact, lower complexity, or already well-structured
**Timeline**: Ongoing improvement

---

## 🔴 Tier 1: Critical Priority

### 1. `src/features/video/components/shaka-player.tsx`
**Complexity**: 85/100 | **Lines**: 1189 | **Priority**: CRITICAL

**Why**: Core video player component used throughout the app. Extremely complex with 18 useState hooks and 10 useEffect hooks.

**Refactoring Plan**:
1. Extract `useShakaPlayerState()` hook (all state management)
2. Extract `usePlayerControls()` hook (play/pause/mute/seek)
3. Extract `useVideoPreview()` hook (preview thumbnails)
4. Split into components:
   - `ShakaPlayerControls.tsx`
   - `ShakaPlayerSettings.tsx`
   - `ShakaPlayerProgress.tsx`
5. Simplify conditionals using lookup tables

**Estimated Effort**: 3-5 days
**Dependencies**: None (can be refactored independently)

---

### 2. `src/app/(main)/profile/edit/page.tsx`
**Complexity**: 70/100 | **Lines**: 445 | **Priority**: CRITICAL

**Why**: 17 useState hooks is excessive. Profile settings are frequently used.

**Refactoring Plan**:
1. Extract `useProfileForm()` hook
2. Extract `useEmailForm()` hook
3. Extract `usePasswordForm()` hook
4. Verify tab components are properly separated
5. Group related state into cohesive hooks

**Estimated Effort**: 2-3 days
**Dependencies**: None

---

### 3. `src/app/(main)/content/create/page.tsx`
**Complexity**: 75/100 | **Lines**: 480 | **Priority**: CRITICAL

**Why**: Content creation is a key creator feature. Form logic needs extraction.

**Refactoring Plan**:
1. Extract `useContentForm()` hook (all form state)
2. Extract `useFileUpload()` hook (video/thumbnail handling)
3. Extract `useContentValidation()` hook
4. Split into components:
   - `ContentTypeSelector.tsx`
   - `ContentMetadataForm.tsx`
   - `ContentVisibilityForm.tsx`
   - `ContentFileUpload.tsx`

**Estimated Effort**: 2-3 days
**Dependencies**: None

---

### 4. `src/app/(main)/content/edit/[uuid]/page.tsx`
**Complexity**: 75/100 | **Lines**: 372 | **Priority**: CRITICAL

**Why**: Similar to create page. Can share refactored components.

**Refactoring Plan**:
1. Share refactored components from create page
2. Extract `useContentEdit()` hook (combines form + data loading)
3. Reuse form components from create page

**Estimated Effort**: 1-2 days
**Dependencies**: Depends on create page refactoring (can be done in parallel)

---

## 🟡 Tier 2: Important Priority

### 5. `src/features/video/components/custom-video-player.tsx`
**Complexity**: 80/100 | **Lines**: 555 | **Priority**: IMPORTANT

**Why**: Alternative video player. Less critical than Shaka but still complex.

**Refactoring Plan**:
1. Extract `useCustomPlayerState()` hook
2. Extract controls to separate component
3. Consider sharing logic with Shaka player via common hooks

**Estimated Effort**: 2-3 days
**Dependencies**: Can benefit from Shaka player refactoring patterns

---

### 6. `src/app/(main)/videos/[id]/page.tsx`
**Complexity**: 70/100 | **Lines**: 471 | **Priority**: IMPORTANT

**Why**: Video detail page with many conditionals. Core user-facing feature.

**Refactoring Plan**:
1. Extract `useVideoPageData()` hook
2. Split into section components
3. Simplify conditionals with early returns and lookup tables

**Estimated Effort**: 2 days
**Dependencies**: None

---

### 7. `src/features/shorts/components/short-video-card.tsx`
**Complexity**: 75/100 | **Lines**: 422 | **Priority**: IMPORTANT

**Why**: Shorts are a key feature. Component handles complex playback logic.

**Refactoring Plan**:
1. Extract `useShortVideoPlayback()` hook
2. Extract `useShortInteractions()` hook
3. Split UI into sub-components

**Estimated Effort**: 2 days
**Dependencies**: None

---

### 8. `src/components/home/netflix-hover-card.tsx`
**Complexity**: 70/100 | **Lines**: 278 | **Priority**: IMPORTANT

**Why**: Used extensively on homepage. Already partially refactored but needs hook extraction.

**Refactoring Plan**:
1. Extract `useHoverCard()` hook
2. Extract `useVideoPreview()` hook
3. Verify sub-components are properly extracted

**Estimated Effort**: 1-2 days
**Dependencies**: None

---

### 9. `src/components/search/GlobalSearchNetflix.tsx`
**Complexity**: 70/100 | **Lines**: 383 | **Priority**: IMPORTANT

**Why**: Global search is frequently used. Moderate complexity.

**Refactoring Plan**:
1. Extract `useGlobalSearch()` hook
2. Extract search results component

**Estimated Effort**: 1-2 days
**Dependencies**: None

---

### 10. `src/app/(main)/choose-plan/choose-plan-content.tsx`
**Complexity**: 70/100 | **Lines**: 488 | **Priority**: IMPORTANT

**Why**: Subscription selection is important but less complex than others.

**Refactoring Plan**:
1. Extract `usePlanSelection()` hook
2. Extract `PlanCard.tsx` component
3. Extract checkout logic

**Estimated Effort**: 1-2 days
**Dependencies**: None

---

## 🟢 Tier 3: Nice to Have

### 11-20. Content Listing Pages
**Components**:
- `src/app/(main)/contents/shorts/page.tsx` (70/100)
- `src/app/(main)/contents/videos/page.tsx` (70/100)

**Why**: Lower complexity, can share refactored logic.

**Refactoring Plan**:
1. Extract shared `useContentList()` hook
2. Extract filter components
3. Share components between shorts and videos pages

**Estimated Effort**: 1-2 days (combined)
**Dependencies**: Can be done together

---

### 21-26. Other Medium Priority Components
**Components**:
- `src/app/(main)/home/playlists-infinite-scroll.tsx` (65/100)
- `src/components/search/SmartSearchDropdown.tsx` (65/100)
- `src/app/(main)/community/[post]/page.tsx` (60/100)
- `src/app/(studio)/studio/analytics/page.tsx` (55/100) - **Note**: 1384 lines!
- `src/app/(studio)/studio/page.tsx` (55/100)
- `src/app/(main)/notifications/page.tsx` (50/100)

**Why**: Lower priority but still benefit from refactoring.

**Refactoring Plan**: Component-specific, generally:
1. Extract hooks for state management
2. Split large components
3. Simplify conditionals

**Estimated Effort**: 1-2 days each
**Dependencies**: None

---

## Refactoring Strategy

### Phase 1: Foundation (Weeks 1-2)
Focus on Tier 1 components that are most complex and widely used:
1. Shaka Player
2. Profile Edit
3. Content Create/Edit

### Phase 2: Core Features (Weeks 3-4)
Continue with important user-facing features:
4. Video Page
5. Short Video Card
6. Netflix Hover Card

### Phase 3: Supporting Features (Month 2)
Complete remaining Tier 2 components and start Tier 3.

### Phase 4: Polish (Ongoing)
Continue with Tier 3 components as time permits.

---

## Success Metrics

After refactoring, components should meet these targets:
- **Complexity Score**: < 50
- **Line Count**: < 300
- **useState Hooks**: < 5 (or grouped in custom hooks)
- **Max Nesting**: < 4 levels
- **Conditionals**: < 10 per component

---

## Notes

- **Analytics Page**: `src/app/(studio)/studio/analytics/page.tsx` has 1384 lines but only scored 55/100. This suggests it's mostly data/UI with low complexity. Still worth splitting for maintainability.

- **Shared Logic**: Many components can share refactored hooks (e.g., video playback, form handling, content lists).

- **Testing**: After each refactoring, ensure:
  - All tests pass
  - Manual testing of affected features
  - No performance regressions
