'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { authClient } from '@/api/client/auth.client';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!token || !email) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authClient.resetPassword({
        email,
        otp: token,
        password,
        password_confirmation: confirmPassword,
      });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch {
      toast.error('Failed to reset password. The code may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="w-full text-center">
        <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Password reset!</h1>
        <p className="text-sm text-text-secondary mb-5">
          Your password has been successfully reset.
        </p>
        <Link
          href="/sign-in"
          className="w-full h-10 rounded-lg text-sm font-semibold text-white bg-red-primary hover:bg-red-hover transition-colors flex items-center justify-center"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Invalid Token State
  if (!token || !email) {
    return (
      <div className="w-full text-center">
        <h1 className="text-xl font-semibold text-text-primary mb-2">Invalid reset link</h1>
        <p className="text-sm text-text-secondary mb-5">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="w-full h-10 rounded-lg text-sm font-semibold text-white bg-red-primary hover:bg-red-hover transition-colors flex items-center justify-center"
        >
          Request New Code
        </Link>
      </div>
    );
  }

  // Reset Password Form
  return (
    <div className="w-full">
      {/* Back Link */}
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </Link>

      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-xl font-semibold text-text-primary">Create new password</h1>
        <p className="mt-1 text-sm text-text-secondary">Enter your new password below</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3 pr-10 rounded-lg text-sm bg-background text-text-primary placeholder:text-text-tertiary border border-border transition-colors outline-none focus:border-red-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3 pr-10 rounded-lg text-sm bg-background text-text-primary placeholder:text-text-tertiary border border-border transition-colors outline-none focus:border-red-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 rounded-lg text-sm font-semibold text-white bg-red-primary hover:bg-red-hover disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
