'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';

const FIRSTPROMOTER_DOMAIN = 'payouts.taboo.tv';

export default function EarningsPage() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
