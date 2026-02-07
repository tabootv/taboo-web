'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Crown, Star, Sparkles } from 'lucide-react';
import { subscriptionsClient as subscriptionsApi } from '@/api/client/subscriptions.client';
import type { Plan } from '@/types';
import { useAuthStore } from '@/shared/stores/auth-store';
import { RedeemCodeCard } from '@/components/redeem/redeem-code-card';
import { toast } from 'sonner';

import { CheckoutModal } from './components/checkout-modal';
import { LoadingPlans, VerifyingSubscription } from './components/loading-states';
import { PlanToggle } from './components/plan-toggle';
import {
  DEFAULT_BENEFITS,
  MAX_POLL_ATTEMPTS,
  POLL_INTERVAL_MS,
  MUTED_TEXT_COLOR,
  MUTED_TEXT_LIGHT,
  MUTED_TEXT_LIGHTER,
  BRAND_COLOR,
  findMonthlyPlan,
  findYearlyPlan,
  calcYearlySavings,
  formatPrice,
} from './utils';

export function ChoosePlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, setSubscribed, user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('Activating your subscription...');
  const [showRetry, setShowRetry] = useState(false);

  // Affiliate ref from URL
  const ref = searchParams.get('ref') || undefined;

  // Verify subscription after successful payment
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
      // Timeout - show friendly message with retry
      setVerifyMessage(
        'Payment received! Your subscription is being activated. This usually takes less than a minute.'
      );
      setShowRetry(true);
    } catch (error) {
      console.error('Failed to verify subscription:', error);
      toast.error('Failed to verify subscription status');
      setShowRetry(true);
    } finally {
      setIsVerifying(false);
    }
  }, [router, setSubscribed]);

  // Handle return from checkout
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setIsVerifying(true);
      verifySubscription();
    } else if (status === 'error') {
      toast.error('Payment failed or was canceled. Please try again.');
    }
  }, [searchParams, verifySubscription]);

  // Fetch plans with optional affiliate ref
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const plansData = await subscriptionsApi.getPlans({ ref });
        setPlans(plansData);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [ref]);

  const monthlyPlan = findMonthlyPlan(plans);
  const yearlyPlan = findYearlyPlan(plans);
  const activePlan = selectedPlan === 'monthly' ? monthlyPlan : yearlyPlan;
  const yearlySavings = calcYearlySavings(monthlyPlan, yearlyPlan);

  // Dynamic trial days
  const trialDays = activePlan?.trial_days;

  const handleCheckout = useCallback(() => {
    if (!activePlan) return;

    if (!isAuthenticated) {
      router.push(`/register?redirect=/choose-plan`);
      return;
    }

    // If plan has Whop plan ID, show embedded checkout
    if (activePlan.whop_plan_id) {
      setShowCheckout(true);
      return;
    }

    // Fallback to redirect if no whop_plan_id but has URL
    if (activePlan.whop_plan_url) {
      const returnUrl = encodeURIComponent(`${window.location.origin}/choose-plan?status=success`);
      const checkoutUrl = activePlan.whop_plan_url.includes('?')
        ? `${activePlan.whop_plan_url}&redirect_url=${returnUrl}`
        : `${activePlan.whop_plan_url}?redirect_url=${returnUrl}`;
      window.location.href = checkoutUrl;
      return;
    }

    toast.error('Checkout not available for this plan');
  }, [activePlan, isAuthenticated, router]);

  // Return URL for Whop checkout - use state to avoid SSR mismatch
  const [checkoutReturnUrl, setCheckoutReturnUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      setCheckoutReturnUrl(`${appUrl}/choose-plan?status=success`);
    }
  }, []);

  // Handle checkout completion callback
  const handleCheckoutComplete = useCallback(() => {
    setShowCheckout(false);
    setIsVerifying(true);
    verifySubscription();
  }, [verifySubscription]);

  const handleRedeemSubscribed = useCallback(() => {
    setSubscribed(true);
    toast.success('Redeem code applied! Your subscription is now active.');
    router.push('/');
  }, [setSubscribed, router]);

  const handleRedeemStartVerifying = useCallback(() => {
    setIsVerifying(true);
    verifySubscription();
  }, [verifySubscription]);

  if (isLoading) {
    return <LoadingPlans />;
  }

  if (isVerifying || showRetry) {
    return (
      <VerifyingSubscription
        verifyMessage={verifyMessage}
        showRetry={showRetry}
        onRetry={() => {
          setIsVerifying(true);
          setShowRetry(false);
          verifySubscription();
        }}
      />
    );
  }

  const monthlyPrice = monthlyPlan
    ? formatPrice(monthlyPlan.price, monthlyPlan.currency)
    : { symbol: '$', amount: '8.88' };
  const yearlyPrice = yearlyPlan
    ? formatPrice(yearlyPlan.price, yearlyPlan.currency)
    : { symbol: '$', amount: '88.80' };
  const monthlyEquivalent = yearlyPlan
    ? formatPrice(yearlyPlan.price / 12, yearlyPlan.currency)
    : { symbol: '$', amount: '7.40' };

  const benefits = activePlan?.features?.length ? activePlan.features : DEFAULT_BENEFITS;

  // CTA text based on trial days
  const ctaText =
    trialDays && trialDays > 0 ? `Start ${trialDays}-day free trial` : 'Start free trial';

  // Trial description
  const trialDescription = trialDays && trialDays > 0 ? `${trialDays} days free, then ` : '';

  return (
    <>
      {/* Hero section with radial glow */}
      <div className="relative min-h-[80vh]">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center top, rgba(171, 0, 19, 0.15) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 mx-auto"
          style={{
            maxWidth: 480,
            padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)',
          }}
        >
          {/* Title Section */}
          <div className="text-center" style={{ marginBottom: 20 }}>
            <div
              className="inline-flex items-center gap-2 mb-4"
              style={{
                padding: '6px 12px',
                background: 'rgba(171, 0, 19, 0.15)',
                border: '1px solid rgba(171, 0, 19, 0.3)',
                borderRadius: 16,
              }}
            >
              <Sparkles style={{ width: 14, height: 14, color: BRAND_COLOR }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: BRAND_COLOR }}>
                Premium Access
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(24px, 6vw, 36px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                color: '#fff',
                marginBottom: 8,
              }}
            >
              Activate your access
            </h1>
            <p
              style={{
                fontSize: 14,
                color: MUTED_TEXT_LIGHT,
                lineHeight: 1.5,
              }}
            >
              Start watching exclusive content instantly.
            </p>
          </div>

          {/* Glass Card */}
          <div
            style={{
              position: 'relative',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative', padding: 20 }}>
              {/* Plan Toggle */}
              <PlanToggle
                selectedPlan={selectedPlan}
                onSelect={setSelectedPlan}
                yearlySavings={yearlySavings}
              />

              {/* Price Display */}
              <div className="text-center" style={{ marginBottom: 16 }}>
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    style={{
                      fontSize: 'clamp(36px, 8vw, 48px)',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#fff',
                    }}
                  >
                    {selectedPlan === 'monthly' ? monthlyPrice.symbol : yearlyPrice.symbol}
                    {selectedPlan === 'monthly' ? monthlyPrice.amount : yearlyPrice.amount}
                  </span>
                  <span style={{ fontSize: 14, color: MUTED_TEXT_COLOR }}>
                    /{selectedPlan === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                {selectedPlan === 'yearly' && (
                  <p style={{ color: MUTED_TEXT_COLOR, fontSize: 13, marginTop: 4 }}>
                    {monthlyEquivalent.symbol}
                    {monthlyEquivalent.amount}/mo
                  </p>
                )}
              </div>

              {/* Benefits List */}
              <div className="flex flex-col gap-2" style={{ marginBottom: 16 }}>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check style={{ width: 16, height: 16, color: BRAND_COLOR, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: MUTED_TEXT_LIGHTER }}>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleCheckout}
                disabled={!activePlan}
                className="w-full flex items-center justify-center gap-2"
                style={{
                  padding: '12px 24px',
                  background: BRAND_COLOR,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: 'none',
                  cursor: activePlan ? 'pointer' : 'not-allowed',
                  opacity: activePlan ? 1 : 0.5,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (activePlan) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(171, 0, 19, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Crown style={{ width: 18, height: 18 }} />
                <span>{ctaText}</span>
              </button>

              <p
                className="text-center"
                style={{ color: MUTED_TEXT_COLOR, fontSize: 12, marginTop: 12 }}
              >
                {trialDescription}
                {selectedPlan === 'monthly'
                  ? `${monthlyPrice.symbol}${monthlyPrice.amount}/mo`
                  : `${yearlyPrice.symbol}${yearlyPrice.amount}/yr`}
                . Cancel anytime.
              </p>

              {/* Redeem Code Section */}
              <RedeemCodeCard
                variant="inline"
                onSubscribed={handleRedeemSubscribed}
                onStartVerifying={handleRedeemStartVerifying}
              />

              {!isAuthenticated && (
                <p
                  className="text-center"
                  style={{ color: MUTED_TEXT_COLOR, fontSize: 12, marginTop: 8 }}
                >
                  Have an account?{' '}
                  <Link
                    href="/sign-in"
                    style={{ color: BRAND_COLOR, fontWeight: 500, textDecoration: 'none' }}
                  >
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-1 mt-5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} style={{ width: 14, height: 14, color: '#facc15', fill: '#facc15' }} />
            ))}
            <span style={{ fontSize: 12, color: MUTED_TEXT_COLOR, marginLeft: 6 }}>
              50,000+ members
            </span>
          </div>

          {/* Footer links */}
          <p
            className="text-center"
            style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}
          >
            By subscribing, you agree to our{' '}
            <Link href="/terms" style={{ color: MUTED_TEXT_LIGHT, textDecoration: 'none' }}>
              Terms
            </Link>{' '}
            &{' '}
            <Link href="/privacy" style={{ color: MUTED_TEXT_LIGHT, textDecoration: 'none' }}>
              Privacy
            </Link>
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && activePlan?.whop_plan_id && (
        <CheckoutModal
          planId={activePlan.whop_plan_id}
          planLabel={selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}
          returnUrl={checkoutReturnUrl}
          affiliateCode={ref}
          email={user?.email}
          disableEmail={!!isAuthenticated && !!user?.email}
          onClose={() => setShowCheckout(false)}
          onComplete={handleCheckoutComplete}
        />
      )}
    </>
  );
}
