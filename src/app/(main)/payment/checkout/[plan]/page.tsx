'use client';;
import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Check, Loader2, CreditCard } from 'lucide-react';
import { subscriptionsClient as subscriptions } from '@/api/client/subscriptions.client';
import type { Plan } from '@/types';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/spinner';
import { toast } from 'sonner';

/**
 * Checkout page that redirects to or embeds Whop checkout
 *
 * Flow:
 * 1. Fetch plan details including whop_plan_url
 * 2. User confirms and clicks checkout
 * 3. Redirect to Whop (or show embedded checkout)
 * 4. After payment, Whop webhook updates backend
 * 5. User returns and we verify subscription status
 */
export default function CheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan: planId } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, setSubscribed } = useAuthStore();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutMode, _setCheckoutMode] = useState<'redirect' | 'embed'>('redirect');
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if user just returned from Whop checkout
  const [returnedFromCheckout, setReturnedFromCheckout] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=/payment/checkout/${planId}`);
      return;
    }

    // Check if returning from checkout (Whop adds success params)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' || urlParams.get('checkout') === 'complete') {
      setReturnedFromCheckout(true);
      verifySubscription();
    }

    async function fetchPlan() {
      try {
        setIsLoading(true);
        const plans = await subscriptions.getPlans();
        const selectedPlan = plans.find((p) => p.id.toString() === planId || p.slug === planId);
        if (selectedPlan) {
          setPlan(selectedPlan);
        } else {
          toast.error('Plan not found');
          router.push('/choose-plan');
        }
      } catch (error) {
        console.error('Failed to fetch plan:', error);
        toast.error('Failed to load plan details');
        router.push('/choose-plan');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlan();
  }, [planId, isAuthenticated, router]);

  /**
   * Verify subscription status after returning from Whop
   * Backend is updated via webhook, we just need to refresh state
   */
  const verifySubscription = useCallback(async () => {
    setIsVerifying(true);
    try {
      // Poll a few times to allow webhook to process
      for (let i = 0; i < 5; i++) {
        const status = await subscriptions.getStatus();
        if (status.is_subscribed) {
          setSubscribed(true);
          toast.success('Subscription activated! Welcome to TabooTV.');
          router.push('/');
          return;
        }
        // Wait 2 seconds between polls
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      // If still not subscribed after polling, show message
      toast.info('Payment received. Your subscription will be active shortly.');
      router.push('/');
    } catch (error) {
      console.error('Failed to verify subscription:', error);
      toast.error('Failed to verify subscription status');
    } finally {
      setIsVerifying(false);
    }
  }, [router, setSubscribed]);

  /**
   * Start checkout - redirect to Whop
   */
  const handleCheckout = async () => {
    if (!plan) return;

    // Check if plan has Whop checkout URL
    if (!plan.whop_plan_url) {
      toast.error('Checkout not available for this plan');
      return;
    }

    // For redirect mode, just navigate to Whop
    if (checkoutMode === 'redirect') {
      // Add return URL so user comes back after payment
      const returnUrl = encodeURIComponent(
        `${window.location.origin}/payment/checkout/${planId}?success=true`
      );
      const checkoutUrl = plan.whop_plan_url.includes('?')
        ? `${plan.whop_plan_url}&redirect_url=${returnUrl}`
        : `${plan.whop_plan_url}?redirect_url=${returnUrl}`;

      window.location.href = checkoutUrl;
      return;
    }
  };

  // Show verification screen if returning from checkout
  if (returnedFromCheckout || isVerifying) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Loader2 className="w-12 h-12 text-red-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Verifying your subscription...</h2>
        <p className="text-text-secondary text-center max-w-md">
          Please wait while we confirm your payment. This may take a few moments.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen message="Loading checkout..." />;
  }

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">Plan not found</p>
        <Link href="/choose-plan" className="text-red-primary hover:underline mt-4 inline-block">
          View available plans
        </Link>
      </div>
    );
  }

  // Check if Whop checkout is available
  const hasWhopCheckout = !!plan.whop_plan_url;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Link
        href="/choose-plan"
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to plans
      </Link>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold text-text-primary mb-6">Order Summary</h2>

          <div className="space-y-4">
            {/* Plan Details */}
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text-primary">{plan.name}</h3>
                {plan.badge && (
                  <span className="px-2 py-0.5 bg-red-primary/10 text-red-primary text-xs font-medium rounded">
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="text-text-secondary text-sm">{plan.description}</p>
            </div>

            {/* Features */}
            <div className="space-y-2">
              {plan.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">
                  ${plan.price} / {plan.interval === 'yearly' ? 'year' : plan.interval === 'lifetime' ? 'one-time' : 'month'}
                </span>
              </div>
              {plan.interval === 'yearly' && (
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-green-500">Yearly discount</span>
                  <span className="text-green-500">Save ~30%</span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-text-primary">Total</span>
                <span className="text-red-primary">${plan.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold text-text-primary mb-6">Complete Purchase</h2>

          {/* User Info */}
          <div className="mb-6 p-4 bg-background rounded-lg border border-border">
            <p className="text-sm text-text-secondary">Paying as</p>
            <p className="font-medium text-text-primary">{user?.email}</p>
          </div>

          {hasWhopCheckout ? (
            <>
              {/* Payment Info */}
              <div className="mb-6 p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-text-primary" />
                  <p className="font-medium text-text-primary">Secure Checkout</p>
                </div>
                <p className="text-sm text-text-secondary">
                  You&apos;ll be redirected to our secure payment partner to complete your purchase.
                  All major credit cards and payment methods are accepted.
                </p>
              </div>

              {/* What happens next */}
              <div className="mb-6 space-y-2">
                <p className="text-sm font-medium text-text-primary">What happens next:</p>
                <div className="space-y-1.5 text-sm text-text-secondary">
                  <div className="flex items-start gap-2">
                    <span className="text-red-primary font-medium">1.</span>
                    <span>Complete payment on our secure checkout page</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-primary font-medium">2.</span>
                    <span>You&apos;ll be redirected back to TabooTV</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-primary font-medium">3.</span>
                    <span>Start watching all premium content immediately</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                className="w-full btn-premium flex items-center justify-center gap-2"
              >
                <span>Continue to Checkout</span>
                <ExternalLink className="w-4 h-4" />
              </Button>

              {/* Security Notice */}
              <p className="mt-4 text-xs text-text-secondary text-center">
                Secure payment processing. Cancel anytime from your account settings.
              </p>
            </>
          ) : (
            /* No checkout available */
            (<div className="text-center py-8">
              <p className="text-text-secondary mb-4">
                Online checkout is not available for this plan.
              </p>
              <p className="text-sm text-text-secondary">
                Please contact support for assistance.
              </p>
            </div>)
          )}
        </div>
      </div>
    </div>
  );
}
