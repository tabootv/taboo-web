---
name: web-performance-optimization
description: "Optimize Core Web Vitals, bundle size, and navigation speed for TabooTV using React Suspense streaming, TanStack Query caching, and bundle analysis"
triggers:
  - performance
  - slow page
  - Core Web Vitals
  - LCP
  - CLS
  - INP
  - bundle size
  - optimize navigation
  - streaming
  - Suspense
---

# Web Performance Optimization — TabooTV

## When to Use

- Page loads slowly or Web Vitals are degraded
- Adding a new feature that affects rendering performance
- Bundle size regression detected by CI (`scripts/compare-bundle.js`)
- Diagnosing CLS, LCP, or INP issues
- Optimizing login→home or other critical navigation flows

## Workflow

1. **Measure** — `npm run measure:bundle`, Lighthouse, Web Vitals in PostHog
2. **Identify** bottleneck category (rendering, bundle, network, layout shift)
3. **Apply** the relevant pattern below
4. **Verify** — re-run measurements, compare before/after
5. **Monitor** — Web Vitals in PostHog dashboard

---

## Pattern 1: React Suspense Streaming

Stream each section independently so fast sections render first.

**Before:** Monolithic page component with single data fetch blocking all sections.

**After:** Individual `<Suspense>` boundaries per section:

```tsx
// src/app/(platform)/page.tsx
export default function HomePage() {
  return (
    <>
      <Suspense fallback={<BannerSkeleton />}>
        <BannerSection />
      </Suspense>
      <Suspense fallback={<CreatorsSkeleton />}>
        <CreatorsSectionServer />
      </Suspense>
      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedSectionServer />
      </Suspense>
      <Suspense fallback={<ShortsSkeleton />}>
        <ShortsSectionServer />
      </Suspense>
      <Suspense fallback={<RecommendedSkeleton />}>
        <RecommendedSectionServer />
      </Suspense>
      <Suspense fallback={<SeriesSkeleton />}>
        <SeriesSectionServer />
      </Suspense>
      <Suspense fallback={<PlaylistsSkeleton />}>
        <PlaylistsSectionServer />
      </Suspense>
    </>
  );
}
```

Each async server component fetches its own data — no waterfall.

---

## Pattern 2: Server → Client with initialData

Eliminate client-side fetch waterfalls by hydrating with server-fetched data.

**Before:** Client component mounts → fires `useEffect` fetch → loading state.

**After:** Server component fetches → passes `initialData` to client hook:

```tsx
// Server component: banner-section.tsx
export async function BannerSection() {
  const banners = await homeClient.getBanners(serverToken);
  return <BannerSlider initialBanners={banners} />;
}

// Client component: banner-slider.tsx
const { data: banners } = useBanners({ initialData: initialBanners });
```

**Rule:** Keep `staleTime` >= server cache time to avoid refetch on hydration.

---

## Pattern 3: Route Prefetching

Prefetch the destination route before the user triggers navigation:

```tsx
// src/app/(auth)/sign-in/page.tsx
useEffect(() => {
  router.prefetch('/');
}, [router]);
```

This loads the RSC payload + JS chunks in parallel with the login flow, so navigation after login is near-instant.

---

## Pattern 4: Deferred Post-Navigation Work

Navigate immediately, then fire-and-forget non-critical work:

```tsx
const navigateAndDeferPostLogin = (method: 'email' | 'google' | 'apple') => {
  const { user, isSubscribed } = useAuthStore.getState();
  const onboardingPath = getOnboardingRedirectPath(user, isSubscribed);
  router.push(onboardingPath || '/');

  // Fire-and-forget: toast, analytics, redeem code
  toast.success('Welcome back!');
  posthog.capture(AnalyticsEvent.AUTH_LOGIN_COMPLETED, { method });
  applyPendingRedeemCode(searchParams).then((redeemResult) => {
    if (redeemResult.applied && redeemResult.success) {
      useAuthStore.getState().setSubscribed(true);
      toast.success(redeemResult.message || 'Subscription activated!');
    }
  });
};
```

This removes ~500ms of blocking work from the critical navigation path.

---

## Pattern 5: loading.tsx Skeleton Screens

Every route needs a `loading.tsx` that shows skeletons matching the final layout:

```tsx
// src/app/(platform)/loading.tsx
export default function HomeLoading() {
  return (
    <>
      <BannerSkeleton />
      <div className="w-full page-px flex flex-col gap-5 sm:gap-6 md:gap-8 lg:gap-10 mt-4 sm:mt-8 md:mt-12 relative z-10">
        <CreatorsSkeleton />
        <FeaturedSkeleton />
        <ShortsSkeleton />
      </div>
    </>
  );
}
```

Import shared skeletons from `_sections/skeletons` — don't create ad-hoc loading states.

---

## Pattern 6: Bundle Optimization

### Remove unused dependencies
Remove packages not in use (e.g., dayjs when date-fns is already available).

### Expand `optimizePackageImports`
In `next.config.ts`, add barrel-exporting libraries to optimize tree-shaking:

```ts
optimizePackageImports: ['lucide-react', 'recharts', 'date-fns']
```

### Lazy-load heavy SDKs
```tsx
// Lazy Firebase init — only loaded when needed
const { getApp } = await import('firebase/app');
```

### CI comparison
`scripts/compare-bundle.js` compares current build against baseline and enforces budgets (10 MB total, 5 MB static chunks). Runs automatically in PR CI.

---

## Pattern 7: CLS Prevention

- **Always set dimensions** on images and containers (`width`, `height`, or `aspect-ratio`)
- **Use `flex-1`** for footer positioning to avoid page jumps
- **Show skeletons matching final layout** — same height, same gap structure
- Use `min-h-screen` on page wrappers to prevent footer CLS

---

## Pattern 8: Web Vitals Monitoring

### WebVitalsReporter → PostHog

```tsx
// src/shared/components/providers/web-vitals-reporter.tsx
export function WebVitalsReporter() {
  useEffect(() => {
    onLCP(report);
    onCLS(report);
    onINP(report);
    onFCP(report);
    onTTFB(report);
  }, []);
  return null;
}
```

Each metric is captured as a PostHog event with value, rating, delta, and page URL.

### Custom performance marks
For critical flows (e.g., login→home), use `performance.mark()` and `performance.measure()` to track custom timings.

---

## Contextual Awareness & Interoperability

| Skill | Synergy |
|-------|---------|
| **vercel-react-best-practices** | Use for React/Next.js specific patterns (Server Components, caching) |
| **sonar-scan** | Use for cognitive complexity checks after refactoring for perf |
| **bundling-optimization** | Use for deep bundle analysis and code splitting strategies |
| **find-skills** | Search for additional perf skills as needed |

---

## Verification Checklist

- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] Bundle size within budget (`compare-bundle.js` passes)
- [ ] All modified routes have `loading.tsx`
- [ ] No client-side waterfalls (check Network tab)
- [ ] Web Vitals reporting active
- [ ] Tested on Fast 3G throttling
