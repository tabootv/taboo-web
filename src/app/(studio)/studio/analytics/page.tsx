'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import analytics content to code-split Recharts (~200KB)
const AnalyticsContent = dynamic(
  () => import('./analytics-content').then((mod) => ({ default: mod.AnalyticsContent })),
  {
    loading: () => (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    ),
    ssr: false, // Recharts requires client-side rendering
  }
);

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
