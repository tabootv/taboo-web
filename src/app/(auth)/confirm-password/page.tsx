'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { apiClient } from '@/api/client/base-client';
import { toast } from 'sonner';

export default function ConfirmPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/confirm-password', { password });
      toast.success('Password confirmed');
      // Redirect back to the intended destination or profile
      router.back();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Password confirmation failed');
    } finally {
      setIsLoading(false);
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

        <div className="bg-surface rounded-2xl border border-border p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Confirm Password</h1>
            <p className="text-text-secondary mt-2">
              This is a secure area. Please confirm your password before continuing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full btn-premium">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Confirming...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
