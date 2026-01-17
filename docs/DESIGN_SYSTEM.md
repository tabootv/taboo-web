# TabooTV Design System

A unified design language for the TabooTV streaming platform, providing consistency, polish, and premium UX quality across all platforms (Web, iOS, Android).

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Colors](#colors)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations & Transitions](#animations--transitions)
7. [Responsive Design](#responsive-design)
8. [CSS Utilities](#css-utilities)
9. [Platform-Specific Exports](#platform-specific-exports)
10. [Page Layout Standards](#page-layout-standards)
11. [Migration Guide](#migration-guide)
12. [Best Practices](#best-practices)

---

## Design Tokens

All design values are centralized in `src/lib/design-tokens.ts`. Import and use these tokens for consistent styling:

```typescript
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/design-tokens';
```

---

## Colors

### Primary Palette (Taboo Red)

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Primary | `#ab0013` | `--red-primary` | Primary actions, accents, brand |
| Hover | `#d4001a` | `--red-hover` | Hover states |
| Dark | `#8a0010` | `--red-dark` | Pressed states, gradients |
| Deep | `#7a000e` | `--red-deep` | Deep gradients |

```css
/* CSS Variables */
--red-primary: #ab0013;
--red-hover: #d4001a;
--red-dark: #8a0010;
--red-deep: #7a000e;
```

### Background Colors

| Token | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Background | `#000000` | `--bg` | Page background |
| Surface | `#0d0d0d` | `--surface` | Cards, modals, elevated surfaces |
| Surface Hover | `#161616` | `--surface-hover` | Hover states on surface |
| Card | `#131315` | `--color-card` | Card backgrounds |
| Elevated | `#1a1a1a` | `--elevated` | Higher elevation |
| Border | `#1f1f1f` | `--border` | Default borders |

### Text Colors

| Token | Hex | Opacity | Usage |
|-------|-----|---------|-------|
| Primary | `#e6e7ea` | 90% | Headlines, primary text |
| Secondary | `#9aa0a6` | 60% | Descriptions, metadata |
| Tertiary | `#6b7280` | 42% | Timestamps, hints |
| Muted | `#4b5563` | 30% | Disabled text |

### Semantic Colors

| Purpose | Hex | Usage |
|---------|-----|-------|
| Success | `#22c55e` | Success messages, checkmarks |
| Warning | `#f59e0b` | Warnings, alerts |
| Error | `#ef4444` | Errors, destructive actions |
| Info | `#3b82f6` | Information, tips |

### Overlay Colors

```css
--overlay-light: rgba(255, 255, 255, 0.05);
--overlay-medium: rgba(255, 255, 255, 0.1);
--overlay-dark: rgba(0, 0, 0, 0.6);
--overlay-gradient: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
```

### Red Glow Effects

```css
--glow-soft: 0 0 20px rgba(171, 0, 19, 0.3);
--glow-medium: 0 0 30px rgba(171, 0, 19, 0.4);
--glow-strong: 0 0 40px rgba(171, 0, 19, 0.5);
--glow-intense: 0 0 60px rgba(171, 0, 19, 0.6);
```

---

## Typography

### Font Family

```css
/* Primary Font */
font-family: 'Figtree', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace */
font-family: ui-monospace, monospace;
```

### Font Scale (Major Third - 1.25 ratio)

| Token | Size | rem | Usage |
|-------|------|-----|-------|
| `--text-xs` | 12px | 0.75rem | Captions, timestamps |
| `--text-sm` | 14px | 0.875rem | Body small, metadata |
| `--text-base` | 16px | 1rem | Body text (default) |
| `--text-lg` | 18px | 1.125rem | Large body, card titles |
| `--text-xl` | 20px | 1.25rem | Section titles |
| `--text-2xl` | 24px | 1.5rem | Page titles (mobile) |
| `--text-3xl` | 30px | 1.875rem | Page titles (desktop) |
| `--text-4xl` | 36px | 2.25rem | Hero titles (mobile) |
| `--text-5xl` | 48px | 3rem | Hero titles (desktop) |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| Normal | 400 | Body text |
| Medium | 500 | Labels, metadata |
| Semibold | 600 | Card titles, buttons |
| Bold | 700 | Headlines, page titles |
| Extrabold | 800 | Stats, numbers |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| None | 1 | Stat numbers |
| Tight | 1.25 | Headlines |
| Snug | 1.375 | Subheadlines |
| Normal | 1.5 | Body text |
| Relaxed | 1.625 | Long descriptions |

### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| Tighter | -0.05em | Large headlines |
| Tight | -0.025em | Page titles |
| Normal | 0 | Body text |
| Wide | 0.025em | Labels |
| Wider | 0.05em | Uppercase text |

### Typography Classes

Use these pre-built classes for consistent text styling:

#### Hero Title
```css
.title-hero {
  font-size: 36px;        /* mobile */
  font-size: 48px;        /* desktop */
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.25;
  color: #e6e7ea;
}
```

```html
<h1 class="title-hero">Featured Content</h1>
```

#### Page Title
```css
.title-page {
  font-size: 24px;        /* mobile */
  font-size: 30px;        /* desktop */
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.25;
  color: #e6e7ea;
}
```

```html
<h1 class="title-page">Videos</h1>
```

#### Section Title
```css
.title-section {
  font-size: 18px;        /* mobile */
  font-size: 20px;        /* desktop */
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.375;
  color: #e6e7ea;
}
```

```html
<h2 class="title-section">Popular This Week</h2>
```

#### Card Title
```css
.title-card {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.375;
  color: #e6e7ea;
}
```

```html
<h3 class="title-card">Video Title</h3>
```

#### Body Text Variants
```css
.body-large {
  font-size: 18px;
  font-weight: 400;
  line-height: 1.625;
  color: #9aa0a6;
}

.body-base {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #9aa0a6;
}

.body-small {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #9aa0a6;
}
```

```html
<p class="body-large">Description text</p>
<p class="body-base">Regular text</p>
<p class="body-small">Metadata text</p>
```

#### Label & Caption
```css
.label {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  color: #9aa0a6;
}

.caption {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #9aa0a6;
}
```

```html
<span class="label">CATEGORY</span>
<span class="caption">2 hours ago</span>
```

---

## Spacing & Layout

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| 0 | 0px | None |
| 1 | 4px | Tight gaps |
| 2 | 8px | Icon gaps |
| 3 | 12px | Small padding |
| 4 | 16px | Default padding |
| 5 | 20px | Medium padding |
| 6 | 24px | Card padding |
| 8 | 32px | Section gaps |
| 10 | 40px | Large gaps |
| 12 | 48px | XL gaps |
| 16 | 64px | Section spacing |
| 20 | 80px | Page sections |
| 24 | 96px | Hero sections |

### Page Layout

#### Horizontal Padding

| Breakpoint | Padding |
|------------|---------|
| Mobile | 16px |
| Tablet (768px+) | 24px |
| Desktop (1024px+) | 32px |

```css
/* Tailwind */
.container { @apply px-4 md:px-6 lg:px-8; }
```

#### Max Content Widths

| Variant | Width | Usage |
|---------|-------|-------|
| Default | 1400px | Standard pages |
| Narrow | 800px | Forms, settings |
| Wide | 1600px | Home, featured |

```css
max-width: 1400px;  /* default */
max-width: 800px;   /* narrow */
max-width: 1600px;  /* wide */
```

#### Section Spacing

- **Section Gap**: 40px between major sections
- **Header to Content**: 32px

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| None | 0px | Sharp corners |
| XS | 4px | Badges, tags |
| SM | 6px | Small elements |
| MD | 8px | Buttons, inputs |
| LG | 12px | Cards, thumbnails |
| XL | 16px | Large cards, modals |
| 2XL | 20px | Featured cards |
| Full | 9999px | Avatars, pills |

### Component-Specific Radii

```css
--radius-button: 12px;
--radius-card: 16px;
--radius-thumbnail: 12px;
--radius-avatar: 9999px;
--radius-input: 12px;
--radius-chip: 9999px;
--radius-modal: 16px;
```

### Shadows

| Level | Value | Usage |
|-------|-------|-------|
| Low | `0 4px 12px rgba(0, 0, 0, 0.4)` | Subtle elevation |
| Medium | `0 8px 32px rgba(0, 0, 0, 0.6)` | Cards, modals |
| High | `0 16px 64px rgba(0, 0, 0, 0.8)` | Overlays, focus |
| Card Hover | `0 12px 40px rgba(0, 0, 0, 0.5)` | Hover states |

### Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| Base | 0 | Default |
| Dropdown | 10 | Dropdowns |
| Sticky | 20 | Sticky headers |
| Fixed | 30 | Fixed elements |
| Modal Backdrop | 40 | Modal overlays |
| Modal | 50 | Modals |
| Popover | 60 | Popovers |
| Tooltip | 70 | Tooltips |
| Toast | 80 | Toast notifications |

---

## Components

### PageHeader

Unified page header with optional back button and filters.

**File:** `src/components/ui/page-header.tsx`

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
- `onBack?` (function): Custom back button handler
- `icon?` (ReactNode): Optional icon before title
- `actions?` (ReactNode): Filter/action slot
- `variant?` ('default' | 'large' | 'hero'): Title size
- `className?` (string): Additional classes

**Variants:**
- `default`: Uses `title-page` class
- `large`: Uses `title-hero` class
- `hero`: Uses `title-hero gradient-text` class

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

**CSS:**
```css
.filter-chip {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #9aa0a6;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-chip:hover {
  color: #e6e7ea;
  background: rgba(255, 255, 255, 0.05);
}

.filter-chip.active {
  background: #ab0013;
  color: #fff;
  box-shadow: 0 0 20px rgba(171, 0, 19, 0.4), 0 0 40px rgba(171, 0, 19, 0.2);
}
```

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

### Buttons

#### Primary Button
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: #ab0013;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-primary:hover {
  background: #d4001a;
  box-shadow: 0 0 30px rgba(171, 0, 19, 0.4);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Premium Button (Gradient)
```css
.btn-premium {
  background: linear-gradient(135deg, #ab0013 0%, #8a0010 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-premium:hover {
  background: linear-gradient(135deg, #d4001a 0%, #ab0013 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 0 30px rgba(171, 0, 19, 0.4),
    0 8px 24px rgba(0, 0, 0, 0.4);
}
```

#### Secondary/Ghost Button
```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}
```

---

### Cards

#### Video/Media Card
```css
.card {
  background: #0d0d0d;
  border: 1px solid #1f1f1f;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card:hover {
  transform: translateY(-4px);
  background: #161616;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(171, 0, 19, 0.3);
  border-color: rgba(171, 0, 19, 0.3);
}
```

#### Video Thumbnail Card
```css
.video-card {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  background: #0d0d0d;
}

.video-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(0, 0, 0, 0.8) 100%);
}
```

---

### Avatars

```css
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: #1a1a1a;
}

/* Avatar sizes */
.avatar-xs { width: 24px; height: 24px; }
.avatar-sm { width: 32px; height: 32px; }
.avatar-md { width: 40px; height: 40px; }
.avatar-lg { width: 48px; height: 48px; }
.avatar-xl { width: 64px; height: 64px; }
.avatar-2xl { width: 80px; height: 80px; }

/* Avatar with glow */
.avatar-glow {
  box-shadow: 0 0 0 3px #ab0013, 0 0 30px rgba(171, 0, 19, 0.4);
}
```

---

### Badges

```css
/* Duration Badge */
.badge-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

/* Lock Badge */
.badge-lock {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

/* Premium Badge */
.badge-premium {
  background: #ab0013;
  color: #fff;
  box-shadow: 0 0 20px rgba(171, 0, 19, 0.3);
}
```

---

### Input Fields

```css
.input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #e6e7ea;
  font-size: 14px;
  transition: all 0.2s ease;
}

.input::placeholder {
  color: #6b7280;
}

.input:focus {
  outline: none;
  border-color: #ab0013;
  box-shadow: 0 0 0 3px rgba(171, 0, 19, 0.1);
}
```

---

### Glass / Glassmorphism

```css
.glass {
  background: rgba(13, 13, 13, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(31, 31, 31, 0.5);
}

.glass-strong {
  background: rgba(13, 13, 13, 0.95);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(31, 31, 31, 0.6);
}
```

---

### Loading States

#### Spinner
```css
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #1a1a1a;
  border-top-color: #ab0013;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### Skeleton Loading
```css
.skeleton {
  background: linear-gradient(90deg, #0d0d0d 25%, #1a1a1a 50%, #0d0d0d 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## Animations & Transitions

### Transition Presets

```css
--transition-fast: 0.15s ease;
--transition-normal: 0.3s ease;
--transition-slow: 0.4s ease;
--transition-bouncy: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
--transition-smooth: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover Effects

#### Card Lift
```css
.hover-lift {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}
```

#### Card Interactive (Scale)
```css
.hover-scale {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-scale:active {
  transform: scale(0.98);
}
```

### Keyframe Animations

#### Fade In Up
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
```

#### Scale In
```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

#### Pulse Glow
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(171, 0, 19, 0.3); }
  50% { box-shadow: 0 0 40px rgba(171, 0, 19, 0.5); }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

#### Float
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

---

## Responsive Design

### Breakpoints

| Token | Width | Description |
|-------|-------|-------------|
| sm | 640px | Small tablets |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1400px | Large desktops |

### Grid Configurations

#### Media Grid (Videos)
| Breakpoint | Columns |
|------------|---------|
| Default | 1 |
| sm (640px) | 2 |
| md (768px) | 3 |
| lg (1024px) | 4 |
| xl (1280px) | 5 |

#### Creator Grid
| Breakpoint | Columns |
|------------|---------|
| Default | 1 |
| sm (640px) | 2 |
| md (768px) | 3 |
| lg (1024px) | 4 |

#### Series Grid
| Breakpoint | Columns |
|------------|---------|
| Default | 1 |
| sm (640px) | 2 |
| lg (1024px) | 3 |
| xl (1400px) | 4 |

#### Shorts Grid
| Breakpoint | Columns |
|------------|---------|
| Default | 2 |
| sm (640px) | 3 |
| md (768px) | 4 |
| lg (1024px) | 5 |
| xl (1280px) | 6 |

### Aspect Ratios

| Type | Ratio | Usage |
|------|-------|-------|
| Video | 16:9 | Video thumbnails, player |
| Short | 9:16 | Shorts/TikTok content |
| Square | 1:1 | Avatars, icons |
| Portrait | 3:4 | Profile images |
| Banner | 21:9 | Hero banners |

---

## CSS Utilities

### Hide Scrollbar

```css
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
```

### Custom Scrollbar

```css
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
```

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #d4001a 0%, #ab0013 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Text Glow

```css
.text-glow {
  text-shadow: 0 0 20px rgba(171, 0, 19, 0.5);
}
```

### Divider

```css
.divider-fade {
  background: linear-gradient(90deg, transparent, #1f1f1f, transparent);
  height: 1px;
}
```

---

## Platform-Specific Exports

### iOS (Swift/SwiftUI)

```swift
// Colors.swift
struct TabooColors {
    static let background = UIColor(hex: "#000000")
    static let surface = UIColor(hex: "#0d0d0d")
    static let card = UIColor(hex: "#131315")
    static let border = UIColor(hex: "#1f1f1f")

    static let primary = UIColor(hex: "#ab0013")
    static let primaryHover = UIColor(hex: "#d4001a")
    static let primaryDark = UIColor(hex: "#8a0010")

    static let textPrimary = UIColor(hex: "#e6e7ea")
    static let textSecondary = UIColor(hex: "#9aa0a6")
    static let textTertiary = UIColor(hex: "#6b7280")

    static let success = UIColor(hex: "#22c55e")
    static let warning = UIColor(hex: "#f59e0b")
    static let error = UIColor(hex: "#ef4444")
}
```

### Android (Kotlin/Compose)

```kotlin
// Colors.kt
object TabooColors {
    val background = Color(0xFF000000)
    val surface = Color(0xFF0D0D0D)
    val card = Color(0xFF131315)
    val border = Color(0xFF1F1F1F)

    val primary = Color(0xFFAB0013)
    val primaryHover = Color(0xFFD4001A)
    val primaryDark = Color(0xFF8A0010)

    val textPrimary = Color(0xFFE6E7EA)
    val textSecondary = Color(0xFF9AA0A6)
    val textTertiary = Color(0xFF6B7280)

    val success = Color(0xFF22C55E)
    val warning = Color(0xFFF59E0B)
    val error = Color(0xFFEF4444)
}
```

### Font Recommendations

- **Web**: Figtree (Google Fonts)
- **iOS**: SF Pro Text / SF Pro Display
- **Android**: Roboto / Google Sans

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
9. **Use `cn()` utility** from `@/lib/utils` for conditional Tailwind classes
10. **Maintain responsive breakpoints** across all layouts

---

## File Structure

```
src/
├── lib/
│   ├── design-tokens.ts    # All design values
│   └── utils.ts            # Utility functions (cn, etc.)
├── components/
│   └── ui/
│       ├── index.ts        # Component exports
│       ├── page-header.tsx
│       ├── filter-chips.tsx
│       ├── media-card.tsx
│       └── content-grid.tsx
└── app/
    └── globals.css         # CSS variables & utility classes
```

---

## Additional Resources

- **Netflix Hover Card Pattern**: See `.claude/skills/implement-hover-card/SKILL.md` for detailed implementation
- **Source Files**: `src/lib/design-tokens.ts`, `src/app/globals.css`
- **UI Components**: `src/components/ui/`

---

*Last updated: January 2026*
*Maintained by: TabooTV Development Team*
