'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Sparkles,
  Star,
} from 'lucide-react';
import { authClient } from '@/api/client/auth.client';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { User } from '@/types';

type CallbackState = 'loading' | 'success' | 'login_required' | 'error';

function getStepDotClass(stepIndex: number, state: CallbackState) {
  const activeClass = 'w-2 h-2 rounded-full bg-red-primary shadow-[0_0_10px_rgba(171,0,19,0.8)]';
  const pendingClass = 'w-2 h-2 rounded-full bg-red-primary/40';
  const inactiveClass = 'w-2 h-2 rounded-full bg-white/10';

  if (state === 'loading') {
    if (stepIndex === 0) return activeClass;
    return stepIndex === 1 ? pendingClass : inactiveClass;
  }
  if (state === 'success' || state === 'login_required') {
    return activeClass;
  }
  // error
  if (stepIndex === 0) return activeClass;
  return stepIndex === 1 ? 'w-2 h-2 rounded-full bg-red-500/60' : inactiveClass;
}

function WhopCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser } = useAuthStore();

  const code = searchParams.get('code');
  const membershipId = searchParams.get('membership_id') || undefined;

  const [state, setState] = useState<CallbackState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [redirectEmail, setRedirectEmail] = useState('');
  const hasProcessed = useRef(false);

  // Redirect to /choose-plan if no code param is present
  useEffect(() => {
    if (!code) {
      router.replace('/choose-plan');
    }
  }, [code, router]);

  useEffect(() => {
    if (hasProcessed.current || !code) return;
    hasProcessed.current = true;

    async function exchangeCode() {
      try {
        const response = await authClient.whopExchange({
          code: code!,
          membership_id: membershipId,
          redirect_uri: `${window.location.origin}/auth/whop-callback`,
        });

        // Scenario 3: Existing user, not logged in (202 from proxy)
        if (response.email && response.scenario === 'existing_logged_out') {
          setState('login_required');
          setRedirectEmail(response.email);
          setTimeout(() => {
            const params = new URLSearchParams({
              email: response.email!,
              subscription_activated: 'true',
            });
            window.location.replace(`/sign-in?${params.toString()}`);
          }, 3000);
          return;
        }

        // Scenario 1 & 2: Token received, user authenticated
        if (response.user) {
          const user = response.user as unknown as User;
          useAuthStore.setState({
            user,
            isSubscribed: response.subscribed ?? true,
            isAuthenticated: true,
            isInitialized: true,
          });

          setState('success');

          if (response.requires_profile_completion || response.scenario === 'new_user') {
            await fetchUser();
            setTimeout(() => window.location.replace('/account/complete'), 1500);
          } else {
            await fetchUser();
            setTimeout(() => window.location.replace('/'), 1500);
          }
          return;
        }

        setState('error');
        setErrorMessage('Unexpected response. Please try signing in.');
      } catch (err) {
        console.error('Whop exchange failed:', err);

        const error = err as { response?: { status?: number; data?: { message?: string } } };
        if (error.response?.status === 422 || error.response?.status === 400) {
          setState('error');
          setErrorMessage(
            error.response.data?.message ||
              'Invalid or expired authorization code. Please try checking out again.'
          );
        } else {
          setState('error');
          setErrorMessage('A network error occurred. Please try again.');
        }
      }
    }

    exchangeCode();
  }, [code, membershipId, router, fetchUser]);

  return (
    <div className="w-full max-w-md mx-auto text-center py-8 px-4">
      {/* Progress Step Dots */}
      <div className="flex justify-center items-center gap-2 mb-10">
        <div className={getStepDotClass(0, state)} />
        <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className={getStepDotClass(1, state)} />
        <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className={getStepDotClass(2, state)} />
      </div>

      {/* Loading State */}
      {state === 'loading' && (
        <div className="animate-[fadeInScale_0.4s_cubic-bezier(0.4,0,0.2,1)]">
          <div className="relative mb-8 flex justify-center items-center">
            <div className="absolute w-24 h-24 rounded-full bg-red-primary/20 blur-2xl animate-pulse" />
            <Loader2 className="w-14 h-14 text-red-primary animate-spin relative z-10" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">Completing purchase</h1>
          <p className="text-text-secondary text-base">
            Hang tight while we activate your premium access.
          </p>
        </div>
      )}

      {/* Success State */}
      {state === 'success' && (
        <div className="animate-[fadeInScale_0.4s_cubic-bezier(0.4,0,0.2,1)]">
          <div className="relative mb-8 flex justify-center items-center">
            <div className="absolute w-32 h-32 rounded-full bg-green-500/10 blur-3xl" />
            <CheckCircle2 className="w-14 h-14 text-green-500 relative z-10" />
            <Sparkles className="absolute top-0 right-1/4 w-4 h-4 text-yellow-400 opacity-50 animate-bounce" />
            <Star className="absolute bottom-0 left-1/4 w-3 h-3 text-green-400 opacity-40 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
            You&apos;re all set!
          </h1>
          <p className="text-text-secondary text-base">Redirecting to your dashboard...</p>
        </div>
      )}

      {/* Login Required State */}
      {state === 'login_required' && (
        <div className="animate-[fadeInScale_0.4s_cubic-bezier(0.4,0,0.2,1)]">
          <div className="relative mb-8 flex justify-center items-center">
            <div className="absolute w-32 h-32 rounded-full bg-green-500/10 blur-3xl" />
            <CheckCircle2 className="w-14 h-14 text-green-500 relative z-10" />
            <Sparkles className="absolute top-0 right-1/4 w-4 h-4 text-yellow-400 opacity-50 animate-bounce" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Subscription activated!
          </h1>
          <p className="text-text-secondary text-base mb-4">
            Please sign in to access your account.
          </p>
          <p className="text-text-secondary text-xs mb-8">Redirecting to sign in...</p>
          <Link
            href={`/sign-in?email=${encodeURIComponent(redirectEmail)}&subscription_activated=true`}
            className="btn-premium inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white uppercase tracking-wider"
          >
            Sign In Now
          </Link>
        </div>
      )}

      {/* Error State */}
      {state === 'error' && (
        <div className="animate-[fadeInScale_0.4s_cubic-bezier(0.4,0,0.2,1)]">
          <div className="mb-8 flex justify-center">
            <div
              className="p-4 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">Activation Failed</h1>
          <p className="text-text-secondary text-base mb-10 px-2">{errorMessage}</p>
          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={() => {
                hasProcessed.current = false;
                setState('loading');
                setErrorMessage('');
                window.location.reload();
              }}
              className="btn-premium w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white uppercase tracking-wider"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/choose-plan"
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-text-primary flex items-center justify-center transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              View Plans
            </Link>
            <a
              href="mailto:support@taboo.tv"
              className="mt-2 text-xs font-medium text-text-secondary hover:text-red-primary transition-colors flex items-center justify-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Contact support team
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WhopCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-red-primary/20 blur-xl animate-pulse" />
            <Loader2 className="w-10 h-10 animate-spin text-red-primary relative z-10" />
          </div>
        </div>
      }
    >
      <WhopCallbackContent />
    </Suspense>
  );
}
