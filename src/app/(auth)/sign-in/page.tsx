'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useGuestOnly } from '@/hooks';
import { useSocialAuth } from '@/hooks/use-social-auth';
import { useAuthStore } from '@/shared/stores/auth-store';
import { getOnboardingRedirectPath } from '@/shared/lib/auth/profile-completion';
import { AxiosError } from 'axios';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/home';
  const subscriptionActivated = searchParams.get('subscription_activated') === 'true';
  const prefillEmail = searchParams.get('email') || '';
  const { login, isLoading, error, clearError } = useGuestOnly(redirectTo);
  const {
    signInWithGoogle,
    signInWithApple,
    isLoading: socialLoading,
    error: socialError,
  } = useSocialAuth();
  const [formData, setFormData] = useState({
    email: prefillEmail,
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(false);

  const isAnyLoading = isLoading || socialLoading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login({ ...formData, remember_me: rememberMe });
      toast.success('Welcome back!');
      const { user, isSubscribed } = useAuthStore.getState();
      const onboardingPath = getOnboardingRedirectPath(user, isSubscribed);
      // Respect ?redirect= param if profile is complete and subscribed
      router.push(onboardingPath || redirectTo);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((key) => {
          formattedErrors[key] = apiErrors[key][0];
        });
        setErrors(formattedErrors);
      } else {
        toast.error('Invalid email or password');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      toast.success('Welcome back!');
      const { user, isSubscribed } = useAuthStore.getState();
      const onboardingPath = getOnboardingRedirectPath(user, isSubscribed);
      router.push(onboardingPath || redirectTo);
    } else if (result.error && result.error !== 'Sign-in cancelled') {
      toast.error(result.error);
    }
  };

  const handleAppleSignIn = async () => {
    const result = await signInWithApple();
    if (result.success) {
      toast.success('Welcome back!');
      const { user, isSubscribed } = useAuthStore.getState();
      const onboardingPath = getOnboardingRedirectPath(user, isSubscribed);
      router.push(onboardingPath || redirectTo);
    } else if (result.error && result.error !== 'Sign-in cancelled') {
      toast.error(result.error);
    }
  };

  return (
    <div className="w-full">
      {/* Subscription Activation Banner */}
      {subscriptionActivated && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-500 text-center font-medium">
            Your subscription has been activated! Sign in to start watching.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-xl font-semibold text-text-primary">Welcome back</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to continue to TabooTV</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isAnyLoading}
            autoComplete="email"
            className={`w-full h-10 px-3 rounded-lg text-sm bg-background text-text-primary placeholder:text-text-tertiary border transition-colors outline-none focus:border-red-primary ${
              errors.email ? 'border-red-primary' : 'border-border'
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-primary">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isAnyLoading}
            autoComplete="current-password"
            className={`w-full h-10 px-3 rounded-lg text-sm bg-background text-text-primary placeholder:text-text-tertiary border transition-colors outline-none focus:border-red-primary ${
              errors.password ? 'border-red-primary' : 'border-border'
            }`}
          />
          {errors.password && <p className="mt-1 text-xs text-red-primary">{errors.password}</p>}
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-background border-border text-red-primary focus:ring-red-primary/30 focus:ring-offset-0"
            />
            <span className="text-sm text-text-secondary">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-red-primary hover:text-red-hover transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isAnyLoading}
          className="w-full h-10 rounded-lg text-sm font-semibold text-white bg-red-primary hover:bg-red-hover disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-surface text-text-tertiary">or continue with</span>
        </div>
      </div>

      {/* Social Login Buttons - 2 column grid */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isAnyLoading}
          className="h-10 rounded-lg text-sm font-medium text-text-primary bg-background border border-border hover:bg-surface-hover disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
        >
          {socialLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#4285F4"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Google
        </button>

        <button
          type="button"
          onClick={handleAppleSignIn}
          disabled={isAnyLoading}
          className="h-10 rounded-lg text-sm font-medium text-text-primary bg-background border border-border hover:bg-surface-hover disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
        >
          {socialLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          )}
          Apple
        </button>
      </div>

      {/* Social auth error */}
      {socialError && <p className="mt-2 text-center text-xs text-red-primary">{socialError}</p>}

      {/* Sign Up Link */}
      <p className="mt-5 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-red-primary font-medium hover:text-red-hover transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-primary" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
