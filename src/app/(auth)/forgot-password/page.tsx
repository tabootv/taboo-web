'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import posthog from 'posthog-js';
import { authClient } from '@/api/client/auth.client';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { toast } from 'sonner';

type Step = 'email' | 'otp' | 'success';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(prefillEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP input when step changes to OTP
  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await authClient.forgotPassword(email);
      posthog.capture(AnalyticsEvent.AUTH_PASSWORD_RESET_REQUESTED);
      setStep('otp');
      toast.success('Verification code sent to your email');
    } catch {
      toast.error('Failed to send code. Please check your email address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newOtp.every((digit) => digit)) {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      handleOtpSubmit(pastedData);
    }
  };

  const handleOtpSubmit = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    // Redirect to reset password page with OTP as token
    router.push(`/reset-password?token=${otpCode}&email=${encodeURIComponent(email)}`);
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    try {
      await authClient.forgotPassword(email);
      toast.success('New verification code sent');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email Step
  if (step === 'email') {
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
          <h1 className="text-xl font-semibold text-text-primary">Reset password</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Enter your email to receive a verification code
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-10 px-3 rounded-lg text-sm bg-background text-text-primary placeholder:text-text-tertiary border border-border transition-colors outline-none focus:border-red-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-lg text-sm font-semibold text-white bg-red-primary hover:bg-red-hover disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Code'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-text-secondary mt-5">
          Remember your password?{' '}
          <Link href="/sign-in" className="text-red-primary hover:text-red-hover transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    );
  }

  // OTP Step
  if (step === 'otp') {
    return (
      <div className="w-full">
        {/* Back Link */}
        <button
          onClick={() => setStep('email')}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Change email
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-xl font-semibold text-text-primary">Enter verification code</h1>
          <p className="mt-1 text-sm text-text-secondary">
            We sent a 6-digit code to <span className="text-text-primary">{email}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className="w-10 h-11 text-center text-lg font-bold bg-background text-text-primary border border-border rounded-lg outline-none focus:border-red-primary transition-colors"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleOtpSubmit(otp.join(''))}
          disabled={otp.some((d) => !d)}
          className="w-full h-10 rounded-lg text-sm font-semibold text-white bg-red-primary hover:bg-red-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          Verify Code
        </button>

        {/* Resend */}
        <p className="text-center text-sm text-text-secondary mt-4">
          Didn&apos;t receive the code?{' '}
          <button
            onClick={handleResendCode}
            disabled={isSubmitting}
            className="text-red-primary hover:text-red-hover transition-colors disabled:opacity-70"
          >
            {isSubmitting ? 'Sending...' : 'Resend'}
          </button>
        </p>
      </div>
    );
  }

  // Success Step (fallback, usually redirect happens before this)
  return (
    <div className="w-full text-center">
      <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-6 h-6 text-success" />
      </div>
      <h1 className="text-xl font-semibold text-text-primary mb-2">Code Verified</h1>
      <p className="text-sm text-text-secondary mb-5">Redirecting to reset password...</p>
      <Loader2 className="w-5 h-5 animate-spin text-red-primary mx-auto" />
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-primary" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
