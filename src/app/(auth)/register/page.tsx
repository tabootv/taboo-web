'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useGuestOnly } from '@/hooks';
import { useSocialAuth } from '@/hooks/use-social-auth';
import { useAuthStore } from '@/shared/stores/auth-store';
import { getOnboardingRedirectPath } from '@/shared/lib/auth/profile-completion';
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useGuestOnly('/');
  const {
    signInWithGoogle,
    signInWithApple,
    isLoading: socialLoading,
    error: socialError,
  } = useSocialAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);

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

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    if (!acceptTerms) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register({
        ...formData,
        privacy_policy: true,
        terms_and_condition: true,
      });
      toast.success('Account created successfully!');
      const { user, isSubscribed } = useAuthStore.getState();
      const onboardingPath = getOnboardingRedirectPath(user, isSubscribed);
      router.push(onboardingPath || '/');
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((key) => {
          formattedErrors[key] = apiErrors[key][0];
        });
        setErrors(formattedErrors);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      toast.success('Account created successfully!');
      const { user, isSubscribed } = useAuthStore.getState();
      const onboardingPath = getOnboardingRedirectPath(user, isSubscribed);
      router.push(onboardingPath || '/');
    } else if (result.error && result.error !== 'Sign-in cancelled') {
      toast.error(result.error);
    }
  };

  const handleAppleSignIn = async () => {
    const result = await signInWithApple();
    if (result.success) {
      toast.success('Account created successfully!');
      const { user, isSubscribed } = useAuthStore.getState();
      const onboardingPath = getOnboardingRedirectPath(user, isSubscribed);
      router.push(onboardingPath || '/');
    } else if (result.error && result.error !== 'Sign-in cancelled') {
      toast.error(result.error);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  const inputErrorStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--red-primary)',
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Create account</h1>
        <p className="mt-1.5 text-sm text-white/50">Join TabooTV and start watching</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-white/70 mb-1.5">
              First name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                id="first_name"
                type="text"
                name="first_name"
                placeholder="First"
                value={formData.first_name}
                onChange={handleChange}
                disabled={isAnyLoading}
                autoComplete="given-name"
                className="w-full h-11 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-white/30 transition-all outline-none"
                style={errors.first_name ? inputErrorStyle : inputStyle}
              />
            </div>
            {errors.first_name && (
              <p className="mt-1 text-xs text-red-primary">{errors.first_name}</p>
            )}
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-white/70 mb-1.5">
              Last name
            </label>
            <input
              id="last_name"
              type="text"
              name="last_name"
              placeholder="Last"
              value={formData.last_name}
              onChange={handleChange}
              disabled={isAnyLoading}
              autoComplete="family-name"
              className="w-full h-11 px-4 rounded-lg text-sm text-white placeholder:text-white/30 transition-all outline-none"
              style={errors.last_name ? inputErrorStyle : inputStyle}
            />
            {errors.last_name && (
              <p className="mt-1 text-xs text-red-primary">{errors.last_name}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={isAnyLoading}
              autoComplete="email"
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-white/30 transition-all outline-none"
              style={errors.email ? inputErrorStyle : inputStyle}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-primary">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              disabled={isAnyLoading}
              autoComplete="new-password"
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-white/30 transition-all outline-none"
              style={errors.password ? inputErrorStyle : inputStyle}
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-primary">{errors.password}</p>}
        </div>

        <div>
          <label
            htmlFor="password_confirmation"
            className="block text-sm font-medium text-white/70 mb-1.5"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              id="password_confirmation"
              type="password"
              name="password_confirmation"
              placeholder="Confirm your password"
              value={formData.password_confirmation}
              onChange={handleChange}
              disabled={isAnyLoading}
              autoComplete="new-password"
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-white/30 transition-all outline-none"
              style={errors.password_confirmation ? inputErrorStyle : inputStyle}
            />
          </div>
          {errors.password_confirmation && (
            <p className="mt-1 text-xs text-red-primary">{errors.password_confirmation}</p>
          )}
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded bg-white/5 border-white/10 text-red-primary focus:ring-red-primary/30 focus:ring-offset-0"
          />
          <span className="text-sm text-white/50 leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" className="text-red-primary hover:text-red-hover transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-red-primary hover:text-red-hover transition-colors"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isAnyLoading}
          className="w-full h-11 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
          style={{
            background: 'var(--red-primary)',
            opacity: isAnyLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 text-white/40" style={{ background: 'transparent' }}>
            or
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isAnyLoading}
          className="h-11 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all hover:bg-white/10 disabled:opacity-70"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {socialLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          className="h-11 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all hover:bg-white/10 disabled:opacity-70"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {socialLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          )}
          Apple
        </button>
      </div>

      {/* Social auth error */}
      {socialError && <p className="mt-2 text-center text-xs text-red-primary">{socialError}</p>}

      {/* Sign In Link */}
      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="text-red-primary font-semibold hover:text-red-hover transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
