'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { authClient } from '@/api/client';
import { Button } from '@/components/ui';
import { Logo } from '@/components/ui/logo';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await authClient.forgotPassword(email);
      setIsSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch {
      toast.error('Failed to send reset link. Please check your email address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-2xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3">Check Your Email</h1>
            <p className="text-text-secondary mb-6">
              We&apos;ve sent a password reset link to <span className="text-text-primary font-medium">{email}</span>
            </p>
            <p className="text-sm text-text-secondary mb-6">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full"
              >
                Try Another Email
              </Button>
              <Link href="/sign-in">
                <Button variant="ghost" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl border border-border p-8">
          {/* Back Link */}
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Reset Your Password</h1>
            <p className="text-text-secondary">
              Enter your email and we&apos;ll send you a link to reset your password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e-mail@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-red-primary transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-premium py-3"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-text-secondary mt-6">
            Remember your password?{' '}
            <Link href="/sign-in" className="text-red-primary hover:text-red-hover transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
