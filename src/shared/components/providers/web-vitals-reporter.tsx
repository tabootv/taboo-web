'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import posthog from 'posthog-js';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';

const EVENT_MAP: Record<string, string> = {
  LCP: AnalyticsEvent.WEB_VITALS_LCP,
  CLS: AnalyticsEvent.WEB_VITALS_CLS,
  INP: AnalyticsEvent.WEB_VITALS_INP,
  FCP: AnalyticsEvent.WEB_VITALS_FCP,
  TTFB: AnalyticsEvent.WEB_VITALS_TTFB,
};

function report(metric: Metric) {
  const event = EVENT_MAP[metric.name];
  if (!event) return;

  posthog.capture(event, {
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    page_url: window.location.pathname,
  });
}

export function WebVitalsReporter() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    onLCP(report);
    onCLS(report);
    onINP(report);
    onFCP(report);
    onTTFB(report);
  }, []);

  return null;
}
