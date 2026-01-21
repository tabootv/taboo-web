# Creator Profile Page Documentation

> Complete documentation for the `/[handler]` dynamic creator profile page with copy-paste ready code snippets.

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Design System](#design-system)
3. [UI Components](#ui-components)
4. [Section Components](#section-components)
5. [API Layer](#api-layer)
6. [Utility Functions](#utility-functions)
7. [SVG Icons](#svg-icons)
8. [File Paths Reference](#file-paths-reference)

---

## Overview & Architecture

### Route Structure

- **Route**: `/[handler]` (dynamic route)
- **Pattern**: `https://example.com/{creator-handler}`
- **Example**: `https://example.com/johndoe`

### Page Flow

```
page.tsx (Server Component)
    │
    ├── generateMetadata() - Dynamic SEO
    │
    └── CreatorPageContent.tsx (Client Component)
            │
            ├── useCreatorByHandler() - Fetch creator data
            ├── useVideos() - Fetch long videos
            ├── useVideos() - Fetch short videos
            │
            └── Renders:
                ├── CreatorHeader
                ├── CreatorTabs
                ├── CreatorFeaturedVideo
                ├── CreatorVideoGrid
                ├── CreatorShortsGrid
                ├── ContentGlobe
                └── Subscribe CTA Section
```

### Dependencies

```json
{
  "dependencies": {
    "next": "^14.x || ^15.x",
    "react": "^18.x || ^19.x",
    "d3": "^7.x",
    "zod": "^3.x",
    "@tanstack/react-query": "^5.x",
    "tailwindcss": "^3.x || ^4.x"
  }
}
```

---

## Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#000000` | Page background |
| Surface | `#0a0a0a`, `#111`, `#1a1a1a` | Cards, containers |
| Primary | `#AB0113` | CTA buttons, accents |
| Primary Hover | `#c41420` | Button hover state |
| Text Primary | `#ffffff` | Headings, body |
| Text Secondary | `rgba(255,255,255,0.7)` | Descriptions |
| Text Muted | `rgba(255,255,255,0.4-0.5)` | Timestamps, labels |
| Border | `rgba(255,255,255,0.06-0.2)` | Subtle dividers |

### Typography

Fluid sizing using CSS `clamp()`:

```css
/* Heading 1 */
font-size: clamp(28px, 6vw, 42px);

/* Body/Description */
font-size: clamp(14px, 3.5vw, 16px);
```

### Responsive Breakpoints (Tailwind)

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

### Animations

```css
/* Hover Transform */
transition: all 0.25s ease;
transform: translateY(-4px) scale(1.02);

/* Shadow on Hover */
box-shadow: 0 8px 30px rgba(171, 0, 19, 0.2);

/* Scale Effect */
transform: scale(1.05);
```

---

## UI Components

### cn() - Class Name Utility

```typescript
// src/lib/utils/cn.ts

type ClassValue = string | number | boolean | undefined | null | { [key: string]: boolean } | ClassValue[];

function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = clsx(...input);
      if (inner) classes.push(inner);
    } else if (typeof input === "object") {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(" ");
}

function twMerge(classNames: string): string {
  return classNames;
}

export function cn(...inputs: ClassValue[]): string {
  try {
    const merged = clsx(...inputs);
    return twMerge(merged);
  } catch {
    return clsx(...inputs);
  }
}
```

### Types

```typescript
// src/types/index.ts

export type ButtonVariant = "primary" | "secondary" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type TextVariant = "body" | "small" | "large" | "lead";
```

### Button Component

```tsx
// src/components/ui/Button/Button.tsx

"use client";

import { cn } from "@/lib/utils/cn";
import type { ButtonSize, ButtonVariant } from "@/types";
import NextLink from "next/link";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentProps,
  forwardRef,
  Ref,
} from "react";

type BaseButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
};

type ButtonAsButton = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
    external?: never;
  };

type ButtonAsInternalLink = BaseButtonProps &
  Omit<ComponentProps<typeof NextLink>, "href" | "className"> & {
    href: string;
    external?: false;
  };

type ButtonAsExternalLink = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    external: true;
  };

export type ButtonProps =
  | ButtonAsButton
  | ButtonAsInternalLink
  | ButtonAsExternalLink;

function isExternalLink(href: string | undefined): href is string {
  if (!href) return false;
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  );
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      href,
      external,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary: "bg-[#AB0013]! text-white font-bold hover:bg-[#AB0013]/90",
      secondary:
        "border border-solid border-black/[.08] hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]",
      outline:
        "border border-white/20 bg-transparent hover:bg-white/10 text-white",
    };

    const sizes = {
      sm: "h-10 px-4 text-sm",
      md: "h-12 px-5 text-base",
      lg: "h-14 px-6 text-lg",
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (href) {
      if (external || isExternalLink(href)) {
        return (
          <a
            ref={ref as Ref<HTMLAnchorElement>}
            href={href}
            className={classes}
            target="_blank"
            rel="noopener noreferrer"
            {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {children}
          </a>
        );
      }

      const { href: _, ...linkProps } = props as ComponentProps<
        typeof NextLink
      >;
      return (
        <NextLink
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...linkProps}
        >
          {children}
        </NextLink>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        className={classes}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

### Heading Component

```tsx
// src/components/ui/Heading/Heading.tsx

import { cn } from "@/lib/utils/cn";
import type { HeadingLevel } from "@/types";
import { HTMLAttributes, JSX, createElement } from "react";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  as?: HeadingLevel;
}

export function Heading({
  level,
  as,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = `h${as || level}` as keyof JSX.IntrinsicElements;

  const styles = {
    1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight",
    2: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight",
    3: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight",
    4: "text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold",
    5: "text-base sm:text-lg md:text-xl font-semibold",
    6: "text-sm sm:text-base md:text-lg font-semibold",
  };

  return createElement(
    Tag,
    {
      className: cn(styles[level], className),
      ...props,
    },
    children
  );
}
```

### Text Component

```tsx
// src/components/ui/Text/Text.tsx

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import type { TextVariant } from "@/types";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  as?: "p" | "span" | "div";
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = "body", as: Component = "p", ...props }, ref) => {
    const variants = {
      body: "text-base leading-7",
      small: "text-sm leading-6",
      large: "text-lg leading-8",
      lead: "text-xl leading-8",
    };

    return (
      <Component
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);

Text.displayName = "Text";
```

### Image Component

```tsx
// src/components/ui/Image/Image.tsx

import NextImage from "next/image";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export interface ImageProps extends ComponentProps<typeof NextImage> {
  alt: string;
}

export function Image({
  className,
  loading = "lazy",
  ...props
}: ImageProps) {
  return (
    <NextImage
      className={cn("object-cover", className)}
      loading={loading}
      {...props}
      alt={props.alt}
    />
  );
}
```

---

## Section Components

### Types

```typescript
// src/components/sections/CreatorProfile/types.ts

import type { Creator, Video } from "@/lib/api-v2";

export type TabType = "home" | "videos" | "shorts";

export interface CreatorHeaderProps {
  creator: Creator;
  featuredVideoThumbnail?: string;
  stats: Array<{
    key: string;
    label: string;
    value: number;
    icon: React.ReactNode;
  }>;
  socialLinks: Array<{
    key: string;
    url: string;
    icon: React.ReactNode;
    label: string;
  }>;
  checkoutUrl: string;
}

export interface CreatorTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasShorts: boolean;
}

export interface CreatorFeaturedVideoProps {
  video: Video;
  checkoutUrl: string;
}

export interface CreatorVideoGridProps {
  videos: Video[];
  checkoutUrl: string;
  variant?: "grid" | "rail";
}

export interface CreatorShortsGridProps {
  shorts: Video[];
  checkoutUrl: string;
  variant?: "grid" | "rail";
}

export interface CreatorGlobeSectionProps {
  creatorName: string;
  checkoutUrl: string;
}
```

### Page (Server Component)

```tsx
// src/app/[handler]/page.tsx

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Metadata } from "next";
import { CreatorPageContent } from "./CreatorPageContent";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ handler: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handler } = await params;

  return {
    title: `${handler} | Taboo TV`,
    description: `Explore ${handler}'s raw, unfiltered content from around the world on Taboo TV.`,
    openGraph: {
      title: `${handler} | Taboo TV`,
      description: `Explore ${handler}'s raw, unfiltered content from around the world on Taboo TV.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${handler} | Taboo TV`,
      description: `Explore ${handler}'s raw, unfiltered content from around the world on Taboo TV.`,
    },
  };
}

export default async function CreatorPage({ params }: PageProps) {
  const { handler } = await params;

  if (!handler) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="relative min-h-screen">
        <CreatorPageContent handler={handler} />
      </main>
      <Footer />
    </>
  );
}
```

### CreatorPageContent (Main Orchestrator)

```tsx
// src/app/[handler]/CreatorPageContent.tsx

"use client";

import {
  CreatorFeaturedVideo,
  CreatorHeader,
  CreatorShortsGrid,
  CreatorTabs,
  CreatorVideoGrid,
  type TabType,
} from "@/components/sections/CreatorProfile";
import { Button } from "@/components/ui/Button";
import { ContentGlobe } from "@/components/ui/ContentGlobe";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { useCreatorByHandler, useVideos } from "@/lib/api-v2";
import { useAffiliateTracking } from "@/lib/hooks/use-affiliate-tracking";
import { buildCheckoutUrl } from "@/lib/utils/affiliate-tracking";
import { useMemo, useState } from "react";

const CHECKOUT_BASE_URL = "https://taboo.tv/choose-plan";
const GLOBE_URL = "https://taboo.tv/globe";

function VideoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ShortsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function buildSocialUrl(
  platform: string,
  handle: string | null | undefined
): string | null {
  if (!handle) return null;
  if (handle.startsWith("http://") || handle.startsWith("https://"))
    return handle;
  const cleanHandle = handle.replace(/^@/, "");
  switch (platform) {
    case "x":
      return `https://x.com/${cleanHandle}`;
    case "tiktok":
      return `https://tiktok.com/@${cleanHandle}`;
    case "instagram":
      return `https://instagram.com/${cleanHandle}`;
    case "facebook":
      return `https://facebook.com/${cleanHandle}`;
    case "youtube":
      return `https://youtube.com/@${cleanHandle}`;
    default:
      return null;
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface CreatorPageContentProps {
  handler: string;
}

export function CreatorPageContent({ handler }: CreatorPageContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const trackingData = useAffiliateTracking();

  const {
    data: creatorData,
    isLoading: creatorLoading,
    error: creatorError,
    refetch: refetchCreator,
  } = useCreatorByHandler(handler, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const creator = creatorData?.creators?.[0];

  const { data: videosData, isLoading: videosLoading } = useVideos(
    creator
      ? {
          creators: String(creator.id),
          short: false,
          sort_by: "latest",
          per_page: 60,
        }
      : undefined,
    {
      enabled: !!creator,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const { data: shortsData, isLoading: shortsLoading } = useVideos(
    creator
      ? {
          creators: String(creator.id),
          short: true,
          sort_by: "latest",
          per_page: 60,
        }
      : undefined,
    {
      enabled: !!creator,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const longVideos = videosData?.videos || [];
  const shortVideos = shortsData?.videos || [];
  const featuredVideo = longVideos[0];
  const latestVideos = longVideos.slice(1);
  const randomShorts = useMemo(() => shuffleArray(shortVideos), [shortVideos]);

  const checkoutUrl = useMemo(
    () => buildCheckoutUrl(CHECKOUT_BASE_URL, trackingData),
    [trackingData]
  );

  const globeUrl = useMemo(
    () => buildCheckoutUrl(GLOBE_URL, trackingData),
    [trackingData]
  );

  const stats = useMemo(() => {
    if (!creator) return [];
    return [
      {
        key: "videos",
        label: "Videos",
        value: creator.total_videos ?? longVideos.length,
        icon: <VideoIcon />,
      },
      {
        key: "shorts",
        label: "Shorts",
        value: creator.total_shorts ?? shortVideos.length,
        icon: <ShortsIcon />,
      },
      {
        key: "countries",
        label: "Countries Recorded",
        value: creator.countries_recorded ?? 0,
        icon: <GlobeIcon />,
      },
    ].filter((s) => Number(s.value) > 0);
  }, [creator, longVideos.length, shortVideos.length]);

  const socialLinks = useMemo(() => {
    if (!creator) return [];
    return [
      {
        key: "x",
        url: buildSocialUrl("x", creator.x),
        icon: <XIcon />,
        label: "X",
      },
      {
        key: "tiktok",
        url: buildSocialUrl("tiktok", creator.tiktok),
        icon: <TikTokIcon />,
        label: "TikTok",
      },
      {
        key: "instagram",
        url: buildSocialUrl("instagram", creator.instagram),
        icon: <InstagramIcon />,
        label: "Instagram",
      },
      {
        key: "facebook",
        url: buildSocialUrl("facebook", creator.facebook),
        icon: <FacebookIcon />,
        label: "Facebook",
      },
      {
        key: "youtube",
        url: buildSocialUrl("youtube", creator.youtube),
        icon: <YouTubeIcon />,
        label: "YouTube",
      },
    ]
      .filter((s) => s.url !== null)
      .map((s) => ({ ...s, url: s.url! }));
  }, [creator]);

  if (creatorLoading || videosLoading || shortsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div
          className="w-10 h-10 rounded-full border-4 border-[#1a1a1a] border-t-[#AB0113]"
          style={{
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (creatorError || !creator) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Text variant="small" className="text-white/50">
            {creatorError ? "Failed to load creator" : "Creator not found"}
          </Text>
          <Button
            onClick={() => refetchCreator()}
            className="px-6 py-2.5 bg-[#AB0113] text-white text-sm font-semibold rounded-lg hover:bg-[#c41420] hover:scale-105 transition-all"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <CreatorHeader
        creator={creator}
        featuredVideoThumbnail={featuredVideo?.thumbnail}
        stats={stats}
        socialLinks={socialLinks}
        checkoutUrl={checkoutUrl}
      />

      <CreatorTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasShorts={shortVideos.length > 0}
      />

      {activeTab === "home" && (
        <>
          {featuredVideo && (
            <CreatorFeaturedVideo
              video={featuredVideo}
              checkoutUrl={checkoutUrl}
            />
          )}

          {latestVideos.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
              <Heading
                level={2}
                className="text-white font-semibold mb-4 sm:mb-6 text-lg sm:text-xl"
              >
                Latest Videos
              </Heading>
              <CreatorVideoGrid
                videos={latestVideos}
                checkoutUrl={checkoutUrl}
                variant="rail"
              />
              <div className="mt-5 text-center">
                <button
                  onClick={() => setActiveTab("videos")}
                  className="inline-flex items-center gap-1.5 text-white/50 text-sm font-medium bg-transparent border-none cursor-pointer hover:text-white transition-colors"
                >
                  Show more{" "}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </section>
          )}

          {shortVideos.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
              <div className="flex justify-between items-center mb-4">
                <Heading
                  level={2}
                  className="text-white font-semibold m-0 text-lg sm:text-xl"
                >
                  Shorts
                </Heading>
                <button
                  onClick={() => setActiveTab("shorts")}
                  className="inline-flex items-center gap-1.5 text-white/50 text-sm font-medium bg-transparent border-none cursor-pointer hover:text-white transition-colors"
                >
                  View all{" "}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
              <CreatorShortsGrid
                shorts={shortVideos.slice(0, 8)}
                checkoutUrl={checkoutUrl}
                variant="rail"
              />
            </section>
          )}

          <ContentGlobe
            creatorHandler={handler}
            maxMarkers={15}
            height="600px"
            minHeight="400px"
            ariaLabel="Interactive world globe showing creator locations"
          />

          <section className="bg-linear-to-b from-black to-[#0a0a0a] py-14 sm:py-16 px-5 sm:px-10 text-center">
            <div className="max-w-2xl mx-auto">
              <Heading
                level={2}
                className="text-white font-semibold mb-3 text-lg sm:text-xl"
              >
                Ready to unlock all content?
              </Heading>
              <Text
                variant="small"
                className="text-white/40 mb-7 text-sm sm:text-base"
              >
                Subscribe to TabooTV for unlimited access to all creators.
              </Text>
              <Button
                href={checkoutUrl}
                external={true}
                className="px-10 py-4 bg-[#AB0113] text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              >
                Subscribe Now
              </Button>
            </div>
          </section>
        </>
      )}

      {activeTab === "videos" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
          <Heading
            level={2}
            className="text-white font-semibold mb-4 sm:mb-6 text-lg sm:text-xl"
          >
            Videos
          </Heading>
          <CreatorVideoGrid videos={longVideos} checkoutUrl={checkoutUrl} />
        </section>
      )}

      {activeTab === "shorts" && shortVideos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
          <Heading
            level={2}
            className="text-white font-semibold mb-4 sm:mb-6 text-lg sm:text-xl"
          >
            Shorts
          </Heading>
          <CreatorShortsGrid shorts={randomShorts} checkoutUrl={checkoutUrl} />
        </section>
      )}
    </div>
  );
}
```

### CreatorHeader

```tsx
// src/components/sections/CreatorProfile/CreatorHeader.tsx

"use client";

import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils/cn";
import type { CreatorHeaderProps } from "./types";

function VerifiedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#ab0013">
      <circle cx="12" cy="12" r="10" fill="#ab0013" />
      <path
        d="M9 12l2 2 4-4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CreatorHeader({
  creator,
  featuredVideoThumbnail,
  stats,
  socialLinks,
  checkoutUrl,
}: CreatorHeaderProps) {
  return (
    <section className="relative min-h-[60vh] flex items-end pb-12 pt-[130px]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        {featuredVideoThumbnail && (
          <Image
            src={featuredVideoThumbnail}
            alt=""
            width={1920}
            height={1080}
            className="w-full h-full object-cover opacity-35 blur-sm"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 60%, #000 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex justify-center">
        <div className="max-w-2xl text-center flex flex-col items-center">
          {/* Avatar */}
          <div
            className="rounded-full overflow-hidden border-[3px] border-white/20 mb-4"
            style={{
              width: "clamp(70px, 18vw, 90px)",
              height: "clamp(70px, 18vw, 90px)",
            }}
          >
            <Image
              src={creator.dp}
              alt={creator.name}
              width={90}
              height={90}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name */}
          <div className="flex items-center gap-3 mb-2.5">
            <Heading
              level={1}
              className="text-white font-bold m-0"
              style={{ fontSize: "clamp(28px, 6vw, 42px)" }}
            >
              {creator.name}
            </Heading>
            <span className="shrink-0">
              <VerifiedIcon />
            </span>
          </div>

          {/* Tagline */}
          {creator.description && (
            <Text
              variant="lead"
              className="text-white/70 mb-5 max-w-[520px]"
              style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}
            >
              {creator.description.slice(0, 100)}
            </Text>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="flex items-center justify-center flex-wrap gap-1 mb-4 text-sm text-white/70">
              {stats.map((stat, idx) => (
                <span
                  key={stat.key}
                  className="inline-flex items-center gap-1.5"
                >
                  <span className="text-[#AB0113] flex">{stat.icon}</span>
                  <span>
                    {stat.value} {stat.label}
                  </span>
                  {idx < stats.length - 1 && (
                    <span className="text-white/40 mx-2">•</span>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.key}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center justify-center",
                    "w-10 h-10 rounded-full",
                    "bg-white/10 border border-white/15",
                    "text-white/70",
                    "transition-all duration-200",
                    "hover:scale-115 hover:text-white hover:bg-[#AB0113]/30"
                  )}
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}

          {/* CTA */}
          <Button
            href={checkoutUrl}
            external={true}
            className={cn(
              "px-7 py-3.5",
              "bg-[#AB0113] text-white",
              "text-sm font-semibold rounded-lg",
              "transition-all duration-200",
              "hover:scale-105 hover:shadow-[0_6px_20px_rgba(171,0,19,0.35)]",
              "relative z-10"
            )}
          >
            Start watching on Taboo
          </Button>
        </div>
      </div>
    </section>
  );
}
```

### CreatorTabs

```tsx
// src/components/sections/CreatorProfile/CreatorTabs.tsx

"use client";

import type { CreatorTabsProps } from "./types";
import { cn } from "@/lib/utils/cn";

export function CreatorTabs({
  activeTab,
  onTabChange,
  hasShorts,
}: CreatorTabsProps) {
  const tabs = [
    { key: "home" as const, label: "Home" },
    { key: "videos" as const, label: "Videos" },
    ...(hasShorts ? [{ key: "shorts" as const, label: "Shorts" }] : []),
  ];

  return (
    <section className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-t border-white/6 border-b border-white/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex justify-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "bg-transparent border-none",
              "text-sm sm:text-base font-semibold",
              "px-2 py-2",
              "border-b-2 border-transparent",
              "transition-all duration-200",
              "hover:text-white/80",
              activeTab === tab.key
                ? "text-white border-b-2 border-[#AB0113]"
                : "text-white/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  );
}
```

### CreatorFeaturedVideo

```tsx
// src/components/sections/CreatorProfile/CreatorFeaturedVideo.tsx

"use client";

import { Image } from "@/components/ui/Image";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import type { CreatorFeaturedVideoProps } from "./types";
import { cn } from "@/lib/utils/cn";

function PlayIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

export function CreatorFeaturedVideo({
  video,
  checkoutUrl,
}: CreatorFeaturedVideoProps) {
  return (
    <section className="bg-black py-9">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <Heading
          level={2}
          className="text-white font-semibold mb-4 sm:mb-6 text-lg sm:text-xl"
        >
          Latest Release
        </Heading>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "block text-inherit no-underline",
            "transition-all duration-250",
            "hover:-translate-y-1 hover:scale-[1.02]",
            "hover:shadow-[0_8px_30px_rgba(171,0,19,0.2)]"
          )}
        >
          <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#111]">
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={1280}
              height={720}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="rounded-full bg-[#AB0113]/90 flex items-center justify-center backdrop-blur-sm shadow-[0_8px_32px_rgba(171,0,19,0.4)]"
                style={{
                  width: "clamp(44px, 10vw, 58px)",
                  height: "clamp(44px, 10vw, 58px)",
                }}
              >
                <PlayIcon />
              </div>
            </div>
            <div
              className="absolute top-4 right-4 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/70 flex items-center justify-center text-white"
            >
              <LockIcon />
            </div>
            {video.country && (
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-1 px-2.5 py-1.5 bg-black/75 rounded text-xs text-[#ccc] uppercase tracking-wide">
                <GlobeIcon /> {video.country}
              </div>
            )}
          </div>
          <div className="pt-4">
            <Heading
              level={3}
              className="text-white font-semibold mb-1.5 text-base sm:text-lg sm:mb-2"
            >
              {video.title}
            </Heading>
            {video.description && (
              <Text
                variant="small"
                className="text-white/60 mb-2.5 line-clamp-2"
              >
                {video.description}
              </Text>
            )}
            {video.country && (
              <span className="inline-flex items-center gap-1 text-xs text-white/60 bg-white/10 px-2.5 py-1 rounded-2xl">
                <GlobeIcon /> {video.country}
              </span>
            )}
          </div>
        </a>
      </div>
    </section>
  );
}
```

### CreatorVideoGrid

```tsx
// src/components/sections/CreatorProfile/CreatorVideoGrid.tsx

"use client";

import { Image } from "@/components/ui/Image";
import { Heading } from "@/components/ui/Heading";
import type { CreatorVideoGridProps } from "./types";
import { cn } from "@/lib/utils/cn";

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

export function CreatorVideoGrid({
  videos,
  checkoutUrl,
  variant = "grid",
}: CreatorVideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-white/40 text-sm py-10 text-center">
        No videos found.
      </div>
    );
  }

  if (variant === "rail") {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
        {videos.slice(0, 7).map((video) => (
          <a
            key={video.uuid}
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex-shrink-0 text-inherit no-underline",
              "w-[170px] sm:w-[200px] md:w-[260px]",
              "transition-all duration-250",
              "hover:-translate-y-1 hover:scale-[1.02]",
              "hover:shadow-[0_8px_30px_rgba(171,0,19,0.2)]"
            )}
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-[#111]">
              <Image
                src={video.thumbnail}
                alt={video.title}
                width={260}
                height={146}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white">
                <LockIcon />
              </div>
              {video.country && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/75 rounded text-[10px] text-[#ccc] uppercase tracking-wide">
                  {video.country}
                </div>
              )}
            </div>
            <Heading
              level={4}
              className="text-white font-medium mt-2.5 text-xs sm:text-sm line-clamp-2"
            >
              {video.title}
            </Heading>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-5",
        "grid-cols-1 sm:grid-cols-2",
        "lg:grid-cols-3 xl:grid-cols-4"
      )}
    >
      {videos.slice(0, 18).map((video) => (
        <a
          key={video.uuid}
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-inherit no-underline",
            "transition-all duration-250",
            "hover:-translate-y-1 hover:scale-[1.02]",
            "hover:shadow-[0_8px_30px_rgba(171,0,19,0.2)]"
          )}
        >
          <div className="relative aspect-video rounded-lg overflow-hidden bg-[#111]">
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={400}
              height={225}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white">
              <LockIcon />
            </div>
            {video.country && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/75 rounded text-[10px] text-[#ccc] uppercase tracking-wide">
                {video.country}
              </div>
            )}
          </div>
          <Heading
            level={4}
            className="text-white font-medium mt-2.5 text-xs sm:text-sm line-clamp-2"
          >
            {video.title}
          </Heading>
        </a>
      ))}
    </div>
  );
}
```

### CreatorShortsGrid

```tsx
// src/components/sections/CreatorProfile/CreatorShortsGrid.tsx

"use client";

import { Image } from "@/components/ui/Image";
import type { CreatorShortsGridProps } from "./types";
import { cn } from "@/lib/utils/cn";

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

export function CreatorShortsGrid({
  shorts,
  checkoutUrl,
  variant = "grid",
}: CreatorShortsGridProps) {
  if (shorts.length === 0) {
    return (
      <div className="text-white/40 text-sm py-10 text-center">
        No shorts found.
      </div>
    );
  }

  if (variant === "rail") {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
        {shorts.slice(0, 8).map((short, index) => (
          <a
            key={short.id || short.uuid || index}
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex-shrink-0 text-inherit no-underline",
              "w-[120px] sm:w-[140px] md:w-[160px]",
              "h-[214px] sm:h-[249px]",
              "rounded-lg overflow-hidden relative bg-[#1a1a1a]",
              "transition-all duration-250",
              "hover:scale-105 hover:shadow-[0_8px_25px_rgba(171,0,19,0.25)]"
            )}
          >
            <Image
              src={short.thumbnail}
              alt={short.title || ""}
              width={160}
              height={249}
              className="w-full h-full object-cover absolute top-0 left-0"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)",
              }}
            />
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white">
              <LockIcon />
            </div>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3.5",
        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        "lg:grid-cols-5 xl:grid-cols-6"
      )}
    >
      {shorts.map((short, index) => (
        <a
          key={short.id || short.uuid || index}
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "aspect-[9/16] rounded-lg overflow-hidden relative block bg-[#1a1a1a] min-h-[200px]",
            "transition-all duration-250",
            "hover:scale-105 hover:shadow-[0_8px_25px_rgba(171,0,19,0.25)]"
          )}
        >
          <Image
            src={short.thumbnail}
            alt={short.title || ""}
            width={160}
            height={249}
            className="w-full h-full object-cover absolute top-0 left-0"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)",
            }}
          />
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white">
            <LockIcon />
          </div>
        </a>
      ))}
    </div>
  );
}
```

### ContentGlobe

```tsx
// src/components/ui/ContentGlobe/ContentGlobe.tsx

"use client";

import * as d3 from "d3";
import { useEffect, useRef, useMemo } from "react";
import { useVideos, useVideosByHandler } from "@/lib/api-v2";
import type { Video } from "@/lib/api-v2/schemas/videos.schema";
import { useIsMobile } from "@/components/sections/CreatorShowcase/hooks/useIsMobile";

/**
 * Globe marker data structure
 */
interface GlobeMarker {
  id: number;
  title: string;
  image: string;
  coords: [number, number]; // [lng, lat]
  videoId: number;
}

export interface ContentGlobeProps {
  /**
   * Optional creator handler for filtering content.
   * - If provided: Only shows videos from this specific creator
   * - If omitted: Shows diverse mix from various creators (global)
   */
  creatorHandler?: string;

  /**
   * Number of videos to display on the globe
   * @default 15
   */
  maxMarkers?: number;

  /**
   * Globe height
   * @default "600px"
   */
  height?: string;

  /**
   * Minimum height
   * @default "400px"
   */
  minHeight?: string;

  /**
   * Only show short videos
   * @default false
   */
  showOnlyShorts?: boolean;

  /**
   * Aria label for accessibility
   */
  ariaLabel?: string;
}

/**
 * ContentGlobe - Reusable 3D globe component that displays video thumbnails
 *
 * @example
 * ```tsx
 * // Global mode (home page)
 * <ContentGlobe maxMarkers={15} />
 *
 * // Profile mode (creator page)
 * <ContentGlobe creatorHandler="johndoe" maxMarkers={10} />
 * ```
 */
export function ContentGlobe({
  creatorHandler,
  maxMarkers = 15,
  height = "600px",
  minHeight = "400px",
  showOnlyShorts = false,
  ariaLabel = "Interactive world globe showing video locations",
}: ContentGlobeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isMobile = useIsMobile(768);

  /**
   * Data Fetching Strategy:
   * - If creatorHandler is provided: Fetch videos for specific creator using useVideosByHandler
   * - Otherwise: Fetch global mix using useVideos
   */
  const globalVideosQuery = useVideos(
    {
      per_page: maxMarkers * 2, // Fetch extra in case some don't have coords
      sort_by: "latest",
      short: showOnlyShorts,
    },
    {
      enabled: !creatorHandler, // Only fetch if no creator specified
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  const creatorVideosQuery = useVideosByHandler(
    creatorHandler!,
    {
      enabled: !!creatorHandler, // Only fetch if creator specified
      staleTime: 5 * 60 * 1000,
    }
  );

  // Use the appropriate query based on context
  const videosQuery = creatorHandler ? creatorVideosQuery : globalVideosQuery;

  /**
   * Transform API videos into globe markers
   * Filter videos that have valid coordinates
   */
  const markers = useMemo<GlobeMarker[]>(() => {
    if (!videosQuery.data?.videos) return [];

    return videosQuery.data.videos
      .filter((video: Video) => {
        // Must have valid coordinates
        return (
          video.latitude != null &&
          video.longitude != null &&
          !Number.isNaN(video.latitude) &&
          !Number.isNaN(video.longitude) &&
          video.thumbnail
        );
      })
      .slice(0, maxMarkers)
      .map((video: Video) => ({
        id: video.id,
        title: video.title || video.channel?.name || "Untitled",
        image: video.thumbnail,
        coords: [video.longitude!, video.latitude!] as [number, number],
        videoId: video.id,
      }));
  }, [videosQuery.data?.videos, maxMarkers]);

  /**
   * D3 Globe Rendering
   */
  useEffect(() => {
    if (!svgRef.current || markers.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "transparent");

    svg.selectAll("*").remove();

    const scaleFactor = isMobile ? 0.5 : 0.4;

    const projection = d3
      .geoOrthographic()
      .scale(Math.min(width, height) * scaleFactor)
      .translate([width / 2, height / 2 + 20])
      .clipAngle(90);

    const path = d3.geoPath(projection);

    const g = svg.append("g");

    // Draw sphere background
    g.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path as any)
      .attr("fill", "#0a0a0a")
      .attr("stroke", "#222")
      .attr("stroke-width", 1);

    let timer: d3.Timer | null = null;

    // Load world map data
    d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ).then((world: any) => {
      // Draw countries
      g.selectAll(".country")
        .data(world.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path as any)
        .attr("fill", "#0f0f0f")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.4);

      const markerGroup = g.append("g");

      const cardW = isMobile ? 46 : 110;
      const cardH = isMobile ? 36.22 : 70;
      const gap = isMobile ? 8 : 20;

      const cardX = -(cardW / 2);
      const cardY = -(cardH + gap);

      // Create markers ONCE, not on every frame
      const markerElements = markerGroup
        .selectAll(".marker")
        .data(markers)
        .enter()
        .append("g")
        .attr("class", "marker")
        .style("pointer-events", "none");

      // Add location pin
      markerElements
        .append("circle")
        .attr("r", 4)
        .attr("cy", 8)
        .attr("fill", "#ff3b30")
        .attr("filter", "drop-shadow(0 0 4px rgba(255,59,48,0.8))");

      // Add video thumbnail cards
      markerElements
        .append("foreignObject")
        .attr("x", cardX)
        .attr("y", cardY)
        .attr("width", cardW)
        .attr("height", cardH)
        .html(
          (d) => `
  <div style="
    width:${cardW}px;
    height:${cardH}px;
    background:#111;
    border-radius:6px;
    overflow:hidden;
    box-shadow:0 4px 12px rgba(0,0,0,.8);
    font-family:Inter, system-ui, sans-serif;
  ">
    <img
      src="${d.image}"
      style="width:100%;height:100%;object-fit:cover"
      alt="${d.title}"
    />
  </div>
`
        );

      function updateMarkers(rotation: [number, number]) {
        markerElements
          .attr("transform", (d) => {
            const p = projection(d.coords);
            return p ? `translate(${p[0]}, ${p[1]})` : "";
          })
          .style("opacity", (d) => {
            const visible =
              d3.geoDistance(d.coords, [-rotation[0], -rotation[1]]) <
              Math.PI / 2;
            return visible ? 1 : 0;
          });
      }

      let rotation: [number, number] = [0, -20];

      // Animate globe rotation
      timer = d3.timer((elapsed) => {
        rotation[0] = elapsed * 0.01;
        projection.rotate(rotation);

        g.selectAll(".country").attr("d", path as any);
        g.selectAll("path").attr("d", path as any);

        // Only UPDATE positions, don't recreate
        updateMarkers(rotation);
      });
    });

    return () => {
      if (timer) {
        timer.stop();
        timer = null;
      }
      svg.selectAll("*").remove();
    };
  }, [isMobile, markers]);

  /**
   * Loading state
   */
  if (videosQuery.isLoading) {
    return (
      <div
        className="w-full flex items-center justify-center bg-black/20 rounded-lg"
        style={{ height, minHeight }}
      >
        <div className="text-white/60 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60 mx-auto mb-4" />
          <p>Loading globe...</p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (videosQuery.isError) {
    return (
      <div
        className="w-full flex items-center justify-center bg-black/20 rounded-lg"
        style={{ height, minHeight }}
      >
        <div className="text-white/60 text-center">
          <p>Unable to load globe content</p>
          {videosQuery.error && (
            <p className="text-sm mt-2">{videosQuery.error.getUserMessage()}</p>
          )}
        </div>
      </div>
    );
  }

  /**
   * No data state
   */
  if (markers.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center bg-black/20 rounded-lg"
        style={{ height, minHeight }}
      >
        <div className="text-white/60 text-center">
          <p>No videos with location data available</p>
        </div>
      </div>
    );
  }

  /**
   * Render globe
   */
  return (
    <div className="w-full" style={{ height, minHeight }}>
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
        aria-label={ariaLabel}
      />
    </div>
  );
}
```

### Index Export

```typescript
// src/components/sections/CreatorProfile/index.ts

export { CreatorFeaturedVideo } from "./CreatorFeaturedVideo";
export { CreatorGlobeSection } from "./CreatorGlobeSection";
export { CreatorHeader } from "./CreatorHeader";
export { CreatorShortsGrid } from "./CreatorShortsGrid";
export { CreatorTabs } from "./CreatorTabs";
export { CreatorVideoGrid } from "./CreatorVideoGrid";
export type * from "./types";
```

---

## API Layer

### Creator Schema

```typescript
// src/lib/api-v2/schemas/creators.schema.ts

/**
 * Creators Zod Schemas
 * Based on: docs/api/public-api.md
 */

import { z } from 'zod';

/**
 * Creator Schema
 * Matches the /api/public/creators response structure
 */
export const CreatorSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  paypal_link: z.string().nullable().optional(),
  handler: z.string().nullable(),
  x: z.string().nullable().optional(),
  tiktok: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  youtube: z.string().nullable().optional(),
  dp: z.string(),
  country: z.string().optional(),
  total_videos: z.number().optional(),
  total_shorts: z.number().optional(),
  countries_recorded: z.number().optional(),
});

/**
 * Creator Query Params
 */
export const CreatorQueryParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().max(100).optional(),
  id: z.number().int().positive().optional(),
  handler: z.string().optional(),
});

/**
 * Paginated Creators Response
 * Note: API returns "creators" key, not "data"
 */
export const PaginatedCreatorsSchema = z.object({
  creators: z.array(CreatorSchema),
  pagination: z.object({
    total: z.number(),
    per_page: z.number(),
    current_page: z.number(),
    last_page: z.number(),
    from: z.number().nullable().optional(),
    to: z.number().nullable().optional(),
  }).optional(),
});

/**
 * Export inferred types (single source of truth)
 */
export type Creator = z.infer<typeof CreatorSchema>;
export type CreatorQueryParams = z.infer<typeof CreatorQueryParamsSchema>;
export type PaginatedCreators = z.infer<typeof PaginatedCreatorsSchema>;
```

### Video Schema

```typescript
// src/lib/api-v2/schemas/videos.schema.ts

/**
 * Videos Zod Schemas
 * Based on: docs/api/public-api.md
 */

import { z } from 'zod';

/**
 * Channel Schema
 * Matches the channel object in video responses
 */
export const ChannelSchema = z.object({
  id: z.number(),
  name: z.string(),
  handler: z.string(),
  user_id: z.number(),
  dp: z.string(),
  x: z.string().nullable().optional(),
  tiktok: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  youtube: z.string().nullable().optional(),
});

/**
 * Video Schema
 * Matches the /api/public/map-videos response structure
 */
export const VideoSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string(),
  latitude: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return null;
      if (typeof val === "string") {
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      }
      return typeof val === "number" ? val : null;
    },
    z.number().nullable().optional()
  ),
  longitude: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return null;
      if (typeof val === "string") {
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      }
      return typeof val === "number" ? val : null;
    },
    z.number().nullable().optional()
  ),
  location: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  thumbnail: z.string(),
  video_url: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  channel: ChannelSchema.optional(),
  channel_id: z.number().optional(),
});

/**
 * Video Query Params
 */
export const VideoQueryParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().max(100).optional(),
  ids: z.string().optional(),
  creators: z.string().optional(),
  handler: z.string().optional(),
  short: z.boolean().optional(),
  sort_by: z.enum(['latest', 'oldest']).optional(),
  compact: z.boolean().optional(),
});

/**
 * Paginated Videos Response
 * Note: API returns "videos" key, not "data"
 */
export const PaginatedVideosSchema = z.object({
  videos: z.array(VideoSchema),
  pagination: z.object({
    total: z.number(),
    per_page: z.number(),
    current_page: z.number(),
    last_page: z.number(),
    from: z.number().nullable().optional(),
    to: z.number().nullable().optional(),
  }).optional(),
});

/**
 * Export inferred types (single source of truth)
 */
export type Video = z.infer<typeof VideoSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
export type VideoQueryParams = z.infer<typeof VideoQueryParamsSchema>;
export type PaginatedVideos = z.infer<typeof PaginatedVideosSchema>;
```

### Creators Hook

```typescript
// src/lib/api-v2/hooks/use-creators.ts

/**
 * Creators React Query Hooks
 * Type-safe hooks for fetching creators data
 */

import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import type { CreatorQueryParams, PaginatedCreators } from '../schemas/creators.schema';
import type { ApiError } from '../core/types';

// Import the API instance (will be provided via context)
import { api } from '../index';

/**
 * Query Keys Factory
 * Centralized query key management prevents cache conflicts
 */
export const creatorsKeys = {
  all: ['creators'] as const,
  lists: () => [...creatorsKeys.all, 'list'] as const,
  list: (params?: CreatorQueryParams) => [...creatorsKeys.lists(), params] as const,
  details: () => [...creatorsKeys.all, 'detail'] as const,
  detail: (id: number) => [...creatorsKeys.details(), id] as const,
  byHandler: (handler: string) => [...creatorsKeys.all, 'handler', handler] as const,
};

/**
 * Hook: Get all creators (paginated)
 *
 * @example
 * ```tsx
 * function CreatorsList() {
 *   const { data, isLoading, error } = useCreators({ page: 1, per_page: 20 });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.getUserMessage()}</div>;
 *
 *   return (
 *     <div>
 *       {data.data.map(creator => (
 *         <div key={creator.id}>{creator.name}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCreators(
  params?: CreatorQueryParams,
  options?: Omit<UseQueryOptions<PaginatedCreators, ApiError>, 'queryKey' | 'queryFn'>
): UseQueryResult<PaginatedCreators, ApiError> {
  return useQuery({
    queryKey: creatorsKeys.list(params),
    queryFn: ({ signal }) => api.creators.getAll(params, { signal }),
    ...options,
  });
}

/**
 * Hook: Get a single creator by ID
 *
 * @example
 * ```tsx
 * function CreatorProfile({ id }: { id: number }) {
 *   const { data, isLoading } = useCreator(id);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   const creator = data?.data[0];
 *   return <div>{creator?.name}</div>;
 * }
 * ```
 */
export function useCreator(
  id: number,
  options?: Omit<UseQueryOptions<PaginatedCreators, ApiError>, 'queryKey' | 'queryFn'>
): UseQueryResult<PaginatedCreators, ApiError> {
  return useQuery({
    queryKey: creatorsKeys.detail(id),
    queryFn: ({ signal }) => api.creators.getById(id, { signal }),
    ...options,
  });
}

/**
 * Hook: Get a single creator by handler
 *
 * @example
 * ```tsx
 * function CreatorProfile({ handler }: { handler: string }) {
 *   const { data, isLoading } = useCreatorByHandler(handler);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   const creator = data?.data[0];
 *   return <div>{creator?.name}</div>;
 * }
 * ```
 */
export function useCreatorByHandler(
  handler: string,
  options?: Omit<UseQueryOptions<PaginatedCreators, ApiError>, 'queryKey' | 'queryFn'>
): UseQueryResult<PaginatedCreators, ApiError> {
  return useQuery({
    queryKey: creatorsKeys.byHandler(handler),
    queryFn: ({ signal }) => api.creators.getByHandler(handler, { signal }),
    ...options,
  });
}

/**
 * Hook: Get creators with custom query
 *
 * This is the most flexible hook - use it when you need custom query params
 *
 * @example
 * ```tsx
 * function CreatorSearch() {
 *   const [page, setPage] = useState(1);
 *
 *   const { data, isLoading } = useCreatorsQuery({
 *     page,
 *     per_page: 50,
 *   });
 *
 *   return (
 *     <div>
 *       {data?.data.map(creator => ...)}
 *       <button onClick={() => setPage(p => p + 1)}>Next Page</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCreatorsQuery(
  params: CreatorQueryParams,
  options?: Omit<UseQueryOptions<PaginatedCreators, ApiError>, 'queryKey' | 'queryFn'>
): UseQueryResult<PaginatedCreators, ApiError> {
  return useQuery({
    queryKey: creatorsKeys.list(params),
    queryFn: ({ signal }) => api.creators.query(params, { signal }),
    ...options,
  });
}
```

### Videos Hook

```typescript
// src/lib/api-v2/hooks/use-videos.ts

/**
 * Videos React Query Hooks
 * Type-safe hooks for fetching videos data
 */

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/types";
import type {
  PaginatedVideos,
  VideoQueryParams,
} from "../schemas/videos.schema";

// Import the API instance (will be provided via context)
import { api } from "../index";

/**
 * Query Keys Factory
 * Centralized query key management prevents cache conflicts
 */
export const videosKeys = {
  all: ["videos"] as const,
  lists: () => [...videosKeys.all, "list"] as const,
  list: (params?: VideoQueryParams) => [...videosKeys.lists(), params] as const,
  details: () => [...videosKeys.all, "detail"] as const,
  detail: (id: number) => [...videosKeys.details(), id] as const,
  byHandler: (handler: string) =>
    [...videosKeys.all, "handler", handler] as const,
  byCreators: (creatorIds: number[]) =>
    [...videosKeys.all, "creators", creatorIds] as const,
};

/**
 * Hook: Get all videos (paginated)
 *
 * @example
 * ```tsx
 * function VideosList() {
 *   const { data, isLoading, error } = useVideos({
 *     page: 1,
 *     per_page: 15,
 *     sort_by: 'latest',
 *     short: false
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.getUserMessage()}</div>;
 *
 *   return (
 *     <div>
 *       {data.videos.map(video => (
 *         <div key={video.id}>{video.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useVideos(
  params?: VideoQueryParams,
  options?: Omit<
    UseQueryOptions<PaginatedVideos, ApiError>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<PaginatedVideos, ApiError> {
  return useQuery({
    queryKey: videosKeys.list(params),
    queryFn: ({ signal }) => api.videos.getAll(params, { signal }),
    ...options,
  });
}

/**
 * Hook: Get a single video by ID
 *
 * @example
 * ```tsx
 * function VideoDetail({ id }: { id: number }) {
 *   const { data, isLoading } = useVideo(id);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   const video = data?.videos[0];
 *   return <div>{video?.title}</div>;
 * }
 * ```
 */
export function useVideo(
  id: number,
  options?: Omit<
    UseQueryOptions<PaginatedVideos, ApiError>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<PaginatedVideos, ApiError> {
  return useQuery({
    queryKey: videosKeys.detail(id),
    queryFn: ({ signal }) => api.videos.getById(id, { signal }),
    ...options,
  });
}

/**
 * Hook: Get videos by creator handler
 *
 * @example
 * ```tsx
 * function CreatorVideos({ handler }: { handler: string }) {
 *   const { data, isLoading } = useVideosByHandler(handler);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {data?.videos.map(video => ...)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useVideosByHandler(
  handler: string,
  options?: Omit<
    UseQueryOptions<PaginatedVideos, ApiError>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<PaginatedVideos, ApiError> {
  return useQuery({
    queryKey: videosKeys.byHandler(handler),
    queryFn: ({ signal }) => api.videos.getByHandler(handler, { signal }),
    ...options,
  });
}

/**
 * Hook: Get videos by creator IDs
 *
 * @example
 * ```tsx
 * function CreatorsVideos({ creatorIds }: { creatorIds: number[] }) {
 *   const { data, isLoading } = useVideosByCreators(creatorIds);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {data?.videos.map(video => ...)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useVideosByCreators(
  creatorIds: number[],
  options?: Omit<
    UseQueryOptions<PaginatedVideos, ApiError>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<PaginatedVideos, ApiError> {
  return useQuery({
    queryKey: videosKeys.byCreators(creatorIds),
    queryFn: ({ signal }) => api.videos.getByCreators(creatorIds, { signal }),
    ...options,
  });
}

/**
 * Hook: Get videos with custom query
 *
 * This is the most flexible hook - use it when you need custom query params
 *
 * @example
 * ```tsx
 * function VideoSearch() {
 *   const [page, setPage] = useState(1);
 *
 *   const { data, isLoading } = useVideosQuery({
 *     page,
 *     per_page: 50,
 *     sort_by: 'latest',
 *   });
 *
 *   return (
 *     <div>
 *       {data?.videos.map(video => ...)}
 *       <button onClick={() => setPage(p => p + 1)}>Next Page</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVideosQuery(
  params: VideoQueryParams,
  options?: Omit<
    UseQueryOptions<PaginatedVideos, ApiError>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<PaginatedVideos, ApiError> {
  return useQuery({
    queryKey: videosKeys.list(params),
    queryFn: ({ signal }) => api.videos.query(params, { signal }),
    ...options,
  });
}
```

---

## Utility Functions

### buildSocialUrl

Constructs social media profile URLs from handles:

```typescript
function buildSocialUrl(
  platform: string,
  handle: string | null | undefined
): string | null {
  if (!handle) return null;
  if (handle.startsWith("http://") || handle.startsWith("https://"))
    return handle;
  const cleanHandle = handle.replace(/^@/, "");
  switch (platform) {
    case "x":
      return `https://x.com/${cleanHandle}`;
    case "tiktok":
      return `https://tiktok.com/@${cleanHandle}`;
    case "instagram":
      return `https://instagram.com/${cleanHandle}`;
    case "facebook":
      return `https://facebook.com/${cleanHandle}`;
    case "youtube":
      return `https://youtube.com/@${cleanHandle}`;
    default:
      return null;
  }
}
```

### shuffleArray

Fisher-Yates shuffle for randomizing arrays:

```typescript
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
```

---

## SVG Icons

### VideoIcon

```tsx
function VideoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
    </svg>
  );
}
```

### ShortsIcon

```tsx
function ShortsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
    </svg>
  );
}
```

### GlobeIcon

```tsx
function GlobeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}
```

### VerifiedIcon

```tsx
function VerifiedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#ab0013">
      <circle cx="12" cy="12" r="10" fill="#ab0013" />
      <path
        d="M9 12l2 2 4-4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

### PlayIcon

```tsx
function PlayIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
```

### LockIcon

```tsx
function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}
```

### Social Icons

```tsx
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
```

---

## File Paths Reference

### Core Page Files

| File | Path |
|------|------|
| Page (server) | `src/app/[handler]/page.tsx` |
| Page Content (client) | `src/app/[handler]/CreatorPageContent.tsx` |

### Section Components

| File | Path |
|------|------|
| CreatorHeader | `src/components/sections/CreatorProfile/CreatorHeader.tsx` |
| CreatorTabs | `src/components/sections/CreatorProfile/CreatorTabs.tsx` |
| CreatorFeaturedVideo | `src/components/sections/CreatorProfile/CreatorFeaturedVideo.tsx` |
| CreatorVideoGrid | `src/components/sections/CreatorProfile/CreatorVideoGrid.tsx` |
| CreatorShortsGrid | `src/components/sections/CreatorProfile/CreatorShortsGrid.tsx` |
| Types | `src/components/sections/CreatorProfile/types.ts` |
| Index | `src/components/sections/CreatorProfile/index.ts` |

### UI Components

| File | Path |
|------|------|
| Button | `src/components/ui/Button/Button.tsx` |
| Heading | `src/components/ui/Heading/Heading.tsx` |
| Text | `src/components/ui/Text/Text.tsx` |
| Image | `src/components/ui/Image/Image.tsx` |
| ContentGlobe | `src/components/ui/ContentGlobe/ContentGlobe.tsx` |

### API Layer

| File | Path |
|------|------|
| Creator Schema | `src/lib/api-v2/schemas/creators.schema.ts` |
| Video Schema | `src/lib/api-v2/schemas/videos.schema.ts` |
| Creator Hooks | `src/lib/api-v2/hooks/use-creators.ts` |
| Video Hooks | `src/lib/api-v2/hooks/use-videos.ts` |

### Utilities

| File | Path |
|------|------|
| cn utility | `src/lib/utils/cn.ts` |
| Types | `src/types/index.ts` |

---

## Quick Start

1. **Install dependencies:**

```bash
npm install next react d3 zod @tanstack/react-query tailwindcss
```

2. **Copy the files** in the order listed in the File Paths Reference

3. **Set up React Query provider** in your app layout

4. **Configure your API client** in `src/lib/api-v2/index.ts`

5. **Access the page** at `/{creator-handler}`

---

## Notes

- All code snippets are complete and self-contained
- Components use Tailwind CSS for styling
- Data fetching uses React Query for caching and state management
- The ContentGlobe requires D3.js for the 3D visualization
- Zod schemas provide runtime type validation for API responses
