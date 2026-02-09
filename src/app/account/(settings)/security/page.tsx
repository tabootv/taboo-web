'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/shared/stores/auth-store';
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { useState } from 'react';
import { toast } from 'sonner';
import { updatePasswordAction } from '../../_actions';

export default function PasswordSettings() {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const requirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(newPassword) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
  ];

  const allRequirementsMet = requirements.every((r) => r.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }

    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('New passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePasswordAction({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      posthog.capture(AnalyticsEvent.PASSWORD_CHANGED);
      toast.success('Password updated successfully');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(
        apiErr.response?.data?.message ||
          'Failed to update password. Please check your current password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">Change Password</h2>

      {/* Social auth info box */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-400">Signed in with Google or Apple?</p>
            <p className="text-sm text-text-secondary mt-1">
              You can set a password for your account via email.
            </p>
            <Link
              href={`/forgot-password${user?.email ? `?email=${encodeURIComponent(user.email)}` : ''}`}
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Set password via email
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p>{error}</p>
              {error.toLowerCase().includes('current password') && (
                <p className="mt-1 text-text-secondary">
                  If you signed in with Google or Apple, use the email option above.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Requirements */}
          {newPassword.length > 0 && (
            <div className="mt-3 space-y-2">
              {requirements.map((req) => (
                <div
                  key={req.label}
                  className={`flex items-center gap-2 text-sm ${
                    req.met ? 'text-green-500' : 'text-text-secondary'
                  }`}
                >
                  {req.met ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-current" />
                  )}
                  {req.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword.length > 0 && (
            <div
              className={`mt-2 flex items-center gap-2 text-sm ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}
            >
              {passwordsMatch ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Passwords match
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Passwords do not match
                </>
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !allRequirementsMet || !passwordsMatch}
          className="btn-premium"
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}
