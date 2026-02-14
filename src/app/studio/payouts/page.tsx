'use client';

import { useEarnings } from '@/api/queries/earnings.queries';
import { useFirstPromoterIframeToken } from '@/api/queries/firstpromoter.queries';
import { Button } from '@/components/ui/button';
import { useFeature } from '@/hooks/use-feature';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EarningsCard } from '../_components/EarningsCard';

export default function PayoutsPage() {
  const studioPayoutsEnabled = useFeature('STUDIO_PAYOUTS');
  const router = useRouter();

  useEffect(() => {
    if (!studioPayoutsEnabled) router.replace('/studio');
  }, [studioPayoutsEnabled, router]);

  const { data: iframeUrl, isLoading, error, refetch } = useFirstPromoterIframeToken();

  const { data: earningsData } = useEarnings('30d', 'day');

  if (!studioPayoutsEnabled) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Payouts</p>
            <h1 className="text-2xl lg:text-3xl font-bold">Earnings Dashboard</h1>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="mb-6">
          <EarningsCard data={earningsData} showPeriodEarnings={false} showAllTimeEarnings />
        </div>

        {isLoading && (
          <div className="h-[70vh] flex items-center justify-center border border-white/10 rounded-xl bg-white/5">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-white/60 animate-spin mx-auto mb-3" />
              <p className="text-white/60">Loading earnings dashboard...</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="h-[70vh] flex items-center justify-center border border-white/10 rounded-xl bg-white/5">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-white/80 mb-2">Unable to load earnings dashboard</p>
              <p className="text-white/50 text-sm mb-4">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && iframeUrl && (
          <div className="border border-white/10 rounded-xl overflow-hidden bg-black">
            <iframe
              src={iframeUrl}
              className="w-full min-h-[80vh] lg:min-h-[82vh] border-0"
              title="Earnings Dashboard"
              allow="clipboard-write"
            />
          </div>
        )}
      </div>
    </div>
  );
}
