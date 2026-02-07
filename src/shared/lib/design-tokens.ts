/**
 * TabooTV Design System - Design Tokens
 *
 * This file is the single source of truth for all design values in the application.
 * Use these tokens for consistent spacing, colors, typography, and component styling.
 */

// ============================================
// COLORS
// ============================================

export const colors = {
  // Background Colors - Pure Black Theme
  bg: {
    primary: '#000000',
    surface: '#0d0d0d',
    surfaceHover: '#161616',
    elevated: '#1a1a1a',
    card: '#131315',
  },

  // Text Colors
  text: {
    primary: '#e6e7ea',
    secondary: '#9aa0a6',
    tertiary: '#6b7280',
    muted: '#4b5563',
    inverse: '#000000',
  },

  // Taboo Red - Brand Colors
  red: {
    primary: '#ab0013',
    hover: '#d4001a',
    dark: '#8a0010',
    deep: '#7a000e',
    muted: 'rgba(171, 0, 19, 0.1)',
    glow: 'rgba(171, 0, 19, 0.4)',
  },

  // UI Colors
  border: {
    default: '#1f1f1f',
    subtle: 'rgba(255, 255, 255, 0.06)',
    hover: 'rgba(255, 255, 255, 0.1)',
    accent: 'rgba(171, 0, 19, 0.3)',
  },

  // Semantic Colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Overlay Colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.6)',
    gradient: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%)',
  },
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// Page-level spacing
export const pageSpacing = {
  // Horizontal padding
  paddingX: {
    mobile: spacing[4], // 16px
    tablet: spacing[8], // 32px
    desktop: spacing[16], // 64px
  },
  // Vertical padding
  paddingY: {
    mobile: spacing[6], // 24px
    desktop: spacing[8], // 32px
  },
  // Max content width
  maxWidth: {
    content: '1400px',
    narrow: '800px',
    wide: '1600px',
    account: '1080px',
    accountNarrow: '600px',
  },
  // Section spacing
  sectionGap: spacing[10], // 40px
  // Header to content gap
  headerGap: spacing[8], // 32px
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  // Font Family
  fontFamily: {
    sans: 'var(--font-figtree), system-ui, sans-serif',
    mono: 'ui-monospace, monospace',
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },

  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// Typography presets for common use cases
export const textStyles = {
  // Hero titles (homepage, featured sections)
  hero: {
    fontSize: { mobile: typography.fontSize['4xl'], desktop: typography.fontSize['5xl'] },
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.lineHeight.tight,
  },
  // Page titles
  pageTitle: {
    fontSize: { mobile: typography.fontSize['2xl'], desktop: typography.fontSize['3xl'] },
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.lineHeight.tight,
  },
  // Section titles
  sectionTitle: {
    fontSize: { mobile: typography.fontSize.lg, desktop: typography.fontSize.xl },
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.lineHeight.snug,
  },
  // Card titles
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.lineHeight.snug,
  },
  // Body text variants
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
  },
  bodyBase: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  // Labels and captions
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: '0px',
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
} as const;

// Component-specific radii
export const componentRadius = {
  button: borderRadius.lg,
  card: borderRadius.xl,
  thumbnail: borderRadius.lg,
  avatar: borderRadius.full,
  input: borderRadius.lg,
  chip: borderRadius.full,
  modal: borderRadius.xl,
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  none: 'none',
  low: '0 4px 12px rgba(0, 0, 0, 0.4)',
  medium: '0 8px 32px rgba(0, 0, 0, 0.6)',
  high: '0 16px 64px rgba(0, 0, 0, 0.8)',
  // Card hover shadow
  cardHover: '0 12px 40px rgba(0, 0, 0, 0.5)',
} as const;

// Red glow effects
export const glowEffects = {
  soft: '0 0 20px rgba(171, 0, 19, 0.3)',
  medium: '0 0 30px rgba(171, 0, 19, 0.4)',
  strong: '0 0 40px rgba(171, 0, 19, 0.5)',
  intense: '0 0 60px rgba(171, 0, 19, 0.6)',
} as const;

// ============================================
// TRANSITIONS
// ============================================

export const transitions = {
  fast: '0.15s ease',
  normal: '0.3s ease',
  slow: '0.4s ease',
  bouncy: '0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const;

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px',
} as const;

// ============================================
// GRID CONFIGURATION
// ============================================

export const grid = {
  // Video/Media card grid
  mediaGrid: {
    columns: {
      mobile: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
    },
    gap: {
      mobile: spacing[4],
      desktop: spacing[6],
    },
  },
  // Creator card grid
  creatorGrid: {
    columns: {
      mobile: 1,
      sm: 2,
      md: 3,
      lg: 4,
    },
    gap: spacing[6],
  },
  // Series card grid
  seriesGrid: {
    columns: {
      mobile: 1,
      sm: 2,
      lg: 3,
      xl: 4,
    },
    gap: spacing[6],
  },
} as const;

// ============================================
// ASPECT RATIOS
// ============================================

export const aspectRatios = {
  video: '16/9',
  thumbnail: '16/9',
  short: '9/16',
  square: '1/1',
  portrait: '3/4',
  banner: '21/9',
} as const;

// ============================================
// COMPONENT SIZES
// ============================================

export const componentSizes = {
  // Avatar sizes
  avatar: {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
    '2xl': '80px',
  },
  // Button heights
  button: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },
  // Input heights
  input: {
    sm: '36px',
    md: '44px',
    lg: '52px',
  },
  // Icon sizes
  icon: {
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
  },
  // Chip sizes
  chip: {
    sm: '28px',
    md: '36px',
    lg: '44px',
  },
} as const;

// ============================================
// CARD CONFIGURATIONS
// ============================================

export const cardConfig = {
  // Media card (videos, series)
  media: {
    borderRadius: componentRadius.card,
    thumbnailRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
    hoverTransform: 'translateY(-4px)',
    hoverShadow: shadows.cardHover,
  },
  // Creator card
  creator: {
    borderRadius: componentRadius.card,
    avatarSize: componentSizes.avatar.lg,
    padding: spacing[4],
    hoverTransform: 'translateY(-8px) scale(1.02)',
  },
  // Post card
  post: {
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    avatarSize: componentSizes.avatar.md,
  },
} as const;

// ============================================
// EXPORT ALL
// ============================================

export const designTokens = {
  colors,
  spacing,
  pageSpacing,
  typography,
  textStyles,
  borderRadius,
  componentRadius,
  shadows,
  glowEffects,
  transitions,
  zIndex,
  breakpoints,
  grid,
  aspectRatios,
  componentSizes,
  cardConfig,
} as const;

export default designTokens;
