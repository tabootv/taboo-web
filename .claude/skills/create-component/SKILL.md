---
name: create-component
description: Create UI components following the TabooTV design system
triggers:
  - create component
  - add UI element
  - make button
  - make card
  - new component
---

# Create Component

This skill guides creation of UI components following the TabooTV design system.

## Design Tokens

Import design values from `src/lib/design-tokens.ts`:

```typescript
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/design-tokens';
```

## Color Palette

### Primary (Taboo Red)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#ab0013` | Primary actions, accents |
| Hover | `#d4001a` | Hover states |
| Dark | `#8a0010` | Pressed states |

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#000000` | Page background |
| Surface | `#0d0d0d` | Cards, modals |
| Surface Hover | `#161616` | Hover states |
| Card | `#131315` | Card backgrounds |
| Border | `#1f1f1f` | Default borders |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#e6e7ea` | Headlines, primary text |
| Secondary | `#9aa0a6` | Descriptions, metadata |
| Tertiary | `#6b7280` | Timestamps, hints |

## Typography Classes

```tsx
<h1 className="title-hero">Hero Title</h1>      // 36-48px
<h1 className="title-page">Page Title</h1>      // 24-30px
<h2 className="title-section">Section</h2>      // 18-20px
<h3 className="title-card">Card Title</h3>      // 16px
<p className="body-large">Large body</p>        // 18px
<p className="body-base">Regular text</p>       // 16px
<p className="body-small">Metadata</p>          // 14px
<span className="label">CATEGORY</span>         // 14px uppercase
<span className="caption">2 hours ago</span>    // 12px
```

## Component Examples

### Button (Primary)
```tsx
<button className="inline-flex items-center justify-center px-6 py-3 bg-[#ab0013] text-white text-sm font-semibold rounded-xl border-none cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-[#d4001a] hover:shadow-[0_0_30px_rgba(171,0,19,0.4)] hover:-translate-y-0.5 active:translate-y-0">
  Button Text
</button>
```

### Card
```tsx
<div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:bg-[#161616] hover:shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(171,0,19,0.3)] hover:border-[rgba(171,0,19,0.3)]">
  {/* Card content */}
</div>
```

### Input
```tsx
<input
  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[#e6e7ea] text-sm transition-all duration-200 placeholder:text-[#6b7280] focus:outline-none focus:border-[#ab0013] focus:shadow-[0_0_0_3px_rgba(171,0,19,0.1)]"
  placeholder="Enter text..."
/>
```

### Glass Effect
```tsx
<div className="bg-[rgba(13,13,13,0.85)] backdrop-blur-[24px] border border-[rgba(31,31,31,0.5)]">
  {/* Glassmorphism content */}
</div>
```

## Existing UI Components

Import from `@/components/ui`:

### PageHeader
```tsx
import { PageHeader } from '@/components/ui';

<PageHeader
  title="Page Title"
  subtitle="Optional description"
  backHref="/previous"  // Optional back button
  actions={<FilterChips ... />}  // Optional action slot
  variant="default"  // 'default' | 'large' | 'hero'
/>
```

### FilterChips
```tsx
import { FilterChips } from '@/components/ui';

<FilterChips
  options={[
    { id: 'all', label: 'All' },
    { id: 'popular', label: 'Popular' },
  ]}
  selected="all"
  onSelect={(id) => setFilter(id)}
  variant="default"  // 'default' | 'pills' | 'underline'
/>
```

### MediaCard
```tsx
import { MediaCard } from '@/components/ui';

<MediaCard
  id={1}
  uuid="abc123"
  type="video"  // 'video' | 'short' | 'series'
  title="Video Title"
  thumbnail="/thumb.jpg"
  duration={320}
  views={15000}
  channel={{ name: 'Creator', slug: 'creator', avatar: '/avatar.jpg' }}
/>
```

### ContentGrid
```tsx
import { ContentGrid } from '@/components/ui';

<ContentGrid variant="media">  {/* 'media' | 'series' | 'creator' | 'shorts' | 'posts' */}
  {items.map(item => <MediaCard key={item.id} {...item} />)}
</ContentGrid>
```

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| 1 | 4px | Tight gaps |
| 2 | 8px | Icon gaps |
| 3 | 12px | Small padding |
| 4 | 16px | Default padding |
| 6 | 24px | Card padding |
| 8 | 32px | Section gaps |

## Page Padding

```tsx
<div className="px-4 md:px-6 lg:px-8">  {/* 16px → 24px → 32px */}
```

## Border Radius

- Buttons, Inputs: `rounded-xl` (12px)
- Cards: `rounded-2xl` (16px)
- Thumbnails: `rounded-xl` (12px)
- Avatars: `rounded-full`
- Chips/Pills: `rounded-full`

## Using cn() Utility

Always use `cn()` from `@/lib/utils` for conditional classes:

```tsx
import { cn } from '@/lib/utils';

<button className={cn(
  'px-4 py-2 rounded-xl',
  isActive && 'bg-[#ab0013] text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
```

## Atmospheric Backgrounds

For premium feel on content pages:

```tsx
<div className="series-page-atmosphere min-h-screen">
  <div className="series-atmosphere-bg" />
  <div className="relative z-10">
    {/* Page content */}
  </div>
</div>
```

Available: `.series-page-atmosphere`, `.creators-page-atmosphere`, `.studio-page-atmosphere`
