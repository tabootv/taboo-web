# Netflix-Style Hover Card Pattern

## Pattern Name
**"Overflow Expansion Pattern"** or **"Netflix Hover Card with Stacking Context Management"**

## Problem
When implementing Netflix-style hover cards that scale/expand on hover within a horizontal scroll container:
1. Expanded cards get clipped by parent containers with `overflow: hidden` or `overflow-x: auto`
2. Cards overlap incorrectly (appear under neighboring cards or sections below)
3. Video/image content gets cut off at the top or bottom when expanding

## Solution: Multi-Layer Approach

### 1. Padding-Margin Compensation (Space Reservation)
Reserve space for expansion using padding, then pull it back with negative margins:

```tsx
// Scroll container
className="flex gap-4 pt-16 -mt-16 pb-40 -mb-32"
```

- `pt-16 -mt-16` - Reserves 64px above for upward expansion
- `pb-40 -mb-32` - Reserves 160px below, pulls back 128px (net 32px visual space)

### 2. Overflow Visible on All Parent Containers

```css
/* Scroll container */
.netflix-scroll-container {
  overflow: visible !important;
}

/* Parent section wrapper */
.group\/section {
  overflow: visible !important;
}
```

### 3. Z-Index Stacking with CSS :has() Selector
Cards within the same section stack correctly, but sections are separate stacking contexts. Use `:has()` to raise the entire section when it contains a hovered card:

```css
/* Base section z-index */
section {
  position: relative;
  z-index: 1;
}

/* Raise section containing hovered card above other sections */
section:has(.netflix-card-wrapper:hover),
section:has(.vertical-series-card:hover) {
  z-index: 50;
}

/* Individual card z-index on hover */
.netflix-card-wrapper {
  position: relative;
  z-index: 1;
}

.netflix-card-wrapper:hover {
  z-index: 100;
}
```

### 4. Transform Origin for Edge Cards
Prevent cards at edges from expanding off-screen:

```tsx
const getTransformOrigin = () => {
  if (index === 0) return 'left center';      // First card expands right
  if (index >= 4) return 'right center';      // Last cards expand left
  return 'center center';                      // Middle cards expand both ways
};
```

### 5. Inline Z-Index on Expanded State

```tsx
<div
  className="netflix-card-wrapper"
  style={{ zIndex: isExpanded ? 100 : 1 }}
>
```

## Complete Implementation

### Scroll Container (React/TSX)
```tsx
<div
  ref={scrollRef}
  className="flex gap-4 md:gap-6 pt-16 -mt-16 pb-40 -mb-32 hide-scrollbar scroll-smooth netflix-scroll-container"
  style={{
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    overflowX: 'auto',
    overflowY: 'visible',
  }}
>
  {videos.map((video, index) => (
    <NetflixHoverCard key={video.uuid} video={video} index={index} />
  ))}
</div>
```

### Card Component (React/TSX)
```tsx
<div
  className="netflix-card-wrapper flex-shrink-0 w-[280px] relative"
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  style={{ zIndex: isExpanded ? 100 : 1 }}
>
  <div
    className={`netflix-card relative transition-all duration-300 ease-out ${
      isExpanded ? 'netflix-card-expanded' : ''
    }`}
    style={{
      transformOrigin: getTransformOrigin(),
      transform: isExpanded ? 'scale(1.4)' : 'scale(1)',
    }}
  >
    {/* Card content */}
  </div>
</div>
```

### CSS (globals.css)
```css
/* ============================================
   Netflix-style Hover Cards
   ============================================ */

.netflix-scroll-container {
  overflow: visible !important;
}

.group\/section {
  overflow: visible !important;
}

section {
  position: relative;
  z-index: 1;
}

section:has(.netflix-card-wrapper:hover),
section:has(.vertical-series-card:hover) {
  z-index: 50;
}

.netflix-card-wrapper {
  position: relative;
  z-index: 1;
}

.netflix-card-wrapper:hover {
  z-index: 100;
}

.netflix-card-expanded {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: none;
  border-radius: 8px;
}

.netflix-card-info {
  animation: netflix-info-appear 0.2s ease-out forwards;
  box-shadow: none;
  border: 1px solid var(--border);
  border-top: none;
}

@keyframes netflix-info-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Prompt for AI Implementation

When asking an AI to implement this pattern, use:

> "Implement Netflix-style hover cards using the Overflow Expansion Pattern:
> 1. Use padding-margin compensation (pt-16 -mt-16 pb-40 -mb-32) on scroll container
> 2. Set overflow: visible on scroll container and parent sections
> 3. Use CSS :has() selector to raise entire section z-index when containing hovered card
> 4. Apply transform origin based on card position (left/center/right)
> 5. Set inline z-index: 100 on hovered cards
> 6. Scale cards using transform: scale(1.4) on hover with 300ms transition"

## Key Techniques

| Technique | Purpose |
|-----------|---------|
| `pt-X -mt-X` | Reserve space above for upward expansion |
| `pb-X -mb-X` | Reserve space below for downward expansion |
| `overflow: visible` | Allow content to overflow container bounds |
| `section:has(:hover)` | Raise entire section's stacking context |
| `transform-origin` | Control expansion direction for edge cards |
| `z-index: 100` on hover | Ensure hovered card appears above siblings |

## Browser Support
- CSS `:has()` selector requires modern browsers (Chrome 105+, Safari 15.4+, Firefox 121+)
- For older browser support, use JavaScript to add a class to parent sections on hover
