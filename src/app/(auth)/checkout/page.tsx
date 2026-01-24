'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Crown, Check, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { subscriptionsClient as subscriptionsApi } from '@/api/client/subscriptions.client';
import type { Plan } from '@/types';
import { useAuthStore } from '@/lib/stores';
import { Button, LoadingScreen } from '@/components/ui';
import { Logo } from '@/components/ui/logo';
import { toast } from 'sonner';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planId = searchParams.get('plan');
  const interval = searchParams.get('interval') as 'monthly' | 'yearly' | null;

  useEffect(() => {
    async function fetchPlan() {
      try {
        setIsLoading(true);
        const plans = await subscriptionsApi.getPlans();
        const selectedPlan = plans.find(
          (p) => (planId ? p.id === Number(planId) : true) && p.interval === (interval || 'monthly')
        );
        setPlan(selectedPlan || plans[0] || null);
      } catch (err) {
        console.error('Failed to fetch plan:', err);
        setError('Failed to load plan details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlan();
  }, [planId, interval]);

  const handleSubscribe = async () => {
    if (!plan) return;

    setIsProcessing(true);
    setError(null);

    try {
      // This would integrate with Stripe or your payment provider
      // For now, show a message that this is a demo
      toast.info('Payment integration coming soon. Please use the mobile app to subscribe.');

      // In production, you would:
      // 1. Create a Stripe checkout session
      // 2. Redirect to Stripe
      // 3. Handle webhook for successful payment
      // 4. Update subscription status

    } catch (err) {
      console.error('Subscription failed:', err);
      setError('Failed to process subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading checkout..." />;
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Plan Not Found</h1>
          <p className="text-text-secondary mb-6">The selected plan is not available.</p>
          <Link href="/choose-plan">
            <Button className="btn-premium">View Available Plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const features = plan.features || [
    'Access to all premium content',
    'Exclusive series and courses',
    'Ad-free viewing experience',
    'Download videos for offline',
    'Early access to new releases',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/choose-plan"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plans
          </Link>
          <Logo size="sm" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="order-2 md:order-1">
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="text-xl font-bold text-text-primary mb-6">Order Summary</h2>

              {/* Plan Details */}
              <div className="flex items-start gap-4 pb-6 border-b border-border">
                <div className="w-12 h-12 rounded-full bg-red-primary/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-red-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">
                    TabooTV Premium ({plan.interval})
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {plan.description || 'Full access to all premium content'}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="py-6 border-b border-border">
                <h4 className="text-sm font-medium text-text-secondary mb-4">What&apos;s included:</h4>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-text-secondary">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                      <span className="capitalize">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing */}
              <div className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary">{formatPrice(plan.price, plan.currency)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-secondary">Trial Period</span>
                  <span className="text-green-500">3 Days Free</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="font-semibold text-text-primary">Due Today</span>
                  <span className="text-2xl font-bold text-text-primary">$0.00</span>
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  You&apos;ll be charged {formatPrice(plan.price, plan.currency)} after your 3-day trial ends
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="order-1 md:order-2">
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="text-xl font-bold text-text-primary mb-6">Payment Details</h2>

              {error && (
                <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Account Info */}
              <div className="mb-6 p-4 bg-hover rounded-lg">
                <p className="text-sm text-text-secondary mb-1">Subscribing as</p>
                <p className="text-text-primary font-medium">{user?.email}</p>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 p-4 bg-hover border-2 border-red-primary rounded-lg"
                  >
                    <CreditCard className="w-5 h-5 text-text-secondary" />
                    <span className="text-text-primary font-medium">Credit / Debit Card</span>
                    <Check className="w-5 h-5 text-red-primary ml-auto" />
                  </button>
                </div>
              </div>

              {/* Card Details Placeholder */}
              <div className="mb-6 p-4 bg-hover rounded-lg text-center">
                <Lock className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">
                  Secure payment powered by Stripe
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Card details will be collected securely
                </p>
              </div>

              {/* Subscribe Button */}
              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full btn-premium py-4 text-lg font-semibold"
              >
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </>
                )}
              </Button>

              {/* Terms */}
              <p className="text-xs text-text-secondary text-center mt-4">
                By subscribing, you agree to our{' '}
                <Link href="/terms" className="text-red-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-red-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Security Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
              <Lock className="w-4 h-4" />
              <span>256-bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading checkout..." />}>
      <CheckoutForm />
    </Suspense>
  );
}
