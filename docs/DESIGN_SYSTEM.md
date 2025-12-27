# TabooTV Design System

A unified design language for the TabooTV streaming platform, providing consistency, polish, and premium UX quality across all pages.

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Typography](#typography)
3. [Colors](#colors)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Page Layout Standards](#page-layout-standards)
7. [Migration Guide](#migration-guide)

---

## Design Tokens

All design values are centralized in `src/lib/design-tokens.ts`. Import and use these tokens for consistent styling:

```typescript
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/design-tokens';
```

---

## Typography

### Scale (Major Third - 1.25 ratio)

| Token | Size | Use Case |
|-------|------|----------|
| `--text-xs` | 12px | Captions, timestamps |
| `--text-sm` | 14px | Body small, metadata |
| `--text-base` | 16px | Body text |
| `--text-lg` | 18px | Large body, card titles |
| `--text-xl` | 20px | Section titles |
| `--text-2xl` | 24px | Page titles (mobile) |
| `--text-3xl` | 30px | Page titles (desktop) |
| `--text-4xl` | 36px | Hero titles (mobile) |
| `--text-5xl` | 48px | Hero titles (desktop) |

### Typography Classes

Use these pre-built classes for consistent text styling:

```html
<!-- Hero titles (homepage, featured) -->
<h1 class="title-hero">Featured Content</h1>

<!-- Page titles -->
<h1 class="title-page">Videos</h1>

<!-- Section titles -->
<h2 class="title-section">Popular This Week</h2>

<!-- Card titles -->
<h3 class="title-card">Video Title</h3>

<!-- Body text -->
<p class="body-large">Description text</p>
<p class="body-base">Regular text</p>
<p class="body-small">Metadata text</p>

<!-- Labels & Captions -->
<span class="label">CATEGORY</span>
<span class="caption">2 hours ago</span>
```

---

## Colors

### Background Hierarchy

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | #000000 | Page background |
| `--surface` | #0d0d0d | Cards, modals |
| `--surface-hover` | #161616 | Hover states |
| `bg-card` | #131315 | Elevated cards |

### Taboo Red (Brand)

| Token | Hex | Usage |
|-------|-----|-------|
| `--red-primary` | #ab0013 | Primary actions, accents |
| `--red-hover` | #d4001a | Hover states |
| `--red-dark` | #8a0010 | Pressed states |
| `--red-deep` | #7a000e | Gradients |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | #e6e7ea | Headings, primary text |
| `--text-secondary` | #9aa0a6 | Descriptions, metadata |

---

## Spacing

### Scale

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-1` | 4px | Tight gaps |
| `spacing-2` | 8px | Icon gaps |
| `spacing-3` | 12px | Small padding |
| `spacing-4` | 16px | Default padding |
| `spacing-6` | 24px | Card padding |
| `spacing-8` | 32px | Section gaps |
| `spacing-10` | 40px | Large gaps |

### Page Spacing

- **Horizontal Padding**: 16px (mobile) → 24px (tablet) → 32px (desktop)
- **Max Content Width**: 1400px (default), 800px (narrow), 1600px (wide)
- **Section Gap**: 40px between major sections
- **Header to Content Gap**: 32px

---

## Components

### PageHeader

Unified page header with optional back button and filters.

```tsx
import { PageHeader } from '@/components/ui';

// Basic
<PageHeader title="Videos" subtitle="Browse all videos" />

// With back button
<PageHeader
  title="Upload Video"
  subtitle="Share your content"
  backHref="/studio"
/>

// With filters
<PageHeader
  title="Series"
  actions={<FilterChips options={filters} selected={filter} onSelect={setFilter} />}
/>
```

**Props:**
- `title` (string): Main title
- `subtitle?` (string): Optional subtitle
- `backHref?` (string): Back navigation link
- `actions?` (ReactNode): Filter/action slot
- `variant?` ('default' | 'large' | 'hero'): Title size

---

### FilterChips

Consistent filter pills across pages.

```tsx
import { FilterChips } from '@/components/ui';

<FilterChips
  options={[
    { id: 'all', label: 'All' },
    { id: 'popular', label: 'Popular' },
    { id: 'recent', label: 'Recent' },
  ]}
  selected="all"
  onSelect={(id) => setFilter(id)}
  variant="default" // or 'pills', 'underline'
/>
```

**Props:**
- `options` (FilterOption[]): Array of filter options
- `selected` (string): Currently selected filter ID
- `onSelect` (function): Callback when filter changes
- `variant?` ('default' | 'pills' | 'underline'): Visual style
- `scrollable?` (boolean): Enable horizontal scroll on mobile

---

### MediaCard

Unified card for videos, shorts, and series.

```tsx
import { MediaCard } from '@/components/ui';

<MediaCard
  id={1}
  uuid="abc123"
  type="video" // or 'short', 'series'
  title="Amazing Video"
  thumbnail="/thumb.jpg"
  duration={320}
  views={15000}
  channel={{
    name: "Creator",
    slug: "creator",
    avatar: "/avatar.jpg"
  }}
  isNsfw={false}
  isPremium={false}
/>
```

**Props:**
- `id`, `uuid`: Identifiers
- `type` ('video' | 'short' | 'series'): Content type
- `title`, `thumbnail`: Display info
- `duration?` (number): Duration in seconds (videos)
- `episodeCount?` (number): Episodes (series)
- `views?`, `likes?`, `date?`: Metadata
- `channel?`: Creator info
- `isNsfw?`, `isPremium?`: Badges
- `size?` ('sm' | 'md' | 'lg'): Card size

---

### ContentGrid

Responsive grid for content layout.

```tsx
import { ContentGrid } from '@/components/ui';

// Default media grid
<ContentGrid variant="media">
  {videos.map(video => <MediaCard key={video.id} {...video} />)}
</ContentGrid>

// Series grid
<ContentGrid variant="series">
  {series.map(s => <MediaCard key={s.id} type="series" {...s} />)}
</ContentGrid>

// Custom columns
<ContentGrid columns={{ default: 1, sm: 2, lg: 4 }}>
  {items.map(item => <Card key={item.id} />)}
</ContentGrid>
```

**Variants:**
- `media`: 1 → 2 → 3 → 4 → 5 columns
- `creator`: 1 → 2 → 3 → 4 columns
- `series`: 1 → 2 → 3 → 4 columns
- `shorts`: 2 → 3 → 4 → 5 → 6 columns
- `posts`: 1 column (feed layout)

---

## Page Layout Standards

### Standard Page Template

```tsx
export default function ExamplePage() {
  return (
    <div className="series-page-atmosphere min-h-screen">
      {/* Atmospheric Background */}
      <div className="series-atmosphere-bg" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <PageHeader
          title="Page Title"
          subtitle="Description text"
          actions={<FilterChips ... />}
        />

        {/* Content Grid */}
        <ContentGrid variant="media">
          {items.map(item => <MediaCard key={item.id} {...item} />)}
        </ContentGrid>
      </div>
    </div>
  );
}
```

### Page Backgrounds

Use atmospheric backgrounds for premium feel:

- `.series-page-atmosphere` + `.series-atmosphere-bg`: Series/Videos pages
- `.creators-page-atmosphere` + `.creators-atmosphere-bg`: Creator pages
- `.studio-page-atmosphere` + `.studio-atmosphere-bg`: Studio pages

### Consistent Padding

```css
/* Mobile: 16px */
px-4

/* Tablet: 24px */
md:px-6

/* Desktop: 32px */
lg:px-8
```

### Max Content Width

```css
/* Default */
max-w-[1400px]

/* Narrow (forms, settings) */
max-w-[800px]

/* Wide (home, featured) */
max-w-[1600px]
```

---

## Migration Guide

### Step-by-Step for Each Page

1. **Import new components:**
   ```tsx
   import { PageHeader, FilterChips, MediaCard, ContentGrid } from '@/components/ui';
   ```

2. **Replace page header:**
   ```tsx
   // Before
   <h1 className="text-2xl font-bold">Title</h1>

   // After
   <PageHeader title="Title" subtitle="Description" />
   ```

3. **Replace filters:**
   ```tsx
   // Before
   <div className="flex gap-2">
     {filters.map(f => <button>...</button>)}
   </div>

   // After
   <FilterChips options={filters} selected={active} onSelect={setActive} />
   ```

4. **Replace grids:**
   ```tsx
   // Before
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

   // After
   <ContentGrid variant="media">
   ```

5. **Replace cards:**
   ```tsx
   // Before
   <CustomVideoCard video={video} />

   // After
   <MediaCard type="video" {...video} />
   ```

### Page-Specific Updates

#### Videos Page
- Use `PageHeader` with filter actions
- Use `ContentGrid variant="media"`
- Use `MediaCard type="video"`

#### Series Page
- Use `PageHeader` with filter actions
- Use `ContentGrid variant="series"`
- Use `MediaCard type="series"`

#### Creators Page
- Use `PageHeader` with sort dropdown
- Use `ContentGrid variant="creator"`
- Keep existing `CreatorCard` or migrate to new system

#### Community Page
- Use `PageHeader` without filters
- Keep single-column feed layout
- Update post cards to match new styling

#### Studio Pages
- Already updated with typography classes
- Use `PageHeader` with back button
- Use `title-section` for form sections

---

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic color classes** (`text-text-primary`, `bg-surface`)
3. **Use typography classes** (`title-page`, `body-small`) for consistency
4. **Use the component library** instead of custom implementations
5. **Follow the spacing scale** (4, 8, 12, 16, 24, 32px)
6. **Apply hover effects consistently** (card-hover, hover-lift)
7. **Use atmospheric backgrounds** for premium feel
8. **Keep cards unified** - same border radius, shadows, hover states

---

## File Structure

```
src/
├── lib/
│   ├── design-tokens.ts    # All design values
│   └── utils.ts            # Utility functions
├── components/
│   └── ui/
│       ├── index.ts        # Exports
│       ├── page-header.tsx
│       ├── filter-chips.tsx
│       ├── media-card.tsx
│       └── content-grid.tsx
└── app/
    └── globals.css         # CSS variables & utility classes
```

---

## Questions?

Refer to the source files for implementation details:
- [design-tokens.ts](src/lib/design-tokens.ts)
- [globals.css](src/app/globals.css)
- [UI Components](src/components/ui/)
