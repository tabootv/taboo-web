'use client';

import { subscriptionsClient } from '@/api/client/subscriptions.client';
import { useSubscription } from '@/hooks';
import { useAuthStore } from '@/shared/stores/auth-store';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Crown,
  ExternalLink,
  HelpCircle,
  Loader2,
  RefreshCw,
  Smartphone,
  Sparkles,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

const CANCEL_POLL_INTERVAL_MS = 3500;
const CANCEL_POLL_MAX_ATTEMPTS = 8;

const GLASS_CARD = 'rounded-2xl backdrop-blur-xl' as const;
const GLASS_CARD_STYLE = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
} as const;

const PREMIUM_FEATURES = [
  'Unlimited streaming access',
  'Exclusive creator content',
  'Early access to new releases',
  'HD & 4K quality',
  'Watch on any device',
  'Cancel anytime',
];

interface StatusDisplayInfo {
  color: string;
  barColor: string;
  badgeBg: string;
  label: string;
  icon: React.ReactNode;
}

const STATUS_DISPLAY_MAP: Record<string, StatusDisplayInfo> = {
  active: {
    color: 'text-green-500',
    barColor: 'bg-green-500',
    badgeBg: 'rgba(34,197,94,0.1)',
    label: 'Active',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  canceled: {
    color: 'text-yellow-500',
    barColor: 'bg-yellow-500',
    badgeBg: 'rgba(245,158,11,0.1)',
    label: 'Canceled',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  expired: {
    color: 'text-red-500',
    barColor: 'bg-red-500',
    badgeBg: 'rgba(239,68,68,0.1)',
    label: 'Expired',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  past_due: {
    color: 'text-orange-500',
    barColor: 'bg-orange-500',
    badgeBg: 'rgba(249,115,22,0.1)',
    label: 'Past Due',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

const DEFAULT_STATUS: StatusDisplayInfo = {
  color: 'text-text-secondary',
  barColor: 'bg-white/20',
  badgeBg: 'rgba(255,255,255,0.05)',
  label: 'Unknown',
  icon: <CreditCard className="w-3.5 h-3.5" />,
};

const PROVIDER_NAMES: Record<string, string> = {
  whop: 'Whop',
  apple: 'Apple App Store',
  google: 'Google Play',
  stripe: 'Stripe',
  copecart: 'CopeCart',
};

function formatDateLocal(dateString?: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function SubscriptionPage() {
  const { user, setSubscribed } = useAuthStore();
  const {
    isSubscribed,
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

  const [pollingAfterManage, setPollingAfterManage] = useState(false);
  const [cancellationDetected, setCancellationDetected] = useState(false);
  const wasSubscribedRef = useRef(isSubscribed);

  // Track initial subscription state
  useEffect(() => {
    if (!loading) {
      wasSubscribedRef.current = isSubscribed;
    }
  }, [isSubscribed, loading]);

  // Post-cancellation polling: detect when user returns from manage portal
  const pollForCancellation = useCallback(async () => {
    setPollingAfterManage(true);
    try {
      for (let i = 0; i < CANCEL_POLL_MAX_ATTEMPTS; i++) {
        const statusResult = await subscriptionsClient.getStatus();
        if (!statusResult.is_subscribed && wasSubscribedRef.current) {
          setCancellationDetected(true);
          setSubscribed(false);
          setPollingAfterManage(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, CANCEL_POLL_INTERVAL_MS));
      }
    } catch {
      // Silently fail polling
    } finally {
      setPollingAfterManage(false);
    }
  }, [setSubscribed]);

  // Listen for visibility change after opening manage portal
  const handleManageClick = useCallback(() => {
    openManageSubscription();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        pollForCancellation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }, [openManageSubscription, pollForCancellation]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-red-primary/20 blur-xl animate-pulse" />
          <Loader2 className="w-10 h-10 text-red-primary animate-spin relative z-10" />
        </div>
        <p className="text-text-secondary mt-4">Loading subscription details...</p>
      </div>
    );
  }

  const statusInfo = STATUS_DISPLAY_MAP[status ?? ''] ?? DEFAULT_STATUS;
  const providerName = PROVIDER_NAMES[provider ?? ''] ?? 'Unknown';
  const billingLabel = status === 'canceled' ? 'Access Until' : 'Next Billing';
  const isWebProvider = provider !== 'apple' && provider !== 'google';

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Subscription</h1>
        {pollingAfterManage && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-blue-400"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <RefreshCw className="w-3 h-3 animate-spin" />
            Checking...
          </span>
        )}
      </div>

      {/* Cancellation Banner */}
      {cancellationDetected && (
        <div
          className={`${GLASS_CARD} mb-6 p-5 animate-[fadeInScale_0.4s_cubic-bezier(0.4,0,0.2,1)]`}
          style={{
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.15)',
          }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-500 font-semibold text-sm">Subscription Canceled</p>
              <p className="text-text-secondary text-sm mt-1">
                Your subscription has been canceled. You may still have access until the end of your
                billing period.
              </p>
              <Link
                href="/choose-plan"
                className="btn-premium inline-flex items-center justify-center gap-2 mt-3 px-5 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wider"
              >
                Re-subscribe
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          className={`${GLASS_CARD} mb-6 p-5`}
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={refreshSubscription}
            className="mt-2 text-sm text-red-primary hover:text-red-hover transition-colors font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {isSubscribed && !cancellationDetected ? (
        /* Active Subscription: Split Layout */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column — Plan Details */}
          <div className="md:col-span-7">
            <div className={`${GLASS_CARD} overflow-hidden`} style={GLASS_CARD_STYLE}>
              {/* Status Bar */}
              <div className={`h-1 ${statusInfo.barColor}`} />

              <div className="p-6">
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                      Your Plan
                    </p>
                    <h2 className="text-2xl font-bold text-white capitalize">
                      {plan || 'Premium'}
                    </h2>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color}`}
                    style={{ background: statusInfo.badgeBg }}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />

                {/* Features List */}
                <div className="space-y-3">
                  {PREMIUM_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Cancellation Notice */}
                {status === 'canceled' && currentPeriodEnd && (
                  <div
                    className="mt-6 p-4 rounded-xl"
                    style={{
                      background: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.12)',
                    }}
                  >
                    <p className="text-sm text-yellow-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Access continues until {formatDateLocal(currentPeriodEnd)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column — Billing & Manage */}
          <div className="md:col-span-5 space-y-6">
            {/* Billing Details Card */}
            <div className={`${GLASS_CARD} p-6`} style={GLASS_CARD_STYLE}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-5">
                Billing Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Provider</p>
                  <p className="text-sm text-white font-medium">{providerName}</p>
                </div>
                {currentPeriodEnd && (
                  <div>
                    <p className="text-xs text-text-tertiary mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {billingLabel}
                    </p>
                    <p className="text-sm text-white font-medium">
                      {formatDateLocal(currentPeriodEnd)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Account</p>
                  <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Management Actions */}
            <div className={`${GLASS_CARD} overflow-hidden`} style={GLASS_CARD_STYLE}>
              <div className="px-6 pt-6 pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Manage
                </h3>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {/* Apple-specific */}
                {provider === 'apple' && (
                  <>
                    <button
                      onClick={() =>
                        window.open(
                          'https://apps.apple.com/account/subscriptions',
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                      className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/[0.03] transition-colors"
                    >
                      <Smartphone className="w-5 h-5 text-text-secondary flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">Open on iOS</p>
                        <p className="text-xs text-text-tertiary">Settings &rarr; Subscriptions</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-tertiary" />
                    </button>
                    <Link
                      href="/payment/manage-apple"
                      className="flex items-center gap-3 px-6 py-4 hover:bg-white/[0.03] transition-colors"
                    >
                      <HelpCircle className="w-5 h-5 text-text-secondary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Detailed instructions</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-tertiary" />
                    </Link>
                  </>
                )}

                {/* Google-specific */}
                {provider === 'google' && (
                  <button
                    onClick={() =>
                      window.open(
                        'https://play.google.com/store/account/subscriptions',
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-text-secondary flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">Open Google Play</p>
                      <p className="text-xs text-text-tertiary">Manage via Google Play Store</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                  </button>
                )}

                {/* Web providers with manage URL */}
                {isWebProvider && manageUrl && (
                  <button
                    onClick={handleManageClick}
                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <CreditCard className="w-5 h-5 text-red-primary flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">Manage Subscription</p>
                      <p className="text-xs text-text-tertiary">
                        Update payment, change plan, or cancel
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                  </button>
                )}

                {/* Web providers without manage URL */}
                {isWebProvider && !manageUrl && (
                  <a
                    href="mailto:support@taboo.tv"
                    className="flex items-center gap-3 px-6 py-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <HelpCircle className="w-5 h-5 text-text-secondary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Contact Support</p>
                      <p className="text-xs text-text-tertiary">
                        Get help managing your subscription
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No Subscription: Promo Card */
        <div
          className={`${GLASS_CARD} relative overflow-hidden p-10 text-center animate-[fadeInScale_0.4s_cubic-bezier(0.4,0,0.2,1)]`}
          style={GLASS_CARD_STYLE}
        >
          {/* Red Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center top, rgba(171,0,19,0.15) 0%, transparent 60%)',
            }}
          />

          <div className="relative z-10">
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(171,0,19,0.1)',
                border: '1px solid rgba(171,0,19,0.2)',
              }}
            >
              <Crown className="w-10 h-10 text-red-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
              Unlock Premium Content
            </h2>
            <p className="text-text-secondary text-base mb-8 max-w-md mx-auto">
              Get unlimited access to exclusive creator content, early releases, and HD streaming on
              any device.
            </p>
            <Link
              href="/choose-plan"
              className="btn-premium inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              View Plans
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
