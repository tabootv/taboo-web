# Performance Optimization

> **When to use:** Diagnosing slow loads, optimizing Core Web Vitals, reducing bundle size, improving navigation transitions.

---

## Quick Reference

```bash
npm run measure:bundle    # Analyze bundle size
npm run measure:build     # Full build + metrics
npm run measure:baseline  # Save current metrics as baseline
```

**Web Vitals Targets:**

| Metric | Target | Meaning |
|--------|--------|---------|
| **LCP** | < 2.5s | Largest Contentful Paint |
| **CLS** | < 0.1 | Cumulative Layout Shift |
| **INP** | < 200ms | Interaction to Next Paint |

---

## Streaming & Suspense

Each section of the home page streams independently via individual `<Suspense>` boundaries:

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
      {/* Each section fetches independently — fast sections render first */}
    </>
  );
}
```

**Pattern:** Async server components that fetch independently, each wrapped in its own `<Suspense>` boundary with a matching skeleton fallback.

---

## Navigation Optimization

### Route Prefetching

Prefetch the home route on sign-in page mount so RSC payload + JS chunks are ready:

```tsx
// src/app/(auth)/sign-in/page.tsx
useEffect(() => {
  router.prefetch('/');
}, [router]);
```

### Deferred Post-Navigation Work

Navigate immediately, then fire-and-forget analytics/toast/redeem:

```tsx
const navigateAndDeferPostLogin = (method: 'email' | 'google' | 'apple') => {
  const { user, isSubscribed } = useAuthStore.getState();
  const onboardingPath = getOnboardingRedirectPath(user, isSubscribed);
  router.push(onboardingPath || '/');

  // Fire-and-forget: toast, analytics, redeem code
  toast.success('Welcome back!');
  posthog.capture(AnalyticsEvent.AUTH_LOGIN_COMPLETED, { method });
  applyPendingRedeemCode(searchParams).then(/* ... */);
};
```

This removes ~500ms of blocking work from the critical path.

---

## Loading States

Every route **MUST** have a `loading.tsx` skeleton screen for instant feedback:

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

**Rule:** Skeletons must match the final layout dimensions to prevent CLS.

---

## Bundle Optimization

- **Remove unused deps** (e.g., dayjs, unused font weights)
- **`optimizePackageImports`** in `next.config.ts` for tree-shaking barrel imports (`lucide-react`, `recharts`, `date-fns`)
- **CI bundle comparison** via `scripts/compare-bundle.js` — compares against baseline and enforces budgets

---

## TanStack Query Hydration

Server component fetches data and passes it as `initialData` to the client hook:

```tsx
// Server component (banner-section.tsx)
export async function BannerSection() {
  const banners = await homeClient.getBanners(serverToken);
  return <BannerSlider initialBanners={banners} />;
}

// Client component (banner-slider.tsx) — uses initialData
const { data: banners } = useBanners({ initialData: initialBanners });
```

**Rule:** Keep `staleTime` >= server cache time to avoid unnecessary refetches on hydration.

---

## Measurement & Monitoring

### WebVitalsReporter

Reports all Core Web Vitals to PostHog automatically:

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

### Bundle CI Tracking

`scripts/compare-bundle.js` runs in CI to compare bundle sizes against baseline and enforce budgets (10 MB total build, 5 MB static chunks).

---

## Checklist for New Features

- [ ] `loading.tsx` exists for the route
- [ ] Suspense boundaries for expensive sections
- [ ] `initialData` for client hydration where applicable
- [ ] Prefetch critical navigation routes
- [ ] Test on throttled connections (Fast 3G)
- [ ] CLS < 0.1 (set dimensions on images/containers)

---

## Reference

- **Related skill:** `web-performance-optimization` (`.agents/skills/web-performance-optimization/SKILL.md`)
- **Related docs:** `api-design.md`, `styling.md`
- **Web Vitals dashboard:** PostHog → Web Vitals events
- **Bundle metrics:** `metrics/` directory
