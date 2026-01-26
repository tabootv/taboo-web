'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Crown, Star, X, Sparkles } from 'lucide-react';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { subscriptionsClient as subscriptionsApi } from '@/api/client/subscriptions.client';
import type { Plan } from '@/types';
import { useAuthStore } from '@/shared/stores/auth-store';
import { toast } from 'sonner';

const DEFAULT_BENEFITS = [
  'Watch shorts, full episodes, and exclusive Taboo series',
  'Unfiltered stories from creators around the world',
  'One membership gives you access to all creators, anywhere',
  'Show your Infinity badge in every comment',
  'Stream anywhere on mobile, web, and TVs soon',
  'Taboo Education: creator courses included free',
];

export function ChoosePlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, setSubscribed, user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Verify subscription after successful payment
  const verifySubscription = useCallback(async () => {
    try {
      for (let i = 0; i < 5; i++) {
        const status = await subscriptionsApi.getStatus();
        if (status.is_subscribed) {
          setSubscribed(true);
          toast.success('Subscription activated! Welcome to TabooTV.');
          router.push('/home');
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      toast.info('Payment received. Your subscription will be active shortly.');
      router.push('/home');
    } catch (error) {
      console.error('Failed to verify subscription:', error);
      toast.error('Failed to verify subscription status');
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

  // Fetch plans
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const plansData = await subscriptionsApi.getPlans();
        setPlans(plansData);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // API returns name like "monthly usd" or "yearly usd", not interval field
  const monthlyPlan = plans.find(
    (p) => p.name?.toLowerCase().includes('monthly') || p.interval === 'monthly'
  );
  const yearlyPlan = plans.find(
    (p) => p.name?.toLowerCase().includes('yearly') || p.interval === 'yearly'
  );
  const activePlan = selectedPlan === 'monthly' ? monthlyPlan : yearlyPlan;

  // Calculate yearly savings
  const yearlySavings =
    monthlyPlan && yearlyPlan
      ? Math.round(((monthlyPlan.price * 12 - yearlyPlan.price) / (monthlyPlan.price * 12)) * 100)
      : 17;

  const formatPrice = (price: number, currency: string = 'USD') => {
    try {
      const parts = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).formatToParts(price);

      const currencySymbol = parts.find((p) => p.type === 'currency')?.value || '$';
      const numberPart = parts
        .filter((p) => p.type !== 'currency')
        .map((p) => p.value)
        .join('');

      return { symbol: currencySymbol, amount: numberPart };
    } catch {
      return { symbol: '$', amount: price.toFixed(2) };
    }
  };

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
      setCheckoutReturnUrl(`${window.location.origin}/choose-plan?status=success`);
    }
  }, []);

  // Handle checkout completion callback
  const handleCheckoutComplete = useCallback(() => {
    setShowCheckout(false);
    setIsVerifying(true);
    verifySubscription();
  }, [verifySubscription]);

  if (isLoading || isVerifying) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-10 h-10 mx-auto mb-4 rounded-full border-3 border-elevated border-t-red-primary animate-spin"
            style={{ borderWidth: 3 }}
          />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
            {isVerifying ? 'Verifying your subscription...' : 'Loading plans...'}
          </p>
        </div>
      </div>
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

  return (
    <>
      {/* Hero section with radial glow */}
      <div className="relative min-h-[80vh]">
        {/* Background glow - matching design system hero-glow */}
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
            {/* Premium badge */}
            <div
              className="inline-flex items-center gap-2 mb-4"
              style={{
                padding: '6px 12px',
                background: 'rgba(171, 0, 19, 0.15)',
                border: '1px solid rgba(171, 0, 19, 0.3)',
                borderRadius: 16,
              }}
            >
              <Sparkles style={{ width: 14, height: 14, color: '#ab0013' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#ab0013' }}>
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
                color: 'rgba(255,255,255,0.6)',
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
              <div className="flex items-center justify-center gap-2" style={{ marginBottom: 16 }}>
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: selectedPlan === 'monthly' ? '#fff' : 'rgba(255,255,255,0.08)',
                    color: selectedPlan === 'monthly' ? '#000' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className="relative"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: selectedPlan === 'yearly' ? '#fff' : 'rgba(255,255,255,0.08)',
                    color: selectedPlan === 'yearly' ? '#000' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  Yearly
                  <span
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      padding: '2px 6px',
                      background: '#22c55e',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 600,
                      borderRadius: 10,
                    }}
                  >
                    -{yearlySavings}%
                  </span>
                </button>
              </div>

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
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                    /{selectedPlan === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                {selectedPlan === 'yearly' && (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>
                    {monthlyEquivalent.symbol}
                    {monthlyEquivalent.amount}/mo
                  </p>
                )}
              </div>

              {/* Benefits List */}
              <div className="flex flex-col gap-2" style={{ marginBottom: 16 }}>
                {DEFAULT_BENEFITS.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check style={{ width: 16, height: 16, color: '#ab0013', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{benefit}</span>
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
                  background: '#ab0013',
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
                <span>Start free trial</span>
              </button>

              <p
                className="text-center"
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 12 }}
              >
                3 days free, then{' '}
                {selectedPlan === 'monthly'
                  ? `${monthlyPrice.symbol}${monthlyPrice.amount}/mo`
                  : `${yearlyPrice.symbol}${yearlyPrice.amount}/yr`}
                . Cancel anytime.
              </p>

              {!isAuthenticated && (
                <p
                  className="text-center"
                  style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8 }}
                >
                  Have an account?{' '}
                  <Link
                    href="/sign-in"
                    style={{ color: '#ab0013', fontWeight: 500, textDecoration: 'none' }}
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
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 6 }}>
              50,000+ members
            </span>
          </div>

          {/* Footer links */}
          <p
            className="text-center"
            style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}
          >
            By subscribing, you agree to our{' '}
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              Terms
            </Link>{' '}
            &{' '}
            <Link
              href="/privacy"
              style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
            >
              Privacy
            </Link>
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && activePlan?.whop_plan_id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
            onClick={() => setShowCheckout(false)}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-lg overflow-hidden"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>
                  Complete Your Purchase
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Plan
                </p>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <X style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.7)' }} />
              </button>
            </div>

            {/* Whop Checkout Embed */}
            <div className="p-4 min-h-[500px]">
              <WhopCheckoutEmbed
                planId={activePlan.whop_plan_id}
                returnUrl={checkoutReturnUrl}
                theme="dark"
                themeOptions={{ accentColor: 'red' }}
                onComplete={handleCheckoutComplete}
                skipRedirect
                {...(user?.email ? { prefill: { email: user.email } } : {})}
                fallback={
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-elevated border-t-red-primary animate-spin" />
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                        Loading checkout...
                      </p>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
