---
name: implement-hover-card
description: Implement Netflix-style hover cards with overflow expansion
triggers:
  - Netflix hover card
  - overflow expansion
  - hover preview
  - card expand on hover
---

# Implement Netflix-Style Hover Card

This skill implements the "Overflow Expansion Pattern" for Netflix-style hover cards that scale/expand without clipping.

## Problem

When implementing hover cards that expand within horizontal scroll containers:
1. Expanded cards get clipped by `overflow: hidden` on parents
2. Cards overlap incorrectly with neighbors or sections below
3. Content gets cut off when expanding

## Solution: Multi-Layer Approach

### 1. Padding-Margin Compensation (Space Reservation)

Reserve space for expansion using padding, then pull it back with negative margins:

```tsx
// Scroll container
className="flex gap-4 pt-16 -mt-16 pb-40 -mb-32"
```

- `pt-16 -mt-16` - Reserves 64px above for upward expansion
- `pb-40 -mb-32` - Reserves 160px below (net 32px visual space)

### 2. Overflow Visible

```css
.netflix-scroll-container {
  overflow: visible !important;
}

.group\/section {
  overflow: visible !important;
}
```

### 3. Z-Index with CSS :has()

Raise entire section when it contains a hovered card:

```css
section {
  position: relative;
  z-index: 1;
}

section:has(.netflix-card-wrapper:hover) {
  z-index: 50;
}

.netflix-card-wrapper {
  position: relative;
  z-index: 1;
}

.netflix-card-wrapper:hover {
  z-index: 100;
}
```

### 4. Transform Origin for Edge Cards

Prevent edge cards from expanding off-screen:

```tsx
const getTransformOrigin = () => {
  if (index === 0) return 'left center';      // First card expands right
  if (index >= 4) return 'right center';      // Last cards expand left
  return 'center center';                      // Middle cards expand both ways
};
```

## Complete Implementation

### Scroll Container

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

### Card Component

```tsx
const [isExpanded, setIsExpanded] = useState(false);
const hoverTimeoutRef = useRef<NodeJS.Timeout>();

const handleMouseEnter = () => {
  hoverTimeoutRef.current = setTimeout(() => {
    setIsExpanded(true);
  }, 300);  // 300ms delay before expansion
};

const handleMouseLeave = () => {
  if (hoverTimeoutRef.current) {
    clearTimeout(hoverTimeoutRef.current);
  }
  setIsExpanded(false);
};

const getTransformOrigin = () => {
  if (index === 0) return 'left center';
  if (index >= 4) return 'right center';
  return 'center center';
};

return (
  <div
    className="netflix-card-wrapper flex-shrink-0 w-[280px] relative"
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    style={{ zIndex: isExpanded ? 100 : 1 }}
  >
    <div
      className={cn(
        'netflix-card relative transition-all duration-300 ease-out',
        isExpanded && 'netflix-card-expanded'
      )}
      style={{
        transformOrigin: getTransformOrigin(),
        transform: isExpanded ? 'scale(1.4)' : 'scale(1)',
      }}
    >
      {/* Thumbnail */}
      <div className="aspect-video rounded-lg overflow-hidden">
        {isExpanded && video.preview_url ? (
          <video
            src={video.preview_url}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Info panel (shown on expand) */}
      {isExpanded && (
        <div className="netflix-card-info bg-surface p-4 rounded-b-lg">
          <h3 className="title-card line-clamp-1">{video.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <button className="btn-primary">Play</button>
            <button className="btn-secondary">+ My List</button>
          </div>
        </div>
      )}
    </div>
  </div>
);
```

### Required CSS (globals.css)

```css
/* Netflix-style Hover Cards */
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

## Key Techniques Summary

| Technique | Purpose |
|-----------|---------|
| `pt-X -mt-X` | Reserve space above for upward expansion |
| `pb-X -mb-X` | Reserve space below for downward expansion |
| `overflow: visible` | Allow content to overflow container bounds |
| `section:has(:hover)` | Raise entire section's stacking context |
| `transform-origin` | Control expansion direction for edge cards |
| `z-index: 100` on hover | Ensure hovered card appears above siblings |

## Browser Support

CSS `:has()` requires modern browsers:
- Chrome 105+
- Safari 15.4+
- Firefox 121+

For older browsers, use JavaScript to add a class to parent sections on hover.
