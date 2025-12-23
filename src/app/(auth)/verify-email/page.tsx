'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { Logo } from '@/components/ui/logo';
import { auth } from '@/lib/api';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const id = searchParams.get('id');

  useEffect(() => {
    async function verifyEmail() {
      // If we have a token, attempt verification
      if (token && (email || id)) {
        try {
          const { data } = await apiClient.get('/email/verify', {
            params: { token, email, id },
          });
          setStatus('success');
          setMessage(data.message || 'Your email has been verified successfully!');
          toast.success('Email verified successfully!');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/sign-in');
          }, 3000);
        } catch (error: unknown) {
          setStatus('error');
          const err = error as { response?: { data?: { message?: string } } };
          setMessage(err.response?.data?.message || 'Email verification failed. The link may have expired.');
        }
      } else {
        // No token - show pending verification state
        setStatus('pending');
        setMessage('Please check your email for a verification link.');
      }
    }

    verifyEmail();
  }, [token, email, id, router]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await apiClient.post('/email/resend-verification');
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 text-center">
          {/* Status Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            )}
            {status === 'pending' && (
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-yellow-500" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
            {status === 'pending' && 'Verify Your Email'}
          </h1>

          {/* Message */}
          <p className="text-text-secondary mb-6">{message}</p>

          {/* Actions */}
          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">Redirecting to login...</p>
              <Link href="/sign-in">
                <Button className="w-full">Continue to Login</Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                isLoading={isResending}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Verification Email
              </Button>
              <Link href="/sign-in" className="block">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          {status === 'pending' && (
            <div className="space-y-4">
              <div className="p-4 bg-hover rounded-lg text-left">
                <p className="text-sm text-text-secondary">
                  We&apos;ve sent a verification link to your email address. Click the link in the
                  email to verify your account.
                </p>
              </div>
              <Button
                onClick={handleResendVerification}
                isLoading={isResending}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Verification Email
              </Button>
              <p className="text-sm text-text-secondary">
                Already verified?{' '}
                <Link href="/sign-in" className="text-red-primary hover:text-red-hover">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {status === 'loading' && (
            <p className="text-sm text-text-secondary">Please wait while we verify your email...</p>
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-text-secondary mt-6">
          Having trouble?{' '}
          <a href="mailto:support@taboo.tv" className="text-red-primary hover:text-red-hover">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 text-red-primary animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
