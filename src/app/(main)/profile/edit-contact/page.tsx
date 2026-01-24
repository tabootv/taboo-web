'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { profileClient as profileApi } from '@/api/client/profile.client';
import { useAuthStore } from '@/lib/stores';
import { toast } from 'sonner';

export default function EditContactPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);
    try {
      const updatedUser = await profileApi.updateContact({ phone: phoneNumber });
      updateUser(updatedUser);
      toast.success('Phone number updated successfully!');
      router.push('/profile');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Failed to update phone number');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/profile/edit"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Edit Profile
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Edit Phone Number</h1>
        <p className="text-text-secondary mt-1">
          Update your contact phone number
        </p>
      </div>

      {/* Current Phone */}
      {user?.phone_number && (
        <div className="bg-surface rounded-lg border border-border p-4 mb-6">
          <p className="text-sm text-text-secondary mb-1">Current phone number</p>
          <p className="text-text-primary font-medium">{user.phone_number}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary"
            />
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Include country code (e.g., +1 for US)
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
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
