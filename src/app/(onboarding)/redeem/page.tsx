import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RedeemContent } from './redeem-content';

export const metadata: Metadata = {
  title: 'Redeem Code | TabooTV',
  description: 'Redeem your prepaid code to activate your TabooTV subscription.',
  openGraph: {
    title: 'Redeem Code | TabooTV',
    description: 'Redeem your prepaid code to activate your TabooTV subscription.',
  },
};

export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-10 h-10 mx-auto mb-4 rounded-full border-3 border-elevated border-t-red-primary animate-spin"
          style={{ borderWidth: 3 }}
        />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RedeemContent />
    </Suspense>
  );
}
