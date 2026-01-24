# Manual Review of Top Components

This document provides context-specific recommendations for the most complex components identified in the automated analysis.

## Top 10 Components - Detailed Review

### 1. `src/features/video/components/shaka-player.tsx`
**Score: 85/100 | Lines: 1189 | useState: 18 | useEffect: 10**

**Context**: This is the main video player component using Shaka Player for HLS streaming. It's a complex, feature-rich player with quality selection, playback speed, PiP, fullscreen, and preview thumbnails.

**Refactoring Recommendations**:
- **Extract Player State Hook**: Create `useShakaPlayerState()` to manage all 18 useState hooks (isPlaying, isMuted, volume, currentTime, duration, buffered, isFullscreen, isPiP, showControls, etc.)
- **Extract Controls Logic**: Create `usePlayerControls()` hook for play/pause/mute/seek operations
- **Extract Settings Panel**: Split settings panel (quality, speed) into separate component `PlayerSettingsPanel.tsx`
- **Extract Preview Logic**: Move preview thumbnail generation to `useVideoPreview()` hook
- **Split UI Sections**: 
  - `PlayerControls.tsx` - Control bar UI
  - `PlayerSettings.tsx` - Settings panel
  - `PlayerProgress.tsx` - Progress bar with preview
- **Simplify Conditionals**: Many nested conditionals for quality selection and settings - use lookup tables

**Priority**: **HIGH** - Core feature, but very complex. Breaking it down will improve maintainability significantly.

---

### 2. `src/features/video/components/custom-video-player.tsx`
**Score: 80/100 | Lines: 555 | useState: 12 | useEffect: 4**

**Context**: Alternative video player component, likely used for non-HLS videos or fallback scenarios.

**Refactoring Recommendations**:
- **Extract Player State**: Create `useCustomPlayerState()` hook for state management
- **Extract Controls**: Similar to Shaka player - extract controls to separate component
- **Consider Consolidation**: Evaluate if this can share logic with Shaka player via a common hook

**Priority**: **MEDIUM** - Less critical than Shaka player, but still benefits from refactoring.

---

### 3. `src/app/(main)/content/create/page.tsx`
**Score: 75/100 | Lines: 480 | useState: 5 | useEffect: 1 | API Calls: 1**

**Context**: Content creation form for videos and shorts. Handles file uploads, metadata, and submission.

**Refactoring Recommendations**:
- **Extract Form State Hook**: Create `useContentForm()` hook to manage form state (contentType, title, description, visibility, tags, files)
- **Extract File Upload Logic**: Create `useFileUpload()` hook for video/thumbnail file handling and validation
- **Split Form Sections**: 
  - `ContentTypeSelector.tsx` - Video/Short selection
  - `ContentMetadataForm.tsx` - Title, description, tags
  - `ContentVisibilityForm.tsx` - Visibility settings
  - `ContentFileUpload.tsx` - File upload UI
- **Extract API Logic**: Move submission logic to mutation hook (likely already using TanStack Query)
- **Extract Validation**: Create `useContentValidation()` hook for form validation

**Priority**: **HIGH** - User-facing feature that would benefit from better organization.

---

### 4. `src/app/(main)/content/edit/[uuid]/page.tsx`
**Score: 75/100 | Lines: 372 | useState: 5 | useEffect: 1 | API Calls: 2**

**Context**: Content editing page, similar to create page but with existing data loading.

**Refactoring Recommendations**:
- **Share Logic with Create**: Extract common form logic to shared hooks/components
- **Extract Edit State**: Create `useContentEdit()` hook that combines form state with data loading
- **Split Components**: Similar structure to create page

**Priority**: **HIGH** - Can share refactored components with create page.

---

### 5. `src/features/shorts/components/short-video-card.tsx`
**Score: 75/100 | Lines: 422 | useState: 5 | useEffect: 4**

**Context**: Individual short video card component with playback, interactions, and animations.

**Refactoring Recommendations**:
- **Extract Video Playback Logic**: Create `useShortVideoPlayback()` hook for play/pause/progress management
- **Extract Interaction Handlers**: Create `useShortInteractions()` hook for like, tap, swipe gestures
- **Extract Animation Logic**: Move heart animation logic to separate hook or component
- **Split UI**: 
  - `ShortVideoPlayer.tsx` - Video element and playback
  - `ShortVideoOverlay.tsx` - Overlay UI (play icon, progress)
  - `ShortVideoActions.tsx` - Action buttons/interactions

**Priority**: **MEDIUM** - Well-structured but could benefit from hook extraction.

---

### 6. `src/app/(main)/choose-plan/choose-plan-content.tsx`
**Score: 70/100 | Lines: 488 | useState: 4 | useEffect: 3**

**Context**: Subscription plan selection page with pricing tiers and checkout.

**Refactoring Recommendations**:
- **Extract Plan Selection Logic**: Create `usePlanSelection()` hook
- **Split Plan Cards**: Extract individual plan card to `PlanCard.tsx` component
- **Extract Checkout Logic**: Move checkout handling to separate hook or component

**Priority**: **MEDIUM** - Important feature but less complex than others.

---

### 7. `src/app/(main)/contents/shorts/page.tsx`
**Score: 70/100 | Lines: 251 | useState: 5 | useEffect: 2 | API Calls: 1`

**Context**: Content management page for shorts listing.

**Refactoring Recommendations**:
- **Extract List State**: Create `useContentList()` hook for filtering, sorting, pagination
- **Extract API Logic**: Ensure using TanStack Query hooks (verify no direct API calls)
- **Split Filters**: Extract filter UI to `ContentFilters.tsx` component

**Priority**: **LOW** - Relatively simple, minor improvements needed.

---

### 8. `src/app/(main)/contents/videos/page.tsx`
**Score: 70/100 | Lines: 253 | useState: 5 | useEffect: 2 | API Calls: 1`

**Context**: Content management page for videos listing. Similar to shorts page.

**Refactoring Recommendations**:
- **Share Logic with Shorts Page**: Extract common content list logic to shared hooks
- **Same as Shorts Page**: Similar refactoring approach

**Priority**: **LOW** - Can refactor alongside shorts page.

---

### 9. `src/app/(main)/profile/edit/page.tsx`
**Score: 70/100 | Lines: 445 | useState: 17 | useEffect: 1**

**Context**: Profile settings page with multiple tabs (profile, email, password, danger zone).

**Refactoring Recommendations**:
- **Extract Tab State**: Already using tabs - verify each tab is a separate component
- **Extract Form Hooks**: Create separate hooks for each form:
  - `useProfileForm()` - Profile fields
  - `useEmailForm()` - Email change
  - `usePasswordForm()` - Password change
- **Extract Danger Zone**: Move account deletion to separate component
- **Reduce State**: 17 useState hooks is excessive - group related state

**Priority**: **HIGH** - Too many useState hooks, needs significant refactoring.

---

### 10. `src/app/(main)/videos/[id]/page.tsx`
**Score: 70/100 | Lines: 471 | useState: 3 | useEffect: 4 | Conditionals: 41**

**Context**: Video detail page with player, metadata, related videos, and comments.

**Refactoring Recommendations**:
- **Extract Video Data Logic**: Create `useVideoPageData()` hook for data fetching and processing
- **Split Sections**: 
  - `VideoPlayerSection.tsx` - Player and controls
  - `VideoMetadataSection.tsx` - Title, description, tags
  - `VideoRelatedSection.tsx` - Related videos
  - `VideoCommentsSection.tsx` - Comments (likely already separate)
- **Simplify Conditionals**: Many conditionals for error states and loading - use early returns and lookup tables

**Priority**: **MEDIUM** - Good structure but conditionals need simplification.

---

## Additional High-Priority Components

### 11. `src/components/home/netflix-hover-card.tsx`
**Score: 70/100 | Lines: 278 | useState: 9 | useEffect: 4**

**Context**: Netflix-style hover card with video preview on hover.

**Refactoring Recommendations**:
- **Extract Hover State**: Create `useHoverCard()` hook for hover/expand state management
- **Extract Video Preview**: Create `useVideoPreview()` hook for preview URL fetching and playback
- **Split Components**: Already has sub-components (HoverCardActions, HoverCardInfo, HoverCardVideoPreview) - verify they're properly extracted

**Priority**: **MEDIUM** - Already partially refactored, needs hook extraction.

---

### 12. `src/components/search/GlobalSearchNetflix.tsx`
**Score: 70/100 | Lines: 383 | useState: 4 | useEffect: 4**

**Context**: Global search component with Netflix-style UI.

**Refactoring Recommendations**:
- **Extract Search Logic**: Create `useGlobalSearch()` hook for search state and results
- **Split Results Display**: Extract search results rendering to separate component

**Priority**: **MEDIUM** - Moderate complexity, benefits from hook extraction.

---

## Patterns Identified Across Components

### Common Issues:
1. **Multiple useState Hooks**: Many components have 5+ useState hooks that should be grouped into custom hooks
2. **API Logic in Components**: Some components still have direct API calls instead of using TanStack Query hooks
3. **Complex Conditionals**: Deep nesting and complex ternaries need simplification
4. **Large Components**: Components > 300 lines need splitting into sub-components

### Recommended Refactoring Order:
1. **Phase 1 (High Impact)**: Shaka Player, Profile Edit, Content Create/Edit
2. **Phase 2 (Medium Impact)**: Video Page, Short Video Card, Netflix Hover Card
3. **Phase 3 (Low Impact)**: Content listing pages, Search components
