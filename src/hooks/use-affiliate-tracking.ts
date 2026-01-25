/**
 * Hook for affiliate tracking data
 */

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { AffiliateTrackingData } from '@/shared/utils/affiliate-tracking';

export function useAffiliateTracking(): AffiliateTrackingData {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const result: AffiliateTrackingData = {};

    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');
    const ref = searchParams.get('ref');

    if (utm_source) result.utm_source = utm_source;
    if (utm_medium) result.utm_medium = utm_medium;
    if (utm_campaign) result.utm_campaign = utm_campaign;
    if (ref) result.ref = ref;

    return result;
  }, [searchParams]);
}
