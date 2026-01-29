---
name: ui-components
description: "Tailwind CSS patterns, design tokens, shadcn component integration, responsive design, accessibility"
allowed-tools: Read, Write, Edit, Bash
version: 1.0
priority: HIGH
---

# UI Components & Design System – TabooTV Frontend

> **CORE GOAL:** Build accessible, performant, visually consistent UI using Tailwind CSS and shadcn components.

---

## When to Use This Skill

**Trigger Keywords:**
- "Create new component"
- "Build UI for X"
- "Design page layout"
- "Implement responsive design"
- "Fix styling issue"
- "Update design tokens"
- "Make component accessible"
- "Use shadcn component"

---

## Design System Basics

### Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| **Primary Red** | `#ab0013` | CTA, links, emphasis |
| **Primary Red Hover** | `#d4001a` | Hover state |
| **Background** | `#000000` | Page background |
| **Surface** | `#0d0d0d` | Cards, panels |
| **Text Primary** | `#e6e7ea` | Body text |
| **Text Secondary** | `#9aa0a6` | Labels, hints |
| **Success** | `#22c55e` | Success states |
| **Warning** | `#f59e0b` | Warnings |
| **Error** | `#ef4444` | Errors |

### Typography Classes

```typescript
// src/shared/lib/design-tokens.ts
export const typography = {
  'title-hero': 'text-4xl md:text-5xl font-bold leading-tight',
  'title-page': 'text-2xl md:text-3xl font-bold',
  'title-section': 'text-lg md:text-xl font-semibold',
  'body-large': 'text-base leading-relaxed',
  'body-base': 'text-sm leading-relaxed',
  'body-small': 'text-xs leading-relaxed',
  'label': 'text-xs font-medium uppercase tracking-wide',
} as const;
```

### Using Design Tokens

```typescript
import { cn } from '@/shared/utils/formatting';

function PageTitle({ children }: Props) {
  return <h1 className={cn('title-page text-text-primary')}>{children}</h1>;
}

function SectionTitle({ children }: Props) {
  return <h2 className={cn('title-section text-text-primary')}>{children}</h2>;
}

function Label({ children }: Props) {
  return <label className={cn('label text-text-secondary')}>{children}</label>;
}
```

---

## Component Patterns

### Basic Component Structure

```typescript
'use client'; // Only if needed (hooks, interactivity)

import { cn } from '@/shared/utils/formatting';

interface VideoCardProps {
  video: Video;
  isLoading?: boolean;
  onClick?: () => void;
}

export function VideoCard({ video, isLoading, onClick }: VideoCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'group relative overflow-hidden rounded-lg bg-surface',
        'transition-transform hover:scale-105',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      aria-busy={isLoading}
    >
      {/* Content */}
    </button>
  );
}
```

### Responsive Design

```typescript
function VideoGrid() {
  return (
    <div className={cn(
      'grid gap-4',
      'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      'px-4 sm:px-6 lg:px-8'
    )}>
      {/* Videos */}
    </div>
  );
}
```

### Dark Mode (Already Configured)

TabooTV is dark-mode only. Use Tailwind's dark mode classes:

```typescript
// Explicit (for light components if ever needed):
<div className="bg-white dark:bg-surface">

// More common - just use dark tokens:
<div className="bg-surface text-text-primary">
```

---

## Shadcn Components

### Common Patterns

```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Button variants
<Button variant="default">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button disabled>Disabled</Button>

// Dialog
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <h2>Confirm Action</h2>
    <p>Are you sure?</p>
  </DialogContent>
</Dialog>

// Select
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Adding New Shadcn Components

```bash
# List available components
npx shadcn-ui@latest list

# Add a component
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
```

---

## Accessibility (A11y)

### ARIA Attributes

```typescript
// Button with loading state
<button
  aria-busy={isLoading}
  aria-disabled={isLoading}
  disabled={isLoading}
>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// Form field
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-required="true" />

// List with announcement
<div role="status" aria-live="polite" aria-atomic="true">
  {successMessage && <p>{successMessage}</p>}
</div>

// Modal
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent role="alertdialog">
    <h2>Confirm Delete</h2>
  </DialogContent>
</Dialog>
```

### Color Contrast

- Always check contrast ratios (use tools like WebAIM)
- Primary red (#ab0013) on black (#000000) = Good
- Text secondary (#9aa0a6) is only for non-essential labels

---

## Layout Components

### Page Container

```typescript
function PageLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={title} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

### Grid Layout

```typescript
function VideoGrid({ videos }: Props) {
  return (
    <div className={cn(
      'grid gap-4',
      'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    )}>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
```

### Sidebar Layout

```typescript
function WithSidebar({ sidebar, children }: Props) {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
      <aside className="lg:col-span-1">
        {sidebar}
      </aside>
      <main className="lg:col-span-3">
        {children}
      </main>
    </div>
  );
}
```

---

## Animation Patterns

### Tailwind Utilities

```typescript
// Simple transitions
<div className="transition-opacity duration-200 hover:opacity-80">

// Transforms
<div className="transition-transform hover:scale-105 active:scale-95">

// Conditional animations
<div className={cn(
  'transition-all duration-300',
  isOpen ? 'max-h-96' : 'max-h-0 overflow-hidden'
)}>
```

### Custom Animations

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
    },
  },
} satisfies Config;

// Usage
<div className="animate-fade-in">
```

---

## Form Components

### Form Wrapper

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <input
            id="email"
            {...form.register('email')}
            className={cn(
              'w-full px-3 py-2 rounded border border-surface',
              'bg-background text-text-primary',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              form.formState.errors.email && 'border-error'
            )}
          />
          {form.formState.errors.email && (
            <p className="text-error text-sm mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>
      <Button type="submit" className="w-full mt-6">
        Sign In
      </Button>
    </form>
  );
}
```

---

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image';

// ✅ Optimized
<Image
  src="/videos/thumbnail.jpg"
  alt="Video title"
  width={320}
  height={180}
  priority={false}
  loading="lazy"
/>

// ❌ Not optimized
<img src="/videos/thumbnail.jpg" alt="Video title" />
```

### Component Memoization

```typescript
import { memo } from 'react';

// Only memoize if re-renders cause visible lag
export const VideoCard = memo(function VideoCard({ video }: Props) {
  return <div>{/* content */}</div>;
});
```

---

## When Complete: Self-Check

- [ ] Component has proper ARIA labels
- [ ] Responsive on mobile, tablet, desktop
- [ ] Color contrast meets WCAG AA
- [ ] No hardcoded colors (uses design tokens)
- [ ] Uses `cn()` for class composition
- [ ] TypeScript types are complete
- [ ] Disabled/loading states are clear
- [ ] Tailwind lint passes: `npm run lint`

---

## Related Skills

- **refactoring-patterns** — Simplifying complex components
- **typescript-patterns** — Type-safe props
- **testing** — Component testing
