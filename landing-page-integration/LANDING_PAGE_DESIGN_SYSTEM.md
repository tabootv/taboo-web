# TabooTV Landing Page Design System

A comprehensive design system extracted from the Creator Landing Pages built for Framer integration.

---

## Table of Contents
1. [Colors](#colors)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Animations & Transitions](#animations--transitions)
6. [Responsive Breakpoints](#responsive-breakpoints)
7. [CSS Utilities](#css-utilities)
8. [Full Style Reference](#full-style-reference)

---

## Colors

### Primary Palette
```css
--color-primary: #ab0013;          /* TabooTV Red - Primary brand color */
--color-primary-hover: #c41420;    /* Lighter red for hover states */
--color-primary-glow: #e11d48;     /* Bright red for glows/accents */
```

### Backgrounds
```css
--color-bg-page: #000000;          /* Main page background */
--color-bg-surface: #0a0a0a;       /* Slightly elevated surface */
--color-bg-card: #111111;          /* Card/thumbnail backgrounds */
--color-bg-elevated: #1a1a1a;      /* More elevated elements */
```

### Text Colors
```css
--color-text-primary: #ffffff;                   /* Primary text */
--color-text-secondary: rgba(255,255,255,0.7);   /* Secondary/body text */
--color-text-muted: rgba(255,255,255,0.6);       /* Muted text */
--color-text-subtle: rgba(255,255,255,0.5);      /* Inactive tabs, hints */
--color-text-disabled: #666666;                   /* Disabled/placeholder */
--color-text-faint: #888888;                      /* Error text, links */
```

### Borders & Dividers
```css
--color-border-subtle: rgba(255,255,255,0.06);   /* Very subtle borders */
--color-border-light: rgba(255,255,255,0.08);    /* Light borders */
--color-border-medium: rgba(255,255,255,0.1);    /* Medium borders */
--color-border-accent: rgba(255,255,255,0.15);   /* Avatar borders */
--color-border-strong: rgba(255,255,255,0.2);    /* Emphasized borders */
--color-border-hover: rgba(255,255,255,0.25);    /* Hover state borders */
```

### Overlays & Shadows
```css
--color-overlay-light: rgba(0,0,0,0.3);          /* Light overlay */
--color-overlay-medium: rgba(0,0,0,0.6);         /* Medium overlay */
--color-overlay-heavy: rgba(0,0,0,0.7);          /* Heavy overlay (badges) */
--color-overlay-dark: rgba(0,0,0,0.85);          /* Duration badges */
--color-overlay-glass: rgba(0,0,0,0.9);          /* Glass effect background */

/* Primary color overlays */
--color-primary-overlay-subtle: rgba(171, 0, 19, 0.1);   /* Subtle glow */
--color-primary-overlay-light: rgba(171, 0, 19, 0.15);   /* Hero gradient */
--color-primary-overlay-medium: rgba(171, 0, 19, 0.25);  /* Card hover shadow */
--color-primary-overlay-strong: rgba(171, 0, 19, 0.35);  /* Button shadow */
```

---

## Typography

### Font Family
```css
font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes (Responsive with clamp)

| Element | Size | Weight | Letter Spacing |
|---------|------|--------|----------------|
| Hero Title (Large) | `clamp(32px, 8vw, 56px)` | 700 | -0.03em |
| Hero Name | `clamp(28px, 6vw, 42px)` | 700 | -0.02em |
| Section Title | `clamp(18px, 4.5vw, 22px)` | 600 | -0.01em |
| CTA Title | `clamp(20px, 5vw, 28px)` | 600 | -0.01em |
| Featured Title | `clamp(16px, 4vw, 22px)` | 600 | - |
| Card Name | `clamp(16px, 4vw, 20px)` | 600 | - |
| Body Large | `clamp(14px, 3.5vw, 18px)` | 400 | - |
| Body | `clamp(14px, 3.5vw, 16px)` | 400 | - |
| Body Small | `clamp(13px, 3vw, 15px)` | 400 | - |
| Tab Label | `clamp(13px, 3.5vw, 15px)` | 600 | - |
| Button | 14-15px | 600 | - |
| Caption | 13px | 500 | - |
| Badge | 11-12px | 500-600 | - |
| Tag (uppercase) | 10px | 400 | 0.05em |

### Line Heights
```css
--line-height-tight: 1.3;    /* Titles */
--line-height-normal: 1.4;   /* Card titles */
--line-height-relaxed: 1.5;  /* Body text */
--line-height-loose: 1.6;    /* Descriptions */
```

---

## Spacing & Layout

### Container Widths
```css
--container-max: 1400px;     /* Main content max-width */
--container-narrow: 800px;   /* Hero content */
--container-xs: 600px;       /* CTA sections */
```

### Responsive Padding
```css
/* Horizontal padding */
padding-inline: clamp(16px, 4vw, 40px);   /* Standard sections */
padding-inline: clamp(20px, 5vw, 40px);   /* Hero/CTA sections */

/* Vertical padding */
padding-block: clamp(20px, 4vw, 36px);    /* Standard sections */
padding-block: clamp(32px, 7vw, 56px);    /* CTA sections */
padding-block: clamp(40px, 8vw, 80px);    /* Large sections */
```

### Gaps
```css
--gap-xs: 4px;
--gap-sm: 8px;
--gap-md: 12px;
--gap-lg: 16px;
--gap-xl: 20px;
--gap-2xl: 24px;
```

### Border Radius
```css
--radius-sm: 4px;            /* Badges, tags */
--radius-md: 8px;            /* Buttons, small cards */
--radius-lg: 10px;           /* Shorts cards */
--radius-xl: 16px;           /* Creator cards */
--radius-2xl: clamp(10px, 2.5vw, 16px);  /* Featured video */
--radius-full: 50%;          /* Avatars, circular elements */
--radius-pill: 20px;         /* Tag chips */
```

---

## Components

### Primary Button
```css
.btn-primary {
    display: inline-block;
    padding: 14px 28px;
    background: #ab0013;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    position: relative;
    z-index: 10;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 20px rgba(171, 0, 19, 0.35);
}

.btn-primary:active {
    transform: scale(0.98);
}
```

### Secondary/Outline Button
```css
.btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(171, 0, 19, 0.15);
    border: 1px solid rgba(171, 0, 19, 0.3);
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    position: relative;
    z-index: 10;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.btn-secondary:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(171, 0, 19, 0.35);
}
```

### Ghost Button (Border only)
```css
.btn-ghost {
    display: inline-block;
    padding: 12px 24px;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}
```

### Card (Creator Card Style)
```css
.card {
    position: relative;
    background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(171, 0, 19, 0.25);
}

/* Optional hover background glow */
.card-bg-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center top, rgba(171, 0, 19, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.card:hover .card-bg-glow {
    opacity: 1;
}
```

### Video Card (Thumbnail style)
```css
.video-card {
    text-decoration: none;
    color: inherit;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.video-card:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 30px rgba(171, 0, 19, 0.2);
}

.video-thumb {
    position: relative;
    aspect-ratio: 16/9;
    border-radius: 8px;
    overflow: hidden;
    background: #111;
}

.video-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
```

### Avatar
```css
.avatar {
    width: clamp(80px, 20vw, 100px);
    height: clamp(80px, 20vw, 100px);
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid rgba(255,255,255,0.15);
    background: #111;
    transition: box-shadow 0.3s ease;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Hover glow effect (when inside card) */
.card:hover .avatar {
    box-shadow: 0 0 30px rgba(171, 0, 19, 0.5);
}
```

### Badge (Lock, Duration)
```css
.badge-circle {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}

.badge-duration {
    padding: 3px 7px;
    background: rgba(0,0,0,0.85);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    color: #fff;
}

.badge-location {
    padding: 3px 8px;
    background: rgba(0,0,0,0.75);
    border-radius: 4px;
    font-size: 10px;
    color: #ccc;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
```

### Tag Chip
```css
.tag-chip {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    text-transform: capitalize;
    transition: all 0.2s ease;
}

.tag-chip:hover {
    background: rgba(255,255,255,0.15);
    border-color: rgba(255,255,255,0.25);
}

.tag-chip.active {
    background: #ab0013;
    border-color: #ab0013;
    color: #fff;
}
```

### Sticky Tab Bar
```css
.tabs-wrap {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(0,0,0,0.9);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
}

.tab-btn {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.5);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    padding: 8px 4px;
    border-bottom: 2px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
}

.tab-btn:hover {
    color: rgba(255,255,255,0.8);
}

.tab-btn.active {
    color: #fff;
    border-bottom: 2px solid #ab0013;
}
```

### Social Link Button
```css
.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.15);
    transition: transform 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.social-link:hover {
    transform: scale(1.15);
    color: #fff;
    background: rgba(171, 0, 19, 0.3);
}
```

### Loading Spinner
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

---

## Animations & Transitions

### Standard Transitions
```css
--transition-fast: 0.2s ease;
--transition-normal: 0.25s ease;
--transition-slow: 0.3s ease;
```

### Hover Effects
```css
/* Card lift effect */
.card-hover:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 30px rgba(171, 0, 19, 0.2);
}

/* Larger card lift */
.card-hover-large:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(171, 0, 19, 0.25);
}

/* Button scale */
.btn-hover:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 20px rgba(171, 0, 19, 0.35);
}

.btn-hover:active {
    transform: scale(0.98);
}

/* Social icon scale */
.social-hover:hover {
    transform: scale(1.15);
}
```

### Keyframe Animations
```css
/* Spinner */
@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Pulse dot (for map markers) */
@keyframes pulseDot {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 4px #e11d48, 0 0 8px rgba(225, 29, 72, 0.6), 0 0 12px rgba(171, 0, 19, 0.4);
    }
    50% {
        transform: scale(1.3);
        box-shadow: 0 0 6px #e11d48, 0 0 12px rgba(225, 29, 72, 0.8), 0 0 20px rgba(171, 0, 19, 0.6);
    }
}

/* Ripple effect */
@keyframes dotRipple {
    0% { width: 100%; height: 100%; opacity: 0.8; }
    100% { width: 300%; height: 300%; opacity: 0; }
}

/* Globe rotation */
@keyframes rotateGlobe {
    from { background-position: 0 0; }
    to { background-position: 630px 0; }
}
```

---

## Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1201px) {
    .creators-grid { grid-template-columns: repeat(4, 1fr); }
    .videos-grid { grid-template-columns: repeat(4, 1fr); }
    .shorts-grid { grid-template-columns: repeat(6, 1fr); }
}

/* Tablet Landscape */
@media (max-width: 1200px) {
    .creators-grid { grid-template-columns: repeat(3, 1fr); }
    .videos-grid { grid-template-columns: repeat(3, 1fr); }
    .shorts-grid { grid-template-columns: repeat(5, 1fr); }
}

/* Tablet Portrait */
@media (max-width: 900px) {
    .creators-grid { grid-template-columns: repeat(2, 1fr); }
    .videos-grid { grid-template-columns: repeat(2, 1fr); }
    .shorts-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Mobile */
@media (max-width: 600px) {
    .creators-grid { grid-template-columns: 1fr; }
    .videos-grid { grid-template-columns: repeat(2, 1fr); }
    .shorts-grid { grid-template-columns: repeat(3, 1fr); }
}

/* Small Mobile */
@media (max-width: 400px) {
    .videos-grid { grid-template-columns: 1fr; }
    .shorts-grid { grid-template-columns: repeat(2, 1fr); }
}
```

---

## CSS Utilities

### Hide Scrollbar
```css
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
```

### Touch Scroll (Horizontal rails)
```css
.touch-scroll {
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
}

.touch-scroll > * {
    scroll-snap-align: start;
}
```

### Text Truncation (Multi-line)
```css
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

### Gradient Text
```css
.gradient-text {
    background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

---

## Full Style Reference

### Hero Section Backgrounds
```css
/* Image background with blur */
.hero-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.35;
    filter: blur(3px);
}

/* Gradient overlay */
.hero-gradient {
    background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 60%, #000 100%);
}

/* Radial glow (All Creators page) */
.hero-glow {
    background: radial-gradient(ellipse at center top, rgba(171, 0, 19, 0.15) 0%, transparent 60%),
                linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%);
}

/* Film grain texture */
.hero-grain {
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```

### Section Patterns
```css
/* Standard section */
.section {
    max-width: 1400px;
    margin: 0 auto;
    padding: clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px);
}

/* CTA section with gradient */
.cta-section {
    background: linear-gradient(180deg, #000 0%, #0a0a0a 100%);
    padding: clamp(40px, 8vw, 80px) clamp(20px, 5vw, 40px);
    text-align: center;
}
```

### Horizontal Scroll Rail
```css
.scroll-rail {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scroll-snap-type: x mandatory;
}

.scroll-rail::-webkit-scrollbar {
    display: none;
}

.scroll-rail-item {
    flex-shrink: 0;
    scroll-snap-align: start;
}
```

### Play Button Overlay
```css
.play-circle {
    width: clamp(44px, 10vw, 58px);
    height: clamp(44px, 10vw, 58px);
    border-radius: 50%;
    background: rgba(171, 0, 19, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    box-shadow: 0 8px 32px rgba(171, 0, 19, 0.4);
}
```

---

## Usage in React/Next.js

### Import pattern for Tailwind projects
You can convert these styles to Tailwind classes or use them as CSS modules.

### Example: Tailwind Config Extension
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'taboo-red': '#ab0013',
        'taboo-red-hover': '#c41420',
        'taboo-red-glow': '#e11d48',
        'surface': {
          DEFAULT: '#0a0a0a',
          card: '#111111',
          elevated: '#1a1a1a',
        }
      },
      fontFamily: {
        sans: ['Figtree', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'taboo': '0 8px 30px rgba(171, 0, 19, 0.2)',
        'taboo-hover': '0 20px 40px rgba(171, 0, 19, 0.25)',
        'taboo-btn': '0 6px 20px rgba(171, 0, 19, 0.35)',
      }
    }
  }
}
```

---

## Quick Copy-Paste Styles

### Complete Button Styles (React inline)
```tsx
const buttonStyles = {
    primary: {
        display: "inline-block",
        padding: "14px 28px",
        background: "#ab0013",
        color: "#fff",
        fontSize: 15,
        fontWeight: 600,
        textDecoration: "none",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        position: "relative" as const,
        zIndex: 10,
        transition: "transform 0.2s, box-shadow 0.2s",
    },
    secondary: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        background: "rgba(171, 0, 19, 0.15)",
        border: "1px solid rgba(171, 0, 19, 0.3)",
        borderRadius: 8,
        color: "#fff",
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
        cursor: "pointer",
        position: "relative" as const,
        zIndex: 10,
        transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
    },
    ghost: {
        display: "inline-block",
        padding: "12px 24px",
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: 8,
        color: "#fff",
        fontSize: 14,
        fontWeight: 500,
        textDecoration: "none",
        background: "transparent",
        cursor: "pointer",
        transition: "all 0.2s",
    },
}
```

### Complete Card Style (React inline)
```tsx
const cardStyle = {
    position: "relative" as const,
    background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column" as const,
}
```

---

*Last updated: December 2024*
*Based on: FramerComponent.tsx, AllCreatorsComponent.tsx*
