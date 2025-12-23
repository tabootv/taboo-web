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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading earnings dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-white/70 mb-2">Unable to load earnings dashboard</p>
          <p className="text-white/40 text-sm mb-4">{error}</p>
          <Button onClick={fetchIframeToken} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white">
      {iframeUrl && (
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0"
          title="Earnings Dashboard"
          allow="clipboard-write"
        />
      )}
    </div>
  );
}
