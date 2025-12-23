'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Apple, ExternalLink, Settings, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { Button } from '@/components/ui';

export default function ManageApplePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in?redirect=/payment/manage-apple');
    }
  }, [isAuthenticated, router]);

  const openAppStoreSubscriptions = () => {
    // Deep link to App Store subscriptions
    window.open('https://apps.apple.com/account/subscriptions', '_blank');
  };

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

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-surface border border-border rounded-full mb-4">
          <Apple className="w-8 h-8 text-text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Apple Subscription</h1>
        <p className="text-text-secondary mt-2">
          Manage your TabooTV subscription through Apple
        </p>
      </div>

      {/* Info Cards */}
      <div className="space-y-4 mb-8">
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-red-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">
                Manage Your Subscription
              </h3>
              <p className="text-text-secondary text-sm">
                Your subscription is managed through Apple. To change your plan, cancel, or update payment methods, you&apos;ll need to use your Apple ID settings.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">
                Billing & Renewals
              </h3>
              <p className="text-text-secondary text-sm">
                Apple handles all billing for your subscription. You can view your billing history and manage payment methods in your Apple ID settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-8">
        <h3 className="font-semibold text-text-primary mb-4">
          How to manage your subscription:
        </h3>
        <ol className="space-y-3 text-text-secondary">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-red-primary/10 text-red-primary rounded-full flex items-center justify-center text-sm font-medium">
              1
            </span>
            <span>Open the Settings app on your iPhone or iPad</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-red-primary/10 text-red-primary rounded-full flex items-center justify-center text-sm font-medium">
              2
            </span>
            <span>Tap your name at the top of the screen</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-red-primary/10 text-red-primary rounded-full flex items-center justify-center text-sm font-medium">
              3
            </span>
            <span>Tap &quot;Subscriptions&quot;</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-red-primary/10 text-red-primary rounded-full flex items-center justify-center text-sm font-medium">
              4
            </span>
            <span>Find and tap &quot;TabooTV&quot; to manage</span>
          </li>
        </ol>
      </div>

      {/* Action Button */}
      <Button
        onClick={openAppStoreSubscriptions}
        className="w-full btn-premium"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Open Apple Subscriptions
      </Button>

      {/* Help Link */}
      <p className="text-center text-text-secondary text-sm mt-6">
        Having trouble?{' '}
        <a
          href="https://support.apple.com/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-primary hover:underline"
        >
          Visit Apple Support
        </a>
      </p>
    </div>
  );
}
