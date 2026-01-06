'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { useSubscription } from '@/lib/hooks';
import { Button } from '@/components/ui';

/**
 * Subscription management page
 *
 * Shows current subscription status and provides link to manage subscription
 * via the provider's portal (Whop manage_url, Apple, or Google)
 */
export default function SubscriptionPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const {
    isSubscribed,
    subscriptionInfo: _subscriptionInfo,
    loading,
    error,
    provider,
    plan,
    status,
    currentPeriodEnd,
    manageUrl,
    openManageSubscription,
    refreshSubscription,
  } = useSubscription();

  // Format date helper
  const formatDateLocal = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge color and icon
  const getStatusDisplay = () => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          icon: <CheckCircle2 className="w-5 h-5" />,
          label: 'Active',
        };
      case 'canceled':
        return {
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          icon: <AlertCircle className="w-5 h-5" />,
          label: 'Canceled (Active until period end)',
        };
      case 'expired':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          icon: <XCircle className="w-5 h-5" />,
          label: 'Expired',
        };
      case 'past_due':
        return {
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          icon: <AlertCircle className="w-5 h-5" />,
          label: 'Payment Past Due',
        };
      default:
        return {
          color: 'text-text-secondary',
          bgColor: 'bg-surface',
          icon: <CreditCard className="w-5 h-5" />,
          label: 'Unknown',
        };
    }
  };

  // Get provider display name
  const getProviderDisplay = () => {
    switch (provider) {
      case 'whop':
        return 'Whop';
      case 'apple':
        return 'Apple App Store';
      case 'google':
        return 'Google Play';
      case 'stripe':
        return 'Stripe';
      case 'copecart':
        return 'CopeCart';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-primary animate-spin mb-4" />
        <p className="text-text-secondary">Loading subscription details...</p>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Link
        href="/profile"
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Profile
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-6">Subscription</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={refreshSubscription}
            className="mt-2 text-sm text-red-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {isSubscribed ? (
        /* Active Subscription View */
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Current Plan</h2>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                {statusDisplay.icon}
                <span className="text-sm font-medium">{statusDisplay.label}</span>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Plan Name */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-text-secondary">Plan</span>
                <span className="text-text-primary font-medium capitalize">
                  {plan || 'Premium'}
                </span>
              </div>

              {/* Provider */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-text-secondary">Billing Provider</span>
                <span className="text-text-primary font-medium">
                  {getProviderDisplay()}
                </span>
              </div>

              {/* Period End */}
              {currentPeriodEnd && (
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-text-secondary flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {status === 'canceled' ? 'Access Until' : 'Next Billing Date'}
                  </span>
                  <span className="text-text-primary font-medium">
                    {formatDateLocal(currentPeriodEnd)}
                  </span>
                </div>
              )}

              {/* Email */}
              <div className="flex items-center justify-between py-3">
                <span className="text-text-secondary">Account Email</span>
                <span className="text-text-primary font-medium">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Manage Subscription */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Manage Subscription</h2>

            {provider === 'apple' ? (
              /* Apple subscription management */
              <div className="space-y-4">
                <p className="text-text-secondary text-sm">
                  Your subscription is managed through the Apple App Store.
                  To update your payment method, cancel, or change your plan,
                  use your device&apos;s subscription settings.
                </p>
                <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                  <Smartphone className="w-8 h-8 text-text-secondary" />
                  <div>
                    <p className="font-medium text-text-primary">Open on iOS</p>
                    <p className="text-sm text-text-secondary">
                      Settings → Apple ID → Subscriptions
                    </p>
                  </div>
                </div>
                <Link
                  href="/payment/manage-apple"
                  className="inline-flex items-center gap-2 text-red-primary hover:underline text-sm"
                >
                  View detailed instructions
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : provider === 'google' ? (
              /* Google Play subscription management */
              <div className="space-y-4">
                <p className="text-text-secondary text-sm">
                  Your subscription is managed through Google Play.
                  To update your payment method, cancel, or change your plan,
                  use the Play Store app.
                </p>
                <Button
                  onClick={() => window.open('https://play.google.com/store/account/subscriptions', '_blank')}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  Open Google Play Subscriptions
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ) : manageUrl ? (
              /* Whop/other provider with manage URL */
              <div className="space-y-4">
                <p className="text-text-secondary text-sm">
                  Manage your subscription, update payment methods, or cancel
                  anytime through our billing portal.
                </p>
                <Button
                  onClick={openManageSubscription}
                  className="w-full btn-premium flex items-center justify-center gap-2"
                >
                  Manage Subscription
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              /* No management URL available */
              <div className="space-y-4">
                <p className="text-text-secondary text-sm">
                  To manage your subscription, please contact our support team.
                </p>
                <a
                  href="mailto:support@taboo.tv"
                  className="inline-flex items-center gap-2 text-red-primary hover:underline"
                >
                  Contact Support
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No Active Subscription View */
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-hover flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-text-secondary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No Active Subscription
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Subscribe to TabooTV to unlock all premium content from your favorite creators.
          </p>
          <Link href="/choose-plan">
            <Button className="btn-premium">
              View Plans
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
