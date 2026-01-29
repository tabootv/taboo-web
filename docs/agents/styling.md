# Styling & Design System

> **When to use:** Building components, styling layouts, using design tokens, working with Tailwind CSS.

---

## Design System Essentials

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#ab0013` | Actions, accents, brand |
| **Hover** | `#d4001a` | Hover states |
| **Dark** | `#8a0010` | Pressed states |
| **Deep** | `#7a000e` | Deep gradients |

**Background:**
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#000000` | Page background |
| `--surface` | `#0d0d0d` | Cards, surfaces |
| `--surface-hover` | `#161616` | Hover states |
| `--border` | `#1f1f1f` | Default borders |

**Text:**
| Token | Hex | Opacity | Usage |
|-------|-----|---------|-------|
| Primary | `#e6e7ea` | 90% | Headlines, primary text |
| Secondary | `#9aa0a6` | 60% | Descriptions |
| Tertiary | `#6b7280` | 42% | Timestamps, hints |

---

## Typography Classes

Use these classes for consistency:

### Headlines
```tsx
<h1 className="title-hero">Featured Content</h1>      {/* 36-48px */}
<h1 className="title-page">Videos</h1>                {/* 24-30px */}
<h2 className="title-section">Popular This Week</h2>  {/* 18-20px */}
```

### Body Text
```tsx
<p className="body-large">Large description</p>       {/* 18px */}
<p className="body-base">Regular text</p>             {/* 16px */}
<p className="body-small">Metadata text</p>           {/* 14px */}
```

### Labels & Captions
```tsx
<span className="label">CATEGORY</span>               {/* Uppercase */}
<span className="caption">2 hours ago</span>          {/* 12px */}
```

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `p-1` | 4px | Tight gaps |
| `p-2` | 8px | Icon gaps |
| `p-3` | 12px | Small padding |
| `p-4` | 16px | Default padding |
| `p-6` | 24px | Card padding |
| `p-8` | 32px | Section gaps |

```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Responsive padding: 16px → 24px → 32px */}
</div>
```

---

## cn() Utility for Conditional Classes

Import from `@/shared/utils/formatting`:

```tsx
import { cn } from '@/shared/utils/formatting';

// Combine classes conditionally
<button className={cn(
  'px-4 py-2 rounded-lg font-semibold',
  isActive && 'bg-red-primary text-white',
  !isActive && 'bg-surface text-secondary',
)}>
  Click me
</button>
```

---

## Component Library

### PageHeader
```tsx
import { PageHeader } from '@/components/ui';

<PageHeader
  title="Videos"
  subtitle="Browse all"
  actions={<FilterChips ... />}
  variant="default"  // or 'large', 'hero'
/>
```

### MediaCard
```tsx
import { MediaCard } from '@/components/ui';

<MediaCard
  type="video"  // or 'short', 'series'
  title="Amazing Video"
  thumbnail="/thumb.jpg"
  duration={320}
  channel={{ name: "Creator", avatar: "/avatar.jpg" }}
  isNsfw={false}
  isPremium={false}
/>
```

### ContentGrid
```tsx
import { ContentGrid } from '@/components/ui';

// Standard media grid (responsive: 1 → 2 → 3 → 4 → 5 columns)
<ContentGrid variant="media">
  {videos.map(v => <MediaCard key={v.id} {...v} />)}
</ContentGrid>

// Series grid
<ContentGrid variant="series">
  {series.map(s => <MediaCard key={s.id} type="series" {...s} />)}
</ContentGrid>

// Posts feed (1 column)
<ContentGrid variant="posts">
  {posts.map(p => <PostCard key={p.id} {...p} />)}
</ContentGrid>
```

### FilterChips
```tsx
import { FilterChips } from '@/components/ui';

<FilterChips
  options={[
    { id: 'all', label: 'All' },
    { id: 'popular', label: 'Popular' },
    { id: 'recent', label: 'Recent' },
  ]}
  selected="all"
  onSelect={setFilter}
  variant="default"  // or 'pills', 'underline'
/>
```

---

## Button Styles

### Primary Button
```tsx
<button className="px-6 py-3 bg-red-primary hover:bg-red-hover rounded-lg font-semibold text-white transition-all">
  Action
</button>
```

### Secondary Button
```tsx
<button className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg font-semibold text-white transition-all">
  Secondary
</button>
```

---

## Card Styling

```tsx
<div className="bg-surface border border-border rounded-lg overflow-hidden hover:translate-y-[-4px] hover:shadow-lg transition-all">
  {/* Content */}
</div>
```

### Video Thumbnail Card
```tsx
<div className="relative aspect-video bg-surface rounded-lg overflow-hidden">
  <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
  <span className="absolute bottom-2 right-2 bg-black/85 text-white text-xs px-2 py-1 rounded">
    {formatDuration(duration)}
  </span>
</div>
```

---

## Atmospheric Backgrounds

For premium feel, use atmospheric backgrounds:

```tsx
<div className="series-page-atmosphere min-h-screen">
  <div className="series-atmosphere-bg" />
  <div className="relative z-10">
    {/* Your content */}
  </div>
</div>
```

Available backgrounds:
- `.series-page-atmosphere` + `.series-atmosphere-bg`
- `.creators-page-atmosphere` + `.creators-atmosphere-bg`
- `.studio-page-atmosphere` + `.studio-atmosphere-bg`

---

## Responsive Design

### Tailwind Breakpoints

| Breakpoint | Width | Class |
|-----------|-------|-------|
| Mobile | Default | (no prefix) |
| Tablet | 768px+ | `md:` |
| Desktop | 1024px+ | `lg:` |
| XL | 1280px+ | `xl:` |

### Page Padding Pattern

```tsx
<div className="px-4 md:px-6 lg:px-8">
  {/* Responsive padding: 16px → 24px → 32px */}
</div>
```

### Content Width

```tsx
<div className="max-w-[1400px] mx-auto">
  {/* Standard page width */}
</div>

<div className="max-w-[800px] mx-auto">
  {/* Narrow (forms, settings) */}
</div>
```

---

## Icons

Use **lucide-react** for all icons:

```tsx
import { Heart, Play, Share2, MoreVertical } from 'lucide-react';

<button>
  <Heart size={24} className="text-red-primary" />
</button>

<button>
  <Play size={32} className="fill-white" />
</button>
```

---

## Design Tokens File

All design values are centralized in `src/shared/lib/design-tokens.ts`:

```tsx
import { colors, spacing, typography, borderRadius } from '@/shared/lib/design-tokens';
```

---

## Best Practices

✅ **DO:**
- Use design tokens instead of hardcoded colors
- Use typography classes (`title-page`, `body-base`)
- Use the component library
- Follow the spacing scale (4, 8, 12, 16, 24, 32px)
- Use `cn()` for conditional classes
- Apply hover effects consistently
- Use atmospheric backgrounds for premium feel

❌ **DON'T:**
- Hardcode colors like `#ff0000`
- Use arbitrary sizes (`p-[15px]`)
- Create custom card styles (use MediaCard)
- Mix Tailwind units with custom spacing
- Forget responsive prefixes

---

## Reference

- **Design tokens:** `src/shared/lib/design-tokens.ts`
- **UI components:** `src/components/ui/`
- **Formatting utils:** `src/shared/utils/formatting.ts`
- **Global styles:** `src/app/globals.css`
