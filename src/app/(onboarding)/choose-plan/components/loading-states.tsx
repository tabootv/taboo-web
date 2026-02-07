import { MUTED_TEXT_LIGHTER } from '../utils';

export function LoadingPlans() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-10 h-10 mx-auto mb-4 rounded-full border-3 border-elevated border-t-red-primary animate-spin"
          style={{ borderWidth: 3 }}
        />
        <p style={{ color: MUTED_TEXT_LIGHTER, fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
          Loading plans...
        </p>
      </div>
    </div>
  );
}

export function VerifyingSubscription({
  verifyMessage,
  showRetry,
  onRetry,
}: {
  verifyMessage: string;
  showRetry: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        {!showRetry && (
          <div
            className="w-10 h-10 mx-auto mb-4 rounded-full border-3 border-elevated border-t-red-primary animate-spin"
            style={{ borderWidth: 3 }}
          />
        )}
        <p
          style={{
            color: MUTED_TEXT_LIGHTER,
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            lineHeight: 1.5,
          }}
        >
          {verifyMessage}
        </p>
        {showRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-6 py-2 rounded-lg text-sm font-medium text-white bg-red-primary hover:bg-red-hover transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
