'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

let posthogInitialized = false;
function ensurePostHogInit() {
  if (posthogInitialized || typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY)
    return;
  posthogInitialized = true;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/phtv',
    ui_host: 'https://us.i.posthog.com',
    defaults: '2026-01-30',
    person_profiles: 'identified_only',
    capture_pageview: false,
    disable_session_recording: true,
    disable_surveys: true,
    capture_dead_clicks: false,
    capture_performance: false,
  });
}

// Non-UTM campaign params to capture. Add new ones here as needed.
const CAMPAIGN_PARAMS = ['ref', 'gclid', 'fbclid', 'ttclid', 'gad_source'];

function PostHogPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasCapturedCampaign = useRef(false);

  useEffect(() => {
    if (!pathname) return;
    ensurePostHogInit();

    let url = window.origin + pathname;
    const search = searchParams.toString();
    if (search) url += `?${search}`;

    posthog.capture('$pageview', { $current_url: url });

    // On first load only: register campaign params as super properties
    if (!hasCapturedCampaign.current) {
      hasCapturedCampaign.current = true;
      const campaignProps: Record<string, string> = {};

      // Dynamically capture ALL utm_* params (no hardcoded list)
      searchParams.forEach((value, key) => {
        if (key.startsWith('utm_')) {
          campaignProps[key] = value;
        }
      });

      // Capture additional known campaign params
      for (const key of CAMPAIGN_PARAMS) {
        const value = searchParams.get(key);
        if (value) campaignProps[key] = value;
      }

      if (Object.keys(campaignProps).length > 0) {
        posthog.register(campaignProps);
      }
    }
  }, [pathname, searchParams]);

  return null;
}

function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  );
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
