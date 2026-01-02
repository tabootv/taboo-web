# TabooTV Design System

Cross-platform design specification for web (Next.js) and mobile (Flutter) applications.

---

## Colors

### Background Hierarchy

| Token | Hex | RGB | Flutter |
|-------|-----|-----|---------|
| `background` | `#000000` | `0, 0, 0` | `Color(0xFF000000)` |
| `surface` | `#0D0D0D` | `13, 13, 13` | `Color(0xFF0D0D0D)` |
| `surfaceHover` | `#161616` | `22, 22, 22` | `Color(0xFF161616)` |
| `elevated` | `#1A1A1A` | `26, 26, 26` | `Color(0xFF1A1A1A)` |
| `card` | `#131315` | `19, 19, 21` | `Color(0xFF131315)` |

### Text Colors

| Token | Hex | RGB | Opacity | Flutter |
|-------|-----|-----|---------|---------|
| `textPrimary` | `#E6E7EA` | `230, 231, 234` | 100% | `Color(0xFFE6E7EA)` |
| `textSecondary` | `#9AA0A6` | `154, 160, 166` | 100% | `Color(0xFF9AA0A6)` |
| `textTertiary` | `#6B7280` | `107, 114, 128` | 100% | `Color(0xFF6B7280)` |
| `textMuted` | `#4B5563` | `75, 85, 99` | 100% | `Color(0xFF4B5563)` |
| `textInverse` | `#000000` | `0, 0, 0` | 100% | `Color(0xFF000000)` |

### Brand Red (Primary)

| Token | Hex | RGB | Flutter |
|-------|-----|-----|---------|
| `redPrimary` | `#AB0013` | `171, 0, 19` | `Color(0xFFAB0013)` |
| `redHover` | `#D4001A` | `212, 0, 26` | `Color(0xFFD4001A)` |
| `redDark` | `#8A0010` | `138, 0, 16` | `Color(0xFF8A0010)` |
| `redDeep` | `#7A000E` | `122, 0, 14` | `Color(0xFF7A000E)` |
| `redMuted` | `rgba(171, 0, 19, 0.1)` | - | `Color(0x1AAB0013)` |
| `redGlow` | `rgba(171, 0, 19, 0.4)` | - | `Color(0x66AB0013)` |

### Border Colors

| Token | Value | Flutter |
|-------|-------|---------|
| `borderDefault` | `#1F1F1F` | `Color(0xFF1F1F1F)` |
| `borderSubtle` | `rgba(255, 255, 255, 0.06)` | `Color(0x0FFFFFFF)` |
| `borderHover` | `rgba(255, 255, 255, 0.1)` | `Color(0x1AFFFFFF)` |
| `borderAccent` | `rgba(171, 0, 19, 0.3)` | `Color(0x4DAB0013)` |

### Semantic Colors

| Token | Hex | Flutter |
|-------|-----|---------|
| `success` | `#22C55E` | `Color(0xFF22C55E)` |
| `warning` | `#F59E0B` | `Color(0xFFF59E0B)` |
| `error` | `#EF4444` | `Color(0xFFEF4444)` |
| `info` | `#3B82F6` | `Color(0xFF3B82F6)` |

### Overlay Colors

| Token | Value | Flutter |
|-------|-------|---------|
| `overlayLight` | `rgba(255, 255, 255, 0.05)` | `Color(0x0DFFFFFF)` |
| `overlayMedium` | `rgba(255, 255, 255, 0.1)` | `Color(0x1AFFFFFF)` |
| `overlayDark` | `rgba(0, 0, 0, 0.6)` | `Color(0x99000000)` |

---

## Typography

### Font Family

| Platform | Primary Font | Fallback |
|----------|-------------|----------|
| Web | Figtree | system-ui, sans-serif |
| Flutter | Figtree | System default |

### Font Sizes

| Token | Size (px) | Size (rem) | Flutter |
|-------|-----------|------------|---------|
| `xs` | 12 | 0.75 | `12.0` |
| `sm` | 14 | 0.875 | `14.0` |
| `base` | 16 | 1.0 | `16.0` |
| `lg` | 18 | 1.125 | `18.0` |
| `xl` | 20 | 1.25 | `20.0` |
| `2xl` | 24 | 1.5 | `24.0` |
| `3xl` | 30 | 1.875 | `30.0` |
| `4xl` | 36 | 2.25 | `36.0` |
| `5xl` | 48 | 3.0 | `48.0` |

### Font Weights

| Token | Value | Flutter |
|-------|-------|---------|
| `normal` | 400 | `FontWeight.w400` |
| `medium` | 500 | `FontWeight.w500` |
| `semibold` | 600 | `FontWeight.w600` |
| `bold` | 700 | `FontWeight.w700` |
| `extrabold` | 800 | `FontWeight.w800` |

### Line Heights

| Token | Value | Flutter (height) |
|-------|-------|------------------|
| `none` | 1.0 | `1.0` |
| `tight` | 1.25 | `1.25` |
| `snug` | 1.375 | `1.375` |
| `normal` | 1.5 | `1.5` |
| `relaxed` | 1.625 | `1.625` |

### Letter Spacing

| Token | Value | Flutter |
|-------|-------|---------|
| `tighter` | -0.05em | `-0.8` (at 16px) |
| `tight` | -0.025em | `-0.4` (at 16px) |
| `normal` | 0 | `0` |
| `wide` | 0.025em | `0.4` (at 16px) |
| `wider` | 0.05em | `0.8` (at 16px) |

### Text Styles (Presets)

| Style | Mobile | Desktop | Weight | Letter Spacing |
|-------|--------|---------|--------|----------------|
| `titleHero` | 36px | 48px | bold (700) | tight (-0.025em) |
| `titlePage` | 24px | 30px | bold (700) | tight (-0.025em) |
| `titleSection` | 18px | 20px | semibold (600) | tight (-0.025em) |
| `titleCard` | 16px | 16px | semibold (600) | normal (0) |
| `bodyLarge` | 18px | 18px | normal (400) | normal (0) |
| `bodyBase` | 16px | 16px | normal (400) | normal (0) |
| `bodySmall` | 14px | 14px | normal (400) | normal (0) |
| `label` | 14px | 14px | medium (500) | wide (0.025em) + UPPERCASE |
| `caption` | 12px | 12px | normal (400) | normal (0) |
| `statNumber` | 24px | 30px | extrabold (800) | tight (-0.025em) |

---

## Spacing

### Base Scale

| Token | Value (px) | Flutter |
|-------|------------|---------|
| `spacing0` | 0 | `0` |
| `spacing1` | 4 | `4.0` |
| `spacing2` | 8 | `8.0` |
| `spacing3` | 12 | `12.0` |
| `spacing4` | 16 | `16.0` |
| `spacing5` | 20 | `20.0` |
| `spacing6` | 24 | `24.0` |
| `spacing8` | 32 | `32.0` |
| `spacing10` | 40 | `40.0` |
| `spacing12` | 48 | `48.0` |
| `spacing16` | 64 | `64.0` |
| `spacing20` | 80 | `80.0` |
| `spacing24` | 96 | `96.0` |

### Page Spacing

| Context | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Horizontal Padding | 16px | 24px | 32px |
| Vertical Padding | 24px | 24px | 32px |
| Section Gap | 40px | 40px | 40px |
| Header to Content | 32px | 32px | 32px |

### Max Content Width

| Variant | Value |
|---------|-------|
| Default | 1400px |
| Narrow | 800px |
| Wide | 1600px |

---

## Border Radius

### Base Scale

| Token | Value (px) | Flutter |
|-------|------------|---------|
| `none` | 0 | `0` |
| `xs` | 4 | `4.0` |
| `sm` | 6 | `6.0` |
| `md` | 8 | `8.0` |
| `lg` | 12 | `12.0` |
| `xl` | 16 | `16.0` |
| `2xl` | 20 | `20.0` |
| `full` | 9999 | `Radius.circular(9999)` |

### Component Radius

| Component | Radius (px) |
|-----------|-------------|
| Button | 12 |
| Card | 16 |
| Thumbnail | 12 |
| Avatar | 9999 (full circle) |
| Input | 12 |
| Chip | 9999 (pill) |
| Modal | 16 |

---

## Shadows

### Elevation

| Token | Value | Flutter |
|-------|-------|---------|
| `none` | none | `[]` |
| `low` | `0 4px 12px rgba(0,0,0,0.4)` | `BoxShadow(offset: Offset(0, 4), blurRadius: 12, color: Color(0x66000000))` |
| `medium` | `0 8px 32px rgba(0,0,0,0.6)` | `BoxShadow(offset: Offset(0, 8), blurRadius: 32, color: Color(0x99000000))` |
| `high` | `0 16px 64px rgba(0,0,0,0.8)` | `BoxShadow(offset: Offset(0, 16), blurRadius: 64, color: Color(0xCC000000))` |
| `cardHover` | `0 12px 40px rgba(0,0,0,0.5)` | `BoxShadow(offset: Offset(0, 12), blurRadius: 40, color: Color(0x80000000))` |

### Red Glow Effects

| Token | Value | Flutter |
|-------|-------|---------|
| `glowSoft` | `0 0 20px rgba(171,0,19,0.3)` | `BoxShadow(blurRadius: 20, color: Color(0x4DAB0013))` |
| `glowMedium` | `0 0 30px rgba(171,0,19,0.4)` | `BoxShadow(blurRadius: 30, color: Color(0x66AB0013))` |
| `glowStrong` | `0 0 40px rgba(171,0,19,0.5)` | `BoxShadow(blurRadius: 40, color: Color(0x80AB0013))` |
| `glowIntense` | `0 0 60px rgba(171,0,19,0.6)` | `BoxShadow(blurRadius: 60, color: Color(0x99AB0013))` |

---

## Animations & Transitions

### Durations

| Token | Duration | Curve |
|-------|----------|-------|
| `fast` | 150ms | ease |
| `normal` | 300ms | ease |
| `slow` | 400ms | ease |
| `bouncy` | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `smooth` | 400ms | `cubic-bezier(0.4, 0, 0.2, 1)` |

### Flutter Curves

```dart
// Bouncy curve for interactive elements
final bouncyCurve = Curves.elasticOut;

// Smooth curve for transitions
final smoothCurve = Curves.easeInOutCubic;
```

### Common Animations

| Animation | Properties |
|-----------|------------|
| Card Hover | `translateY(-4px)` + `shadow: medium` |
| Card Interactive | `translateY(-4px) scale(1.01)` |
| Button Hover | `translateY(-2px)` + glow |
| Hover Lift | `translateY(-4px)` |
| Hover Scale | `scale(1.02)` |

---

## Component Sizes

### Avatar

| Size | Value (px) | Flutter |
|------|------------|---------|
| `xs` | 24 | `24.0` |
| `sm` | 32 | `32.0` |
| `md` | 40 | `40.0` |
| `lg` | 48 | `48.0` |
| `xl` | 64 | `64.0` |
| `2xl` | 80 | `80.0` |

### Button Height

| Size | Value (px) |
|------|------------|
| `sm` | 32 |
| `md` | 40 |
| `lg` | 48 |

### Input Height

| Size | Value (px) |
|------|------------|
| `sm` | 36 |
| `md` | 44 |
| `lg` | 52 |

### Icon

| Size | Value (px) |
|------|------------|
| `xs` | 12 |
| `sm` | 16 |
| `md` | 20 |
| `lg` | 24 |
| `xl` | 32 |

### Chip Height

| Size | Value (px) |
|------|------------|
| `sm` | 28 |
| `md` | 36 |
| `lg` | 44 |

---

## Aspect Ratios

| Type | Ratio | Flutter |
|------|-------|---------|
| Video/Thumbnail | 16:9 | `16 / 9` |
| Short | 9:16 | `9 / 16` |
| Square | 1:1 | `1.0` |
| Portrait | 3:4 | `3 / 4` |
| Banner | 21:9 | `21 / 9` |

---

## Grid Configurations

### Media Grid (Videos)

| Breakpoint | Columns |
|------------|---------|
| Mobile (<640px) | 1 |
| sm (640px) | 2 |
| md (768px) | 3 |
| lg (1024px) | 4 |
| xl (1280px) | 5 |

### Creator Grid

| Breakpoint | Columns |
|------------|---------|
| Mobile | 1 |
| sm | 2 |
| md | 3 |
| lg | 4 |

### Series Grid

| Breakpoint | Columns |
|------------|---------|
| Mobile | 1 |
| sm | 2 |
| lg | 3 |
| xl | 4 |

### Grid Gap

| Context | Mobile | Desktop |
|---------|--------|---------|
| Media Grid | 16px | 24px |
| Creator Grid | 24px | 24px |
| Series Grid | 24px | 24px |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `base` | 0 | Default |
| `dropdown` | 10 | Dropdowns |
| `sticky` | 20 | Sticky headers |
| `fixed` | 30 | Fixed elements |
| `modalBackdrop` | 40 | Modal overlay |
| `modal` | 50 | Modal content |
| `popover` | 60 | Popovers |
| `tooltip` | 70 | Tooltips |
| `toast` | 80 | Toast notifications |

---

## Breakpoints

| Token | Value |
|-------|-------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1400px |

---

## Special Effects

### Glass Morphism

```css
/* Standard glass */
background: rgba(13, 13, 13, 0.85);
backdrop-filter: blur(24px);
border: 1px solid rgba(31, 31, 31, 0.5);

/* Strong glass */
background: rgba(13, 13, 13, 0.95);
backdrop-filter: blur(32px);
border: 1px solid rgba(31, 31, 31, 0.6);
```

### Flutter Glass

```dart
// Standard glass
Container(
  decoration: BoxDecoration(
    color: Color(0xD90D0D0D), // 85% opacity
    border: Border.all(color: Color(0x801F1F1F)),
  ),
  child: BackdropFilter(
    filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
    child: content,
  ),
)
```

### Skeleton Loading

```dart
// Shimmer animation colors
final shimmerGradient = LinearGradient(
  colors: [
    Color(0xFF0D0D0D),
    Color(0xFF1A1A1A),
    Color(0xFF0D0D0D),
  ],
);
```

### Gradient Text

```dart
ShaderMask(
  shaderCallback: (bounds) => LinearGradient(
    colors: [Color(0xFFD4001A), Color(0xFFAB0013)],
  ).createShader(bounds),
  child: Text('Gradient', style: TextStyle(color: Colors.white)),
)
```

---

## Flutter Theme Reference

```dart
class TabooColors {
  // Backgrounds
  static const background = Color(0xFF000000);
  static const surface = Color(0xFF0D0D0D);
  static const surfaceHover = Color(0xFF161616);
  static const elevated = Color(0xFF1A1A1A);
  static const card = Color(0xFF131315);

  // Text
  static const textPrimary = Color(0xFFE6E7EA);
  static const textSecondary = Color(0xFF9AA0A6);
  static const textTertiary = Color(0xFF6B7280);
  static const textMuted = Color(0xFF4B5563);

  // Brand Red
  static const redPrimary = Color(0xFFAB0013);
  static const redHover = Color(0xFFD4001A);
  static const redDark = Color(0xFF8A0010);
  static const redDeep = Color(0xFF7A000E);

  // Borders
  static const borderDefault = Color(0xFF1F1F1F);
  static const borderSubtle = Color(0x0FFFFFFF);
  static const borderHover = Color(0x1AFFFFFF);

  // Semantic
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);
}

class TabooSpacing {
  static const s0 = 0.0;
  static const s1 = 4.0;
  static const s2 = 8.0;
  static const s3 = 12.0;
  static const s4 = 16.0;
  static const s5 = 20.0;
  static const s6 = 24.0;
  static const s8 = 32.0;
  static const s10 = 40.0;
  static const s12 = 48.0;
  static const s16 = 64.0;
}

class TabooRadius {
  static const none = 0.0;
  static const xs = 4.0;
  static const sm = 6.0;
  static const md = 8.0;
  static const lg = 12.0;
  static const xl = 16.0;
  static const xxl = 20.0;
  static const full = 9999.0;
}
```

---

## Source Files

- Web tokens: `src/lib/design-tokens.ts`
- CSS variables: `src/app/globals.css`
- UI components: `src/components/ui/`
