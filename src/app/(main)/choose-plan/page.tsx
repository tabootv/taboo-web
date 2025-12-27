import { Suspense } from 'react';
import { ChoosePlanContent } from './choose-plan-content';

// Force dynamic rendering to avoid SSR issues with useSearchParams
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
          Loading plans...
        </p>
      </div>
    </div>
  );
}

export default function ChoosePlanPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ChoosePlanContent />
    </Suspense>
  );
}
