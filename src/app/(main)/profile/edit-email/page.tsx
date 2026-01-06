'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { profileClient as profileApi } from '@/api/client';
import { useAuthStore } from '@/lib/stores';
import { toast } from 'sonner';

export default function EditEmailPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter a new email address');
      return;
    }

    if (!password) {
      setError('Please enter your current password to confirm');
      return;
    }

    if (email === user?.email) {
      setError('New email must be different from current email');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await profileApi.updateEmail(email, password);
      updateUser(updatedUser);
      toast.success('Email updated successfully! Please verify your new email address.');
      router.push('/profile');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Failed to update email. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/profile/settings"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Change Email Address</h1>
        <p className="text-text-secondary mt-1">
          Update your email address. You&apos;ll need to verify your new email.
        </p>
      </div>

      {/* Current Email */}
      <div className="bg-surface rounded-lg border border-border p-4 mb-6">
        <p className="text-sm text-text-secondary mb-1">Current email</p>
        <p className="text-text-primary font-medium">{user?.email || 'Not set'}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* New Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            New Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter new email address"
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary"
            />
          </div>
        </div>

        {/* Password Confirmation */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your current password"
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary"
            />
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            We need your password to confirm this change
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1 btn-premium">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Email'}
          </Button>
        </div>
      </form>

      {/* Info */}
      <div className="mt-8 p-4 bg-hover rounded-lg">
        <h3 className="text-sm font-medium text-text-primary mb-2">Important</h3>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
          <li>A verification email will be sent to your new address</li>
          <li>You&apos;ll need to verify the new email before it takes effect</li>
          <li>Your current email will remain active until verification</li>
        </ul>
      </div>
    </div>
  );
}
