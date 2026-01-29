'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  RefreshCw,
  Loader2,
  Wallet,
  Clock,
  CreditCard,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { useEarnings } from '@/api/queries';

const FIRSTPROMOTER_DOMAIN = 'payouts.taboo.tv';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

export default function PayoutsPage() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch earnings data for the payout summary
  const { data: earningsData } = useEarnings('30d', 'day');

  const fetchIframeToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/firstpromoter/iframe-token');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load earnings dashboard');
      }

      // Build iframe URL with the access token
      const url = `https://${FIRSTPROMOTER_DOMAIN}/iframe?tk=${data.access_token}`;
      setIframeUrl(url);
    } catch (err) {
      console.error('Failed to get iframe token:', err);
      setError(err instanceof Error ? err.message : 'Failed to load earnings dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIframeToken();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Payouts</p>
            <h1 className="text-2xl lg:text-3xl font-bold">Earnings Dashboard</h1>
          </div>
          <Button onClick={fetchIframeToken} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Your Money - The only thing that matters */}
        <Card className="bg-[#131315] border-white/6 mb-6">
          <CardContent className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ready for Payout - Main focus */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#ab0013]/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-[#ab0013]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60 font-medium flex items-center gap-1.5">
                      Ready for Payout
                      <span title="The confirmed commission amount that will be paid in your next payout cycle">
                        <Info className="w-3.5 h-3.5 text-white/30 cursor-help" />
                      </span>
                    </p>
                    <p className="text-xs text-white/40">Confirmed amount for your next payout</p>
                  </div>
                </div>
                <p className="text-5xl lg:text-6xl font-bold text-white mb-4">
                  {formatCurrency(earningsData?.balance?.pending || 0)}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-white/40">
                    <Clock className="w-4 h-4" />
                    <span className="flex items-center gap-1">
                      Total unpaid:
                      <span title="All accumulated earnings not yet paid out, including previous months and current month">
                        <Info className="w-3 h-3 text-white/30 cursor-help" />
                      </span>
                      <span className="text-white/60 font-medium">{formatCurrency(earningsData?.balance?.current || 0)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <CreditCard className="w-4 h-4" />
                    <span>Payout via: <span className="text-white/60 font-medium capitalize">{earningsData?.promoter?.payoutMethod || 'Not set'}</span></span>
                  </div>
                </div>
              </div>

              {/* All-time Earnings */}
              <div className="border-t lg:border-t-0 lg:border-l border-white/6 pt-6 lg:pt-0 lg:pl-8">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1">
                  All-time earnings
                  <span title="Total commissions earned since you started, including paid out amounts">
                    <Info className="w-3 h-3 text-white/30 cursor-help" />
                  </span>
                </p>
                <p className="text-3xl font-bold text-[#ab0013] mb-1">
                  {formatCurrency(earningsData?.allTimeStats?.earnings || 0)}
                </p>
                <p className="text-sm text-white/40">total earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <p className="text-white/50 text-sm mb-4">{error}</p>
              <Button onClick={fetchIframeToken} variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
