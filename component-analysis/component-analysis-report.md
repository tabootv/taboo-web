# Component Complexity Analysis Report

Generated: 2026-01-23T23:09:42.452Z

## Summary

- **Total Components**: 269
- **High Priority**: 26
- **Medium Priority**: 16
- **Low Priority**: 227

## 🔴 High Priority Components

### 1. src/features/video/components/shaka-player.tsx

- **Complexity Score**: 85/100
- **Lines**: 1189
- **useState Hooks**: 18
- **useEffect Hooks**: 10
- **Conditionals**: 99
- **Max Nesting**: 7
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Extract custom hooks (Pattern 1)
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 2. src/features/video/components/custom-video-player.tsx

- **Complexity Score**: 80/100
- **Lines**: 555
- **useState Hooks**: 12
- **useEffect Hooks**: 4
- **Conditionals**: 45
- **Max Nesting**: 5
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Extract custom hooks (Pattern 1)
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 3. src/app/(main)/content/create/page.tsx

- **Complexity Score**: 75/100
- **Lines**: 480
- **useState Hooks**: 5
- **useEffect Hooks**: 1
- **Conditionals**: 31
- **Max Nesting**: 4
- **API Calls**: 1
- **Modals**: 0

**Recommendations**:
- Extract custom hooks (Pattern 1)
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)
- Extract API/data logic to hooks (Pattern 4)
- Extract form logic (Pattern 6)

### 4. src/app/(main)/content/edit/[uuid]/page.tsx

- **Complexity Score**: 75/100
- **Lines**: 372
- **useState Hooks**: 5
- **useEffect Hooks**: 1
- **Conditionals**: 19
- **Max Nesting**: 5
- **API Calls**: 2
- **Modals**: 0

**Recommendations**:
- Extract custom hooks (Pattern 1)
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)
- Extract API/data logic to hooks (Pattern 4)

### 5. src/features/shorts/components/short-video-card.tsx

- **Complexity Score**: 75/100
- **Lines**: 422
- **useState Hooks**: 5
- **useEffect Hooks**: 4
- **Conditionals**: 35
- **Max Nesting**: 5
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Extract custom hooks (Pattern 1)
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 6. src/app/(main)/choose-plan/choose-plan-content.tsx

- **Complexity Score**: 70/100
- **Lines**: 488
- **useState Hooks**: 4
- **useEffect Hooks**: 3
- **Conditionals**: 33
- **Max Nesting**: 5
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 7. src/app/(main)/contents/shorts/page.tsx

- **Complexity Score**: 70/100
- **Lines**: 251
- **useState Hooks**: 5
- **useEffect Hooks**: 2
- **Conditionals**: 22
- **Max Nesting**: 5
- **API Calls**: 1
- **Modals**: 0

**Recommendations**:
- Extract custom hooks (Pattern 1)
- Simplify conditional logic (Pattern 3)
- Extract API/data logic to hooks (Pattern 4)

### 8. src/app/(main)/contents/videos/page.tsx

- **Complexity Score**: 70/100
- **Lines**: 253
- **useState Hooks**: 5
- **useEffect Hooks**: 2
- **Conditionals**: 22
- **Max Nesting**: 5
- **API Calls**: 1
- **Modals**: 0

**Recommendations**:
- Extract custom hooks (Pattern 1)
- Simplify conditional logic (Pattern 3)
- Extract API/data logic to hooks (Pattern 4)

### 9. src/app/(main)/profile/edit/page.tsx

- **Complexity Score**: 70/100
- **Lines**: 445
- **useState Hooks**: 17
- **useEffect Hooks**: 1
- **Conditionals**: 22
- **Max Nesting**: 5
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Extract custom hooks (Pattern 1)
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)
- Extract form logic (Pattern 6)

### 10. src/app/(main)/videos/[id]/page.tsx

- **Complexity Score**: 70/100
- **Lines**: 471
- **useState Hooks**: 3
- **useEffect Hooks**: 4
- **Conditionals**: 41
- **Max Nesting**: 6
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 11. src/components/home/netflix-hover-card.tsx

- **Complexity Score**: 70/100
- **Lines**: 278
- **useState Hooks**: 9
- **useEffect Hooks**: 4
- **Conditionals**: 24
- **Max Nesting**: 6
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Extract custom hooks (Pattern 1)
- Simplify conditional logic (Pattern 3)

### 12. src/components/search/GlobalSearchNetflix.tsx

- **Complexity Score**: 70/100
- **Lines**: 383
- **useState Hooks**: 4
- **useEffect Hooks**: 4
- **Conditionals**: 27
- **Max Nesting**: 6
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 13. src/app/(main)/home/playlists-infinite-scroll.tsx

- **Complexity Score**: 65/100
- **Lines**: 373
- **useState Hooks**: 2
- **useEffect Hooks**: 5
- **Conditionals**: 40
- **Max Nesting**: 6
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 14. src/components/search/SmartSearchDropdown.tsx

- **Complexity Score**: 65/100
- **Lines**: 390
- **useState Hooks**: 3
- **useEffect Hooks**: 2
- **Conditionals**: 28
- **Max Nesting**: 7
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 15. src/app/(main)/community/[post]/page.tsx

- **Complexity Score**: 60/100
- **Lines**: 314
- **useState Hooks**: 4
- **useEffect Hooks**: 1
- **Conditionals**: 20
- **Max Nesting**: 6
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 16. src/app/(studio)/studio/analytics/page.tsx

- **Complexity Score**: 55/100
- **Lines**: 1384
- **useState Hooks**: 2
- **useEffect Hooks**: 2
- **Conditionals**: 99
- **Max Nesting**: 7
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 17. src/app/(studio)/studio/page.tsx

- **Complexity Score**: 55/100
- **Lines**: 466
- **useState Hooks**: 1
- **useEffect Hooks**: 2
- **Conditionals**: 36
- **Max Nesting**: 6
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 18. src/app/(main)/notifications/page.tsx

- **Complexity Score**: 50/100
- **Lines**: 425
- **useState Hooks**: 0
- **useEffect Hooks**: 0
- **Conditionals**: 39
- **Max Nesting**: 6
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 19. src/app/(main)/profile/complete/page.tsx

- **Complexity Score**: 50/100
- **Lines**: 357
- **useState Hooks**: 2
- **useEffect Hooks**: 0
- **Conditionals**: 17
- **Max Nesting**: 4
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)
- Extract form logic (Pattern 6)

### 20. src/app/(studio)/studio/earnings/page.tsx

- **Complexity Score**: 50/100
- **Lines**: 569
- **useState Hooks**: 0
- **useEffect Hooks**: 0
- **Conditionals**: 26
- **Max Nesting**: 4
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 21. src/app/(studio)/studio/posts/page.tsx

- **Complexity Score**: 50/100
- **Lines**: 339
- **useState Hooks**: 2
- **useEffect Hooks**: 1
- **Conditionals**: 28
- **Max Nesting**: 5
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 22. src/app/(studio)/studio/upload/short/page.tsx

- **Complexity Score**: 50/100
- **Lines**: 556
- **useState Hooks**: 2
- **useEffect Hooks**: 1
- **Conditionals**: 30
- **Max Nesting**: 6
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)
- Extract form logic (Pattern 6)

### 23. src/app/(studio)/studio/upload/video/page.tsx

- **Complexity Score**: 50/100
- **Lines**: 541
- **useState Hooks**: 2
- **useEffect Hooks**: 1
- **Conditionals**: 29
- **Max Nesting**: 6
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)
- Extract form logic (Pattern 6)

### 24. src/components/ui/chart.tsx

- **Complexity Score**: 50/100
- **Lines**: 358
- **useState Hooks**: 0
- **useEffect Hooks**: 0
- **Conditionals**: 35
- **Max Nesting**: 7
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 25. src/components/ui/sidebar.tsx

- **Complexity Score**: 50/100
- **Lines**: 695
- **useState Hooks**: 2
- **useEffect Hooks**: 1
- **Conditionals**: 38
- **Max Nesting**: 4
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

### 26. src/features/creator-studio/components/funnel-area-chart.tsx

- **Complexity Score**: 50/100
- **Lines**: 327
- **useState Hooks**: 0
- **useEffect Hooks**: 0
- **Conditionals**: 20
- **Max Nesting**: 7
- **API Calls**: 0
- **Modals**: 0

**Recommendations**:
- Split into sub-components (Pattern 2)
- Simplify conditional logic (Pattern 3)

## 🟡 Medium Priority Components

### 1. src/components/home/media-preview-modal.tsx

- **Complexity Score**: 65/100
- **Lines**: 229
- **Recommendations**: Extract custom hooks (Pattern 1), Simplify conditional logic (Pattern 3)

### 2. src/components/ui/search-bar.tsx

- **Complexity Score**: 65/100
- **Lines**: 290
- **Recommendations**: Extract custom hooks (Pattern 1), Simplify conditional logic (Pattern 3)

### 3. src/app/(main)/contents/shorts/[id]/edit/page.tsx

- **Complexity Score**: 60/100
- **Lines**: 247
- **Recommendations**: Simplify conditional logic (Pattern 3), Extract API/data logic to hooks (Pattern 4)

### 4. src/app/(main)/contents/shorts/create/page.tsx

- **Complexity Score**: 60/100
- **Lines**: 291
- **Recommendations**: Simplify conditional logic (Pattern 3), Extract API/data logic to hooks (Pattern 4), Extract form logic (Pattern 6)

### 5. src/app/(main)/contents/videos/[id]/edit/page.tsx

- **Complexity Score**: 60/100
- **Lines**: 259
- **Recommendations**: Simplify conditional logic (Pattern 3), Extract API/data logic to hooks (Pattern 4), Extract form logic (Pattern 6)

### 6. src/app/(main)/contents/videos/create/page.tsx

- **Complexity Score**: 60/100
- **Lines**: 287
- **Recommendations**: Simplify conditional logic (Pattern 3), Extract API/data logic to hooks (Pattern 4), Extract form logic (Pattern 6)

### 7. src/app/(main)/profile/edit-password/page.tsx

- **Complexity Score**: 60/100
- **Lines**: 238
- **Recommendations**: Extract custom hooks (Pattern 1), Simplify conditional logic (Pattern 3)

### 8. src/features/community/components/community-post.tsx

- **Complexity Score**: 60/100
- **Lines**: 224
- **Recommendations**: Extract custom hooks (Pattern 1), Simplify conditional logic (Pattern 3), Extract modal management (Pattern 5)

### 9. src/components/home/components/SeriesSidePanel.tsx

- **Complexity Score**: 55/100
- **Lines**: 271
- **Recommendations**: Simplify conditional logic (Pattern 3)

### 10. src/components/home/rail-card.tsx

- **Complexity Score**: 55/100
- **Lines**: 274
- **Recommendations**: Simplify conditional logic (Pattern 3)

### 11. src/features/shorts/components/short-player.tsx

- **Complexity Score**: 55/100
- **Lines**: 283
- **Recommendations**: Simplify conditional logic (Pattern 3)

### 12. src/app/(auth)/reset-password/page.tsx

- **Complexity Score**: 50/100
- **Lines**: 209
- **Recommendations**: Extract custom hooks (Pattern 1), Simplify conditional logic (Pattern 3)

### 13. src/app/(main)/payment/checkout/[plan]/page.tsx

- **Complexity Score**: 50/100
- **Lines**: 294
- **Recommendations**: Simplify conditional logic (Pattern 3)

### 14. src/app/(main)/shorts/[uuid]/page.tsx

- **Complexity Score**: 50/100
- **Lines**: 292
- **Recommendations**: Simplify conditional logic (Pattern 3)

### 15. src/components/home/rail-row.tsx

- **Complexity Score**: 50/100
- **Lines**: 201
- **Recommendations**: Simplify conditional logic (Pattern 3)

### 16. src/app/(main)/courses/[id]/play/[videoUuid]/page.tsx

- **Complexity Score**: 45/100
- **Lines**: 321
- **Recommendations**: Split into sub-components (Pattern 2), Simplify conditional logic (Pattern 3)

## 📋 Components by Refactoring Pattern

### Pattern 1: Extract Custom Hooks

- **src/features/video/components/shaka-player.tsx** (Score: 85, Lines: 1189)
- **src/features/video/components/custom-video-player.tsx** (Score: 80, Lines: 555)
- **src/app/(main)/content/create/page.tsx** (Score: 75, Lines: 480)
- **src/app/(main)/content/edit/[uuid]/page.tsx** (Score: 75, Lines: 372)
- **src/features/shorts/components/short-video-card.tsx** (Score: 75, Lines: 422)
- **src/app/(main)/contents/shorts/page.tsx** (Score: 70, Lines: 251)
- **src/app/(main)/contents/videos/page.tsx** (Score: 70, Lines: 253)
- **src/app/(main)/profile/edit/page.tsx** (Score: 70, Lines: 445)
- **src/components/home/netflix-hover-card.tsx** (Score: 70, Lines: 278)
- **src/components/home/media-preview-modal.tsx** (Score: 65, Lines: 229)
- **src/components/ui/search-bar.tsx** (Score: 65, Lines: 290)
- **src/app/(main)/profile/edit-password/page.tsx** (Score: 60, Lines: 238)
- **src/features/community/components/community-post.tsx** (Score: 60, Lines: 224)
- **src/app/(auth)/reset-password/page.tsx** (Score: 50, Lines: 209)
- **src/features/community/components/post-comment.tsx** (Score: 40, Lines: 195)

### Pattern 2: Extract Sub-Components

- **src/features/video/components/shaka-player.tsx** (Score: 85, Lines: 1189)
- **src/features/video/components/custom-video-player.tsx** (Score: 80, Lines: 555)
- **src/app/(main)/content/create/page.tsx** (Score: 75, Lines: 480)
- **src/app/(main)/content/edit/[uuid]/page.tsx** (Score: 75, Lines: 372)
- **src/features/shorts/components/short-video-card.tsx** (Score: 75, Lines: 422)
- **src/app/(main)/choose-plan/choose-plan-content.tsx** (Score: 70, Lines: 488)
- **src/app/(main)/profile/edit/page.tsx** (Score: 70, Lines: 445)
- **src/app/(main)/videos/[id]/page.tsx** (Score: 70, Lines: 471)
- **src/components/search/GlobalSearchNetflix.tsx** (Score: 70, Lines: 383)
- **src/app/(main)/home/playlists-infinite-scroll.tsx** (Score: 65, Lines: 373)
- **src/components/search/SmartSearchDropdown.tsx** (Score: 65, Lines: 390)
- **src/app/(main)/community/[post]/page.tsx** (Score: 60, Lines: 314)
- **src/app/(studio)/studio/analytics/page.tsx** (Score: 55, Lines: 1384)
- **src/app/(studio)/studio/page.tsx** (Score: 55, Lines: 466)
- **src/app/(main)/notifications/page.tsx** (Score: 50, Lines: 425)
- **src/app/(main)/profile/complete/page.tsx** (Score: 50, Lines: 357)
- **src/app/(studio)/studio/earnings/page.tsx** (Score: 50, Lines: 569)
- **src/app/(studio)/studio/posts/page.tsx** (Score: 50, Lines: 339)
- **src/app/(studio)/studio/upload/short/page.tsx** (Score: 50, Lines: 556)
- **src/app/(studio)/studio/upload/video/page.tsx** (Score: 50, Lines: 541)

### Pattern 3: Simplify Conditional Logic

- **src/features/video/components/shaka-player.tsx** (Score: 85, Lines: 1189)
- **src/features/video/components/custom-video-player.tsx** (Score: 80, Lines: 555)
- **src/app/(main)/content/create/page.tsx** (Score: 75, Lines: 480)
- **src/app/(main)/content/edit/[uuid]/page.tsx** (Score: 75, Lines: 372)
- **src/features/shorts/components/short-video-card.tsx** (Score: 75, Lines: 422)
- **src/app/(main)/choose-plan/choose-plan-content.tsx** (Score: 70, Lines: 488)
- **src/app/(main)/contents/shorts/page.tsx** (Score: 70, Lines: 251)
- **src/app/(main)/contents/videos/page.tsx** (Score: 70, Lines: 253)
- **src/app/(main)/profile/edit/page.tsx** (Score: 70, Lines: 445)
- **src/app/(main)/videos/[id]/page.tsx** (Score: 70, Lines: 471)
- **src/components/home/netflix-hover-card.tsx** (Score: 70, Lines: 278)
- **src/components/search/GlobalSearchNetflix.tsx** (Score: 70, Lines: 383)
- **src/app/(main)/home/playlists-infinite-scroll.tsx** (Score: 65, Lines: 373)
- **src/components/home/media-preview-modal.tsx** (Score: 65, Lines: 229)
- **src/components/search/SmartSearchDropdown.tsx** (Score: 65, Lines: 390)
- **src/components/ui/search-bar.tsx** (Score: 65, Lines: 290)
- **src/app/(main)/community/[post]/page.tsx** (Score: 60, Lines: 314)
- **src/app/(main)/contents/shorts/[id]/edit/page.tsx** (Score: 60, Lines: 247)
- **src/app/(main)/contents/shorts/create/page.tsx** (Score: 60, Lines: 291)
- **src/app/(main)/contents/videos/[id]/edit/page.tsx** (Score: 60, Lines: 259)

### Pattern 4: Extract API/Data Logic

- **src/app/(main)/content/create/page.tsx** (Score: 75, Lines: 480)
- **src/app/(main)/content/edit/[uuid]/page.tsx** (Score: 75, Lines: 372)
- **src/app/(main)/contents/shorts/page.tsx** (Score: 70, Lines: 251)
- **src/app/(main)/contents/videos/page.tsx** (Score: 70, Lines: 253)
- **src/app/(main)/contents/shorts/[id]/edit/page.tsx** (Score: 60, Lines: 247)
- **src/app/(main)/contents/shorts/create/page.tsx** (Score: 60, Lines: 291)
- **src/app/(main)/contents/videos/[id]/edit/page.tsx** (Score: 60, Lines: 259)
- **src/app/(main)/contents/videos/create/page.tsx** (Score: 60, Lines: 287)
- **src/app/(auth)/confirm-password/page.tsx** (Score: 40, Lines: 97)
- **src/app/(auth)/verify-email/page.tsx** (Score: 40, Lines: 196)

### Pattern 5: Extract Modal Management

- **src/features/community/components/community-post.tsx** (Score: 60, Lines: 224)

### Pattern 6: Extract Form Logic

- **src/app/(main)/content/create/page.tsx** (Score: 75, Lines: 480)
- **src/app/(main)/profile/edit/page.tsx** (Score: 70, Lines: 445)
- **src/app/(main)/contents/shorts/create/page.tsx** (Score: 60, Lines: 291)
- **src/app/(main)/contents/videos/[id]/edit/page.tsx** (Score: 60, Lines: 259)
- **src/app/(main)/contents/videos/create/page.tsx** (Score: 60, Lines: 287)
- **src/app/(main)/profile/complete/page.tsx** (Score: 50, Lines: 357)
- **src/app/(studio)/studio/upload/short/page.tsx** (Score: 50, Lines: 556)
- **src/app/(studio)/studio/upload/video/page.tsx** (Score: 50, Lines: 541)
- **src/app/(auth)/register/page.tsx** (Score: 40, Lines: 298)

## 📊 All Components (Sorted by Complexity)

| Path | Score | Lines | useState | useEffect | Conditionals | Priority |
|------|-------|-------|----------|-----------|--------------|----------|
| src/features/video/components/shaka-player.tsx | 85 | 1189 | 18 | 10 | 99 | High |
| src/features/video/components/custom-video-player.tsx | 80 | 555 | 12 | 4 | 45 | High |
| src/app/(main)/content/create/page.tsx | 75 | 480 | 5 | 1 | 31 | High |
| src/app/(main)/content/edit/[uuid]/page.tsx | 75 | 372 | 5 | 1 | 19 | High |
| src/features/shorts/components/short-video-card.tsx | 75 | 422 | 5 | 4 | 35 | High |
| src/app/(main)/choose-plan/choose-plan-content.tsx | 70 | 488 | 4 | 3 | 33 | High |
| src/app/(main)/contents/shorts/page.tsx | 70 | 251 | 5 | 2 | 22 | High |
| src/app/(main)/contents/videos/page.tsx | 70 | 253 | 5 | 2 | 22 | High |
| src/app/(main)/profile/edit/page.tsx | 70 | 445 | 17 | 1 | 22 | High |
| src/app/(main)/videos/[id]/page.tsx | 70 | 471 | 3 | 4 | 41 | High |
| src/components/home/netflix-hover-card.tsx | 70 | 278 | 9 | 4 | 24 | High |
| src/components/search/GlobalSearchNetflix.tsx | 70 | 383 | 4 | 4 | 27 | High |
| src/app/(main)/home/playlists-infinite-scroll.tsx | 65 | 373 | 2 | 5 | 40 | High |
| src/components/home/media-preview-modal.tsx | 65 | 229 | 7 | 4 | 19 | Medium |
| src/components/search/SmartSearchDropdown.tsx | 65 | 390 | 3 | 2 | 28 | High |
| src/components/ui/search-bar.tsx | 65 | 290 | 5 | 4 | 23 | Medium |
| src/app/(main)/community/[post]/page.tsx | 60 | 314 | 4 | 1 | 20 | High |
| src/app/(main)/contents/shorts/[id]/edit/page.tsx | 60 | 247 | 4 | 1 | 20 | Medium |
| src/app/(main)/contents/shorts/create/page.tsx | 60 | 291 | 4 | 0 | 20 | Medium |
| src/app/(main)/contents/videos/[id]/edit/page.tsx | 60 | 259 | 4 | 1 | 21 | Medium |
| src/app/(main)/contents/videos/create/page.tsx | 60 | 287 | 4 | 0 | 20 | Medium |
| src/app/(main)/profile/edit-password/page.tsx | 60 | 238 | 8 | 0 | 18 | Medium |
| src/features/community/components/community-post.tsx | 60 | 224 | 5 | 0 | 5 | Medium |
| src/app/(studio)/studio/analytics/page.tsx | 55 | 1384 | 2 | 2 | 99 | High |
| src/app/(studio)/studio/page.tsx | 55 | 466 | 1 | 2 | 36 | High |
| src/components/home/components/SeriesSidePanel.tsx | 55 | 271 | 4 | 2 | 21 | Medium |
| src/components/home/rail-card.tsx | 55 | 274 | 4 | 2 | 28 | Medium |
| src/features/shorts/components/short-player.tsx | 55 | 283 | 3 | 2 | 19 | Medium |
| src/app/(auth)/reset-password/page.tsx | 50 | 209 | 6 | 0 | 11 | Medium |
| src/app/(main)/notifications/page.tsx | 50 | 425 | 0 | 0 | 39 | High |
| src/app/(main)/payment/checkout/[plan]/page.tsx | 50 | 294 | 3 | 1 | 16 | Medium |
| src/app/(main)/profile/complete/page.tsx | 50 | 357 | 2 | 0 | 17 | High |
| src/app/(main)/shorts/[uuid]/page.tsx | 50 | 292 | 0 | 3 | 17 | Medium |
| src/app/(studio)/studio/earnings/page.tsx | 50 | 569 | 0 | 0 | 26 | High |
| src/app/(studio)/studio/posts/page.tsx | 50 | 339 | 2 | 1 | 28 | High |
| src/app/(studio)/studio/upload/short/page.tsx | 50 | 556 | 2 | 1 | 30 | High |
| src/app/(studio)/studio/upload/video/page.tsx | 50 | 541 | 2 | 1 | 29 | High |
| src/components/home/rail-row.tsx | 50 | 201 | 3 | 1 | 17 | Medium |
| src/components/ui/chart.tsx | 50 | 358 | 0 | 0 | 35 | High |
| src/components/ui/sidebar.tsx | 50 | 695 | 2 | 1 | 38 | High |
| src/features/creator-studio/components/funnel-area-chart.tsx | 50 | 327 | 0 | 0 | 20 | High |
| src/app/(main)/courses/[id]/play/[videoUuid]/page.tsx | 45 | 321 | 1 | 1 | 13 | Medium |
| src/app/(main)/shorts/page.tsx | 45 | 291 | 0 | 3 | 15 | Low |
| src/components/home/creators.tsx | 45 | 182 | 3 | 2 | 16 | Low |
| src/app/(auth)/confirm-password/page.tsx | 40 | 97 | 3 | 0 | 6 | Low |
| src/app/(auth)/register/page.tsx | 40 | 298 | 2 | 0 | 21 | Low |
| src/app/(auth)/verify-email/page.tsx | 40 | 196 | 2 | 1 | 15 | Low |
| src/app/(main)/profile/edit-email/page.tsx | 40 | 152 | 4 | 0 | 10 | Low |
| src/app/(main)/series/[slug]/page.tsx | 40 | 268 | 2 | 0 | 16 | Low |
| src/app/(main)/videos/page.tsx | 40 | 226 | 0 | 1 | 16 | Low |
| src/app/(main)/watchlist/page.tsx | 40 | 215 | 1 | 1 | 13 | Low |
| src/components/home/banner-slider.tsx | 40 | 201 | 2 | 2 | 15 | Low |
| src/components/home/playlists.tsx | 40 | 166 | 0 | 4 | 10 | Low |
| src/components/search/PosterCard.tsx | 40 | 259 | 2 | 0 | 31 | Low |
| src/components/ui/calendar.tsx | 40 | 221 | 0 | 1 | 7 | Low |
| src/components/ui/components/SearchDropdown.tsx | 40 | 263 | 0 | 0 | 8 | Low |
| src/components/ui/filter-chips.tsx | 40 | 212 | 2 | 1 | 16 | Low |
| src/components/ui/optimized-image.tsx | 40 | 157 | 3 | 2 | 12 | Low |
| src/features/community/components/post-comment.tsx | 40 | 195 | 5 | 0 | 9 | Low |
| src/app/(auth)/sign-in/page.tsx | 35 | 235 | 2 | 0 | 14 | Low |
| src/app/(main)/content/page.tsx | 35 | 266 | 1 | 1 | 9 | Low |
| src/app/(main)/courses/[id]/page.tsx | 35 | 295 | 2 | 0 | 12 | Low |
| src/app/(main)/creators/[handler]/CreatorPageContent.tsx | 35 | 263 | 0 | 0 | 13 | Low |
| src/app/(main)/profile/page.tsx | 35 | 256 | 1 | 0 | 13 | Low |
| src/app/(main)/searches/page.tsx | 35 | 210 | 1 | 1 | 3 | Low |
| src/components/ui/mobile-search.tsx | 35 | 197 | 2 | 3 | 12 | Low |
| src/features/shorts/components/short-video-player.tsx | 35 | 196 | 2 | 3 | 15 | Low |
| src/features/video/components/video-comments.tsx | 35 | 146 | 4 | 2 | 10 | Low |
| src/app/(main)/profile/edit-contact/page.tsx | 30 | 110 | 3 | 0 | 7 | Low |
| src/app/(main)/profile/subscription/page.tsx | 30 | 297 | 0 | 0 | 9 | Low |
| src/app/(main)/search/page.tsx | 30 | 266 | 0 | 0 | 8 | Low |
| src/components/search/Rail.tsx | 30 | 181 | 2 | 1 | 16 | Low |
| src/components/search/components/SearchResults.tsx | 30 | 177 | 0 | 0 | 4 | Low |
| src/components/ui/image-lightbox.tsx | 30 | 178 | 1 | 2 | 11 | Low |
| src/components/ui/input.tsx | 30 | 170 | 1 | 0 | 22 | Low |
| src/components/ui/media-card.tsx | 30 | 196 | 2 | 0 | 24 | Low |
| src/features/video/components/single-comment.tsx | 30 | 165 | 4 | 0 | 9 | Low |
| src/app/(main)/contents/shorts/[id]/show/page.tsx | 25 | 187 | 1 | 1 | 11 | Low |
| src/app/(main)/contents/videos/[id]/show/page.tsx | 25 | 189 | 1 | 1 | 11 | Low |
| src/app/(main)/trailer/page.tsx | 25 | 119 | 3 | 1 | 6 | Low |
| src/components/home/components/PreviewMediaInfo.tsx | 25 | 155 | 0 | 0 | 8 | Low |
| src/components/ui/components/MobileSearchResults.tsx | 25 | 177 | 0 | 0 | 3 | Low |
| src/features/video/components/like-button.tsx | 25 | 61 | 3 | 0 | 7 | Low |
| src/app/(auth)/checkout/page.tsx | 20 | 273 | 2 | 1 | 5 | Low |
| src/app/(main)/videos/components/video-card-enhanced.tsx | 20 | 177 | 1 | 0 | 10 | Low |
| src/app/(studio)/studio/settings/page.tsx | 20 | 196 | 3 | 0 | 5 | Low |
| src/components/community/CreatePostCard/index.tsx | 20 | 116 | 3 | 0 | 7 | Low |
| src/components/layout/main-layout.tsx | 20 | 93 | 0 | 2 | 6 | Low |
| src/components/search/components/SearchResultItem.tsx | 20 | 164 | 0 | 0 | 8 | Low |
| src/components/studio/ContentTypeSelector/index.tsx | 20 | 64 | 0 | 0 | 5 | Low |
| src/components/ui/select.tsx | 20 | 211 | 0 | 0 | 1 | Low |
| src/features/community/components/create-post.tsx | 20 | 165 | 2 | 0 | 7 | Low |
| src/features/creator-studio/components/StudioLayout.tsx | 20 | 134 | 0 | 0 | 10 | Low |
| src/features/creator-studio/components/studio-header.tsx | 20 | 204 | 0 | 0 | 4 | Low |
| src/features/shorts/components/mobile-comment-section.tsx | 20 | 161 | 2 | 0 | 7 | Low |
| src/features/video/components/watchlist-button.tsx | 20 | 143 | 2 | 1 | 26 | Low |
| src/app/(main)/community/page.tsx | 15 | 118 | 0 | 0 | 5 | Low |
| src/components/home/components/VerticalSeriesList.tsx | 15 | 132 | 0 | 1 | 7 | Low |
| src/components/home/home-series.tsx | 15 | 73 | 2 | 2 | 6 | Low |
| src/components/home/home-shorts.tsx | 15 | 135 | 1 | 1 | 11 | Low |
| src/components/layout/components/NavbarDesktopNavigation.tsx | 15 | 50 | 0 | 0 | 3 | Low |
| src/components/sections/CreatorProfile/CreatorShortsGrid.tsx | 15 | 93 | 0 | 0 | 2 | Low |
| src/components/sections/CreatorProfile/CreatorVideoGrid.tsx | 15 | 119 | 0 | 0 | 3 | Low |
| src/components/sections/CreatorProfile/tabs/CreatorHomeTab.tsx | 15 | 132 | 0 | 0 | 2 | Low |
| src/components/series/TrailerModal/index.tsx | 15 | 104 | 1 | 2 | 6 | Low |
| src/components/ui/components/MediaCardThumbnail.tsx | 15 | 146 | 0 | 0 | 12 | Low |
| src/components/ui/content-grid.tsx | 15 | 99 | 0 | 0 | 14 | Low |
| src/components/watchlist/WatchlistCard/index.tsx | 15 | 129 | 0 | 0 | 9 | Low |
| src/features/video/components/video-player.tsx | 15 | 52 | 0 | 0 | 11 | Low |
| src/lib/utils/highlightMatch.tsx | 15 | 71 | 0 | 0 | 8 | Low |
| src/app/(auth)/forgot-password/page.tsx | 10 | 142 | 3 | 0 | 5 | Low |
| src/app/(studio)/layout.tsx | 10 | 65 | 1 | 1 | 6 | Low |
| src/components/courses/LessonCardPlayer/index.tsx | 10 | 112 | 0 | 0 | 8 | Low |
| src/components/creator/CreatorCard/index.tsx | 10 | 137 | 0 | 0 | 8 | Low |
| src/components/home/components/HoverCardInfo.tsx | 10 | 133 | 0 | 0 | 7 | Low |
| src/components/home/components/PlaylistRail.tsx | 10 | 91 | 0 | 1 | 7 | Low |
| src/components/home/components/SeriesCard.tsx | 10 | 119 | 0 | 0 | 6 | Low |
| src/components/layout/components/NavbarSearchBar.tsx | 10 | 81 | 0 | 0 | 7 | Low |
| src/components/layout/top-header.tsx | 10 | 155 | 1 | 1 | 4 | Low |
| src/components/sections/CreatorProfile/tabs/shared/InfiniteScrollLoader.tsx | 10 | 53 | 0 | 1 | 6 | Low |
| src/components/ui/Button/Button.tsx | 10 | 119 | 0 | 0 | 9 | Low |
| src/components/ui/ContentGlobe/ContentGlobe.tsx | 10 | 32 | 0 | 0 | 6 | Low |
| src/components/ui/avatar.tsx | 10 | 59 | 0 | 0 | 8 | Low |
| src/components/ui/dropdown-menu.tsx | 10 | 180 | 0 | 0 | 4 | Low |
| src/components/ui/form.tsx | 10 | 173 | 0 | 0 | 4 | Low |
| src/components/ui/page-header.tsx | 10 | 111 | 0 | 0 | 10 | Low |
| src/components/ui/spinner.tsx | 10 | 106 | 0 | 1 | 7 | Low |
| src/features/series/components/player-episode-card.tsx | 10 | 96 | 0 | 0 | 7 | Low |
| src/features/series/components/series-channel-info.tsx | 10 | 51 | 0 | 0 | 6 | Low |
| src/features/shorts/components/desktop-comment-section.tsx | 10 | 140 | 2 | 0 | 7 | Low |
| src/features/video/components/autoplay-button.tsx | 10 | 57 | 1 | 1 | 6 | Low |
| src/features/video/components/like-dislike-button-group.tsx | 10 | 93 | 1 | 0 | 9 | Low |
| src/features/video/components/save-button.tsx | 10 | 61 | 2 | 1 | 7 | Low |
| src/app/(auth)/forgot-password/layout.tsx | 0 | 32 | 0 | 0 | 0 | Low |
| src/app/(auth)/layout.tsx | 0 | 29 | 0 | 0 | 0 | Low |
| src/app/(auth)/login/page.tsx | 0 | 6 | 0 | 0 | 0 | Low |
| src/app/(auth)/plans/page.tsx | 0 | 6 | 0 | 0 | 0 | Low |
| src/app/(auth)/register/layout.tsx | 0 | 32 | 0 | 0 | 0 | Low |
| src/app/(auth)/sign-up/page.tsx | 0 | 6 | 0 | 0 | 0 | Low |
| src/app/(auth)/signup/page.tsx | 0 | 6 | 0 | 0 | 0 | Low |
| src/app/(main)/choose-plan/page.tsx | 0 | 30 | 0 | 0 | 0 | Low |
| src/app/(main)/community/[post]/loading.tsx | 0 | 7 | 0 | 0 | 0 | Low |
| src/app/(main)/courses/[id]/loading.tsx | 0 | 7 | 0 | 0 | 0 | Low |
| src/app/(main)/courses/[id]/play/[videoUuid]/loading.tsx | 0 | 7 | 0 | 0 | 0 | Low |
| src/app/(main)/courses/loading.tsx | 0 | 7 | 0 | 0 | 0 | Low |
| src/app/(main)/courses/page.tsx | 0 | 63 | 0 | 0 | 3 | Low |
| src/app/(main)/creators/[handler]/loading.tsx | 0 | 6 | 0 | 0 | 0 | Low |
| src/app/(main)/creators/[handler]/page.tsx | 0 | 37 | 0 | 0 | 1 | Low |
| src/app/(main)/creators/loading.tsx | 0 | 22 | 0 | 0 | 0 | Low |
| src/app/(main)/creators/page.tsx | 0 | 86 | 0 | 0 | 2 | Low |
| src/app/(main)/globe/page.tsx | 0 | 17 | 0 | 0 | 0 | Low |
| src/app/(main)/home/home-content.tsx | 0 | 62 | 2 | 1 | 1 | Low |
| src/app/(main)/home/page.tsx | 0 | 78 | 0 | 0 | 0 | Low |
| src/app/(main)/layout.tsx | 0 | 11 | 0 | 0 | 0 | Low |
| src/app/(main)/payment/manage-apple/page.tsx | 0 | 127 | 0 | 0 | 1 | Low |
| src/app/(main)/series/[slug]/loading.tsx | 0 | 7 | 0 | 0 | 0 | Low |
| src/app/(main)/series/[slug]/play/[videoUuid]/loading.tsx | 0 | 7 | 0 | 0 | 0 | Low |
| src/app/(main)/series/[slug]/play/[videoUuid]/page.tsx | 0 | 67 | 0 | 1 | 4 | Low |
| src/app/(main)/series/page.tsx | 0 | 61 | 0 | 0 | 1 | Low |
| src/app/(main)/series-player/page.tsx | 0 | 36 | 0 | 1 | 2 | Low |
| src/app/(main)/shorts/[uuid]/loading.tsx | 0 | 7 | 0 | 0 | 0 | Low |
| src/app/(main)/video-player/page.tsx | 0 | 34 | 0 | 1 | 2 | Low |
| src/app/(main)/videos/[id]/loading.tsx | 0 | 6 | 0 | 0 | 0 | Low |
| src/app/(main)/videos/components/select-filter.tsx | 0 | 34 | 0 | 0 | 0 | Low |
| src/app/(main)/videos/components/video-grid-skeleton.tsx | 0 | 23 | 0 | 0 | 1 | Low |
| src/app/(main)/videos/loading.tsx | 0 | 7 | 0 | 0 | 0 | Low |
| src/app/(studio)/__tests__/upload-posts.test.tsx | 0 | 32 | 0 | 0 | 0 | Low |
| src/app/(studio)/__tests__/upload-short.test.tsx | 0 | 32 | 0 | 0 | 0 | Low |
| src/app/(studio)/__tests__/upload-video.test.tsx | 0 | 39 | 0 | 0 | 1 | Low |
| src/app/(studio)/studio/payouts/page.tsx | 0 | 94 | 1 | 1 | 3 | Low |
| src/app/layout.tsx | 0 | 100 | 0 | 0 | 0 | Low |
| src/app/page.tsx | 0 | 6 | 0 | 0 | 0 | Low |
| src/components/community/FeedPost/index.tsx | 0 | 18 | 0 | 0 | 1 | Low |
| src/components/community/PostDetailSkeleton/index.tsx | 0 | 53 | 0 | 0 | 0 | Low |
| src/components/community/PostSkeleton/index.tsx | 0 | 26 | 0 | 0 | 0 | Low |
| src/components/courses/CourseCard/index.tsx | 0 | 88 | 0 | 0 | 1 | Low |
| src/components/courses/CoursePageSkeleton/index.tsx | 0 | 40 | 0 | 0 | 0 | Low |
| src/components/courses/CoursePlayerPageSkeleton/index.tsx | 0 | 43 | 0 | 0 | 0 | Low |
| src/components/courses/LessonCard/index.tsx | 0 | 101 | 0 | 0 | 3 | Low |
| src/components/creator/CreatorCardSkeleton/index.tsx | 0 | 25 | 0 | 0 | 0 | Low |
| src/components/creator/CreatorProfileSkeleton/index.tsx | 0 | 38 | 0 | 0 | 0 | Low |
| src/components/feature/feature-wrapper.tsx | 0 | 64 | 0 | 0 | 4 | Low |
| src/components/home/components/HoverCardActions.tsx | 0 | 45 | 0 | 0 | 2 | Low |
| src/components/home/components/HoverCardVideoPreview.tsx | 0 | 99 | 0 | 0 | 2 | Low |
| src/components/home/components/PreviewVideoPlayer.tsx | 0 | 108 | 0 | 0 | 4 | Low |
| src/components/home/components/SeriesSection.tsx | 0 | 32 | 0 | 0 | 2 | Low |
| src/components/home/components/SeriesSkeleton.tsx | 0 | 37 | 0 | 0 | 0 | Low |
| src/components/home/components/ShortCard.tsx | 0 | 61 | 0 | 0 | 0 | Low |
| src/components/home/end-of-content-message.tsx | 0 | 40 | 0 | 0 | 1 | Low |
| src/components/home/featured.tsx | 0 | 86 | 1 | 1 | 4 | Low |
| src/components/home/recommended.tsx | 0 | 86 | 1 | 1 | 4 | Low |
| src/components/home/section-card.tsx | 0 | 32 | 0 | 0 | 2 | Low |
| src/components/layout/auth-layout.tsx | 0 | 96 | 0 | 0 | 2 | Low |
| src/components/layout/components/NavbarMobileMenu.tsx | 0 | 89 | 0 | 0 | 2 | Low |
| src/components/layout/components/NavbarUserMenu.tsx | 0 | 122 | 0 | 0 | 3 | Low |
| src/components/layout/footer.tsx | 0 | 86 | 0 | 0 | 2 | Low |
| src/components/layout/navbar.tsx | 0 | 116 | 2 | 1 | 4 | Low |
| src/components/navigation/NavigationProgress.tsx | 0 | 68 | 2 | 1 | 4 | Low |
| src/components/providers/creators-provider.tsx | 0 | 16 | 0 | 0 | 0 | Low |
| src/components/search/SearchInput.tsx | 0 | 39 | 1 | 0 | 3 | Low |
| src/components/search/components/RecentSearches.tsx | 0 | 54 | 0 | 0 | 2 | Low |
| src/components/search/components/TopResultPreview.tsx | 0 | 79 | 0 | 0 | 1 | Low |
| src/components/sections/CreatorProfile/CreatorFeaturedVideo.tsx | 0 | 99 | 0 | 0 | 0 | Low |
| src/components/sections/CreatorProfile/CreatorHeader.tsx | 0 | 140 | 0 | 0 | 0 | Low |
| src/components/sections/CreatorProfile/CreatorTabs.tsx | 0 | 36 | 0 | 0 | 1 | Low |
| src/components/sections/CreatorProfile/tabs/CreatorEducationTab.tsx | 0 | 72 | 0 | 0 | 5 | Low |
| src/components/sections/CreatorProfile/tabs/CreatorPostsTab.tsx | 0 | 77 | 0 | 0 | 5 | Low |
| src/components/sections/CreatorProfile/tabs/CreatorSeriesTab.tsx | 0 | 72 | 0 | 0 | 5 | Low |
| src/components/sections/CreatorProfile/tabs/CreatorShortsTab.tsx | 0 | 69 | 0 | 0 | 5 | Low |
| src/components/sections/CreatorProfile/tabs/CreatorVideosTab.tsx | 0 | 69 | 0 | 0 | 5 | Low |
| src/components/sections/CreatorProfile/tabs/shared/TabSkeletons.tsx | 0 | 104 | 0 | 0 | 4 | Low |
| src/components/series/EpisodeCard/index.tsx | 0 | 84 | 0 | 0 | 5 | Low |
| src/components/series/PlayerPageSkeleton/index.tsx | 0 | 43 | 0 | 0 | 0 | Low |
| src/components/series/SeriesCardSkeleton/index.tsx | 0 | 16 | 0 | 0 | 0 | Low |
| src/components/series/SeriesPageSkeleton/index.tsx | 0 | 38 | 0 | 0 | 0 | Low |
| src/components/series/SeriesPremiumCard/index.tsx | 0 | 90 | 0 | 0 | 3 | Low |
| src/components/shorts/ShortPlayerSkeleton/index.tsx | 0 | 9 | 0 | 0 | 0 | Low |
| src/components/sidebar/app-sidebar.tsx | 0 | 137 | 0 | 0 | 1 | Low |
| src/components/sidebar/nav-main.tsx | 0 | 43 | 0 | 0 | 1 | Low |
| src/components/sidebar/nav-user.tsx | 0 | 75 | 0 | 0 | 3 | Low |
| src/components/sidebar/studio-sidebar.tsx | 0 | 126 | 0 | 0 | 3 | Low |
| src/components/studio/ActionCard/index.tsx | 0 | 32 | 0 | 0 | 1 | Low |
| src/components/studio/ComingSoonItem/index.tsx | 0 | 14 | 0 | 0 | 0 | Low |
| src/components/studio/QuickLinkCard/index.tsx | 0 | 33 | 0 | 0 | 0 | Low |
| src/components/studio/StatCard/index.tsx | 0 | 27 | 0 | 0 | 0 | Low |
| src/components/ui/Heading/Heading.tsx | 0 | 37 | 0 | 0 | 1 | Low |
| src/components/ui/Text/Text.tsx | 0 | 30 | 0 | 0 | 2 | Low |
| src/components/ui/VerifiedBadge/index.tsx | 0 | 36 | 0 | 0 | 1 | Low |
| src/components/ui/button.tsx | 0 | 63 | 0 | 0 | 2 | Low |
| src/components/ui/card.tsx | 0 | 111 | 0 | 0 | 0 | Low |
| src/components/ui/collapsible.tsx | 0 | 12 | 0 | 0 | 0 | Low |
| src/components/ui/components/MediaCardContent.tsx | 0 | 94 | 0 | 0 | 5 | Low |
| src/components/ui/components/MobileRecentSearches.tsx | 0 | 52 | 0 | 0 | 1 | Low |
| src/components/ui/components/MobileSearchHeader.tsx | 0 | 69 | 0 | 0 | 0 | Low |
| src/components/ui/components/SearchInput.tsx | 0 | 86 | 0 | 0 | 2 | Low |
| src/components/ui/filter-select.tsx | 0 | 32 | 0 | 0 | 0 | Low |
| src/components/ui/logo.tsx | 0 | 82 | 0 | 0 | 4 | Low |
| src/components/ui/native-select.tsx | 0 | 54 | 0 | 0 | 1 | Low |
| src/components/ui/popover.tsx | 0 | 49 | 0 | 0 | 0 | Low |
| src/components/ui/separator.tsx | 0 | 27 | 0 | 0 | 1 | Low |
| src/components/ui/sheet.tsx | 0 | 126 | 0 | 0 | 0 | Low |
| src/components/ui/skeleton.tsx | 0 | 8 | 0 | 0 | 0 | Low |
| src/components/ui/tooltip.tsx | 0 | 33 | 0 | 0 | 0 | Low |
| src/components/video/VideoCard/index.tsx | 0 | 82 | 0 | 0 | 4 | Low |
| src/components/video/VideoCardSkeleton/index.tsx | 0 | 11 | 0 | 0 | 0 | Low |
| src/components/video/VideoEmptyState/index.tsx | 0 | 12 | 0 | 0 | 0 | Low |
| src/components/video/VideoPlayerSkeleton/index.tsx | 0 | 11 | 0 | 0 | 0 | Low |
| src/components/watchlist/WatchlistCardSkeleton/index.tsx | 0 | 20 | 0 | 0 | 0 | Low |
| src/features/community/components/community-sidebar.tsx | 0 | 45 | 0 | 0 | 3 | Low |
| src/features/community/components/post-comment-area.tsx | 0 | 109 | 2 | 1 | 5 | Low |
| src/features/community/components/post-reactions.tsx | 0 | 59 | 2 | 0 | 2 | Low |
| src/features/series/components/series-action-buttons.tsx | 0 | 71 | 0 | 0 | 3 | Low |
| src/features/series/components/series-breadcrumb.tsx | 0 | 40 | 0 | 0 | 1 | Low |
| src/features/series/components/series-channel-and-actions.tsx | 0 | 45 | 0 | 0 | 1 | Low |
| src/features/series/components/series-description.tsx | 0 | 41 | 0 | 0 | 1 | Low |
| src/features/series/components/series-episode-indicator.tsx | 0 | 34 | 0 | 0 | 2 | Low |
| src/features/series/components/series-player-content.tsx | 0 | 80 | 1 | 0 | 0 | Low |
| src/features/series/components/series-player-error-state.tsx | 0 | 18 | 0 | 0 | 0 | Low |
| src/features/series/components/series-player-main-content.tsx | 0 | 86 | 0 | 0 | 1 | Low |
| src/features/series/components/series-player-sidebar.tsx | 0 | 81 | 0 | 0 | 2 | Low |
| src/features/series/components/series-video-player.tsx | 0 | 59 | 0 | 0 | 0 | Low |
| src/features/series/components/up-next-overlay.tsx | 0 | 110 | 0 | 0 | 2 | Low |
| src/features/shorts/components/desktop-action-buttons.tsx | 0 | 47 | 0 | 0 | 2 | Low |
| src/features/shorts/components/mobile-action-buttons.tsx | 0 | 69 | 0 | 0 | 2 | Low |
| src/features/shorts/components/short-header.tsx | 0 | 71 | 0 | 0 | 2 | Low |
| src/features/video/components/video-player-wrapper.tsx | 0 | 41 | 0 | 0 | 3 | Low |
| src/features/video/components/video-right-sidebar-card.tsx | 0 | 107 | 1 | 1 | 5 | Low |
| src/shared/components/error-boundary.tsx | 0 | 90 | 0 | 0 | 4 | Low |
| src/shared/components/providers/query-provider.tsx | 0 | 25 | 0 | 0 | 0 | Low |
