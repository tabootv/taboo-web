'use client';

import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';

interface PasswordStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

const INPUT_CLASS =
  'w-full px-4 py-3.5 rounded-xl text-base text-white placeholder:text-text-secondary transition-all outline-none' as const;

const INPUT_STYLE = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
} as const;

const INPUT_FOCUS_STYLE =
  'focus:[background:rgba(255,255,255,0.08)] focus:[border-color:var(--red-primary)] focus:[box-shadow:0_0_0_2px_rgba(171,0,19,0.2)]';

export function PasswordStep({ onComplete, onSkip }: PasswordStepProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
  ];

  const allRequirementsMet = requirements.every((r) => r.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/set-initial-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 410) {
        // Password hint expired
        setIsExpired(true);
        return;
      }

      if (!response.ok) {
        setError(data.message || 'Failed to set password');
        return;
      }

      posthog.capture(AnalyticsEvent.PASSWORD_CHANGED, { source: 'onboarding' });
      toast.success('Password set successfully!');
      onComplete();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Session expired state
  if (isExpired) {
    return (
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
          Session expired
        </h1>
        <p className="text-text-secondary text-sm md:text-base mb-8">
          Your password setup session has expired. You can set a password anytime from{' '}
          <span className="text-white font-medium">Settings &gt; Security</span>, or use{' '}
          <span className="text-white font-medium">Forgot Password</span>.
        </p>
        <Button
          onClick={onSkip}
          className="w-full btn-premium h-12 rounded-xl text-base font-bold group"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
          Set your password
        </h1>
        <p className="text-text-secondary text-sm md:text-base">
          Create a password so you can sign in to your account anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Password <span className="text-red-primary">*</span>
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)' }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className={`${INPUT_CLASS} !pl-11 !pr-11 ${INPUT_FOCUS_STYLE}`}
              style={INPUT_STYLE}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Requirements */}
          {password.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {requirements.map((req) => (
                <div
                  key={req.label}
                  className={`flex items-center gap-2 text-xs ${
                    req.met ? 'text-green-500' : 'text-text-secondary'
                  }`}
                >
                  {req.met ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-current" />
                  )}
                  {req.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Confirm Password <span className="text-red-primary">*</span>
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)' }}
            />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className={`${INPUT_CLASS} !pl-11 !pr-11 ${INPUT_FOCUS_STYLE}`}
              style={INPUT_STYLE}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword.length > 0 && (
            <div
              className={`mt-2 flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}
            >
              {passwordsMatch ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Passwords match
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  Passwords do not match
                </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || !allRequirementsMet || !passwordsMatch}
            className="w-full btn-premium h-12 rounded-xl text-base font-bold group"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Set Password</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={onSkip} className="w-full text-text-secondary">
            Skip for now
          </Button>
        </div>
      </form>
    </div>
  );
}
