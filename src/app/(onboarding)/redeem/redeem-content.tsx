'use client';

import { subscriptionsClient as subscriptionsApi } from '@/api/client/subscriptions.client';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { Plan } from '@/types';
import { ArrowRight, Check, Gift, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { saveRedeemCode } from '@/shared/lib/redeem/apply-pending-code';
import { RedeemBackground } from './components/redeem-background';

const MAX_POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

const BRAND_COLOR = '#ab0013';
const MUTED_TEXT_COLOR = 'rgba(255,255,255,0.5)';
const MUTED_TEXT_LIGHT = 'rgba(255,255,255,0.6)';
const MUTED_TEXT_LIGHTER = 'rgba(255,255,255,0.7)';

export function RedeemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, setSubscribed } = useAuthStore();

  const [redeemCode, setRedeemCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatedPlan, setValidatedPlan] = useState<Plan | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('Activating your subscription...');
  const [showRetry, setShowRetry] = useState(false);

  const hasAutoValidated = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Read ?code= query param for pre-filling
  const codeFromUrl = searchParams.get('code');

  // Pre-fill from URL param
  useEffect(() => {
    if (codeFromUrl && !redeemCode) {
      setRedeemCode(codeFromUrl.toUpperCase());
    }
  }, [codeFromUrl, redeemCode]);

  // Auto-validate when code is pre-filled from URL and user is authenticated
  useEffect(() => {
    if (
      codeFromUrl &&
      isAuthenticated &&
      !hasAutoValidated.current &&
      !validatedPlan &&
      !isLoading
    ) {
      hasAutoValidated.current = true;
      handleValidate(codeFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromUrl, isAuthenticated]);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current && !codeFromUrl) {
      inputRef.current.focus();
    }
  }, [codeFromUrl]);

  // Verify subscription polling
  const verifySubscription = useCallback(async () => {
    setShowRetry(false);
    setVerifyMessage('Activating your subscription...');
    try {
      for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
        const status = await subscriptionsApi.getStatus();
        if (status.is_subscribed) {
          setSubscribed(true);
          toast.success('Subscription activated! Welcome to TabooTV.');
          router.push('/');
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
      setVerifyMessage(
        'Your subscription is being activated. This usually takes less than a minute.'
      );
      setShowRetry(true);
    } catch (err) {
      console.error('Failed to verify subscription:', err);
      toast.error('Failed to verify subscription status');
      setShowRetry(true);
    } finally {
      setIsVerifying(false);
    }
  }, [router, setSubscribed]);

  const handleValidate = async (codeOverride?: string) => {
    const code = (codeOverride || redeemCode).trim();
    if (!code) return;

    // If unauthenticated, save code and redirect to sign-in
    if (!isAuthenticated) {
      saveRedeemCode(code);
      router.push(`/sign-in?redeem_code=${encodeURIComponent(code)}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setValidatedPlan(null);
    try {
      const result = await subscriptionsApi.validateRedeemCode(code);
      if (result.valid && result.plan) {
        setValidatedPlan(result.plan);
      } else {
        setError(result.message || 'Invalid redeem code. Please check and try again.');
      }
    } catch {
      setError('Failed to validate code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    const code = redeemCode.trim();
    if (!code) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await subscriptionsApi.applyRedeemCode(code);
      if (result.subscribed) {
        setSubscribed(true);
        toast.success('Redeem code applied! Your subscription is now active.');
        router.push('/');
      } else {
        setIsVerifying(true);
        verifySubscription();
      }
    } catch {
      setError('Failed to apply code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (validatedPlan) {
        handleApply();
      } else {
        handleValidate();
      }
    }
  };

  // Verifying state — full screen spinner
  if (isVerifying || showRetry) {
    return (
      <>
        <RedeemBackground />
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
                onClick={() => {
                  setIsVerifying(true);
                  setShowRetry(false);
                  verifySubscription();
                }}
                className="mt-4 px-6 py-2 rounded-lg text-sm font-medium text-white bg-red-primary hover:bg-red-hover transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RedeemBackground />

      <div className="relative min-h-[80vh]">
        <div className="relative z-10 account-container py-8">
          {/* Badge pill */}
          <div
            className="inline-flex items-center gap-2 mb-5"
            style={{
              padding: '6px 14px',
              background: 'rgba(171, 0, 19, 0.15)',
              border: '1px solid rgba(171, 0, 19, 0.3)',
              borderRadius: 20,
            }}
          >
            <Gift style={{ width: 14, height: 14, color: BRAND_COLOR }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: BRAND_COLOR }}>Prepaid Code</span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(28px, 6vw, 44px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: '#fff',
              marginBottom: 12,
            }}
          >
            Redeem your code
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              color: MUTED_TEXT_LIGHTER,
              lineHeight: 1.5,
              marginBottom: 32,
            }}
          >
            Enter your prepaid code below to activate your TabooTV subscription.
          </p>

          {/* Input + CTA */}
          <div className="flex flex-col sm:flex-row gap-3 w-1/2 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={redeemCode}
              onChange={(e) => {
                setRedeemCode(e.target.value.toUpperCase());
                setError(null);
                setValidatedPlan(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter your code"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 px-4 py-3.5 rounded-lg text-[15px] text-white placeholder:text-text-secondary outline-none transition-all focus:[border-color:var(--red-primary)]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                letterSpacing: '0.05em',
                fontFamily: 'monospace, monospace',
              }}
            />
            {!validatedPlan ? (
              <button
                onClick={() => handleValidate()}
                disabled={isLoading || !redeemCode.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all sm:min-w-[140px]"
                style={{
                  background: redeemCode.trim() ? BRAND_COLOR : 'rgba(255,255,255,0.1)',
                  cursor: redeemCode.trim() && !isLoading ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={(e) => {
                  if (redeemCode.trim() && !isLoading) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(171, 0, 19, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Redeem</span>
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleApply}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all sm:min-w-[140px]"
                style={{
                  background: '#22c55e',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check style={{ width: 16, height: 16 }} />
                    <span>Activate</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Error message */}
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          {/* Validated plan info */}
          {validatedPlan && (
            <div
              className="flex items-center gap-3 rounded-lg"
              style={{
                padding: '12px 16px',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                marginBottom: 12,
              }}
            >
              <Check style={{ width: 18, height: 18, color: '#22c55e', flexShrink: 0 }} />
              <p style={{ color: '#22c55e', fontSize: 13, lineHeight: 1.4 }}>
                Valid code for <strong>{validatedPlan.name}</strong>. Click Activate to start your
                subscription.
              </p>
            </div>
          )}

          {/* Auth prompt for unauthenticated users */}
          {!isAuthenticated && (
            <p style={{ color: MUTED_TEXT_LIGHT, fontSize: 13, marginBottom: 24 }}>
              You&apos;ll need to{' '}
              <Link
                href={`/sign-in${redeemCode ? `?redeem_code=${encodeURIComponent(redeemCode)}` : ''}`}
                style={{ color: BRAND_COLOR, fontWeight: 500, textDecoration: 'none' }}
              >
                sign in
              </Link>{' '}
              to redeem your code.
            </p>
          )}

          {/* Secondary link */}
          <div style={{ marginTop: 24 }}>
            <Link
              href="/choose-plan"
              className="inline-flex items-center gap-1 text-sm"
              style={{
                color: MUTED_TEXT_COLOR,
                textDecoration: 'none',
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = MUTED_TEXT_COLOR;
              }}
            >
              View subscription plans
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
