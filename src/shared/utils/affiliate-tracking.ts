/**
 * Affiliate tracking utilities
 */

export interface AffiliateTrackingData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  ref?: string;
}

export function buildCheckoutUrl(baseUrl: string, trackingData?: AffiliateTrackingData): string {
  if (!trackingData) return baseUrl;
  const url = new URL(baseUrl);
  if (trackingData.utm_source) url.searchParams.set('utm_source', trackingData.utm_source);
  if (trackingData.utm_medium) url.searchParams.set('utm_medium', trackingData.utm_medium);
  if (trackingData.utm_campaign) url.searchParams.set('utm_campaign', trackingData.utm_campaign);
  if (trackingData.ref) url.searchParams.set('ref', trackingData.ref);
  return url.toString();
}
