'use client';

import { useUpdateAvatar } from '@/api/mutations';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCountries } from '@/hooks/use-countries';
import { useHandlerCheck } from '@/hooks/use-handler-check';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { User } from '@/types';
import { Camera, Check, Loader2, Mail, Phone, X } from 'lucide-react';
import posthog from 'posthog-js';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateProfileAction } from '../_actions';

export default function ProfileSettings() {
  const { user, fetchUser } = useAuthStore();

  return <ProfileSettingsForm user={user} onUpdate={fetchUser} />;
}

function ProfileSettingsForm({
  user,
  onUpdate,
}: {
  user: User | null;
  onUpdate: () => Promise<void>;
}) {
  const { countries, isLoading: countriesLoading } = useCountries();
  const updateAvatar = useUpdateAvatar();
  const [isUploadingDp, setIsUploadingDp] = useState(false);

  const handleUploadAvatar = (file?: File) => {
    if (!file) return;
    setIsUploadingDp(true);
    updateAvatar.mutate(file, {
      onSuccess: () => {
        onUpdate();
        toast.success('Profile picture updated');
      },
      onError: () => {
        toast.error('Failed to update profile picture');
      },
      onSettled: () => {
        setIsUploadingDp(false);
      },
    });
  };

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    display_name: user?.display_name || '',
    handler: user?.handler || '',
    gender: user?.gender || '',
    country_id: user?.country_id?.toString() || '',
    phone_number: user?.phone_number || '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    isAvailable: handlerAvailable,
    isChecking: handlerChecking,
    validationError: handlerValidationError,
  } = useHandlerCheck(formData.handler, { currentHandler: user?.handler });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.display_name.trim()) errors.display_name = 'Display name is required';
    if (!formData.handler.trim()) errors.handler = 'Handler is required';
    else if (handlerValidationError) errors.handler = handlerValidationError;
    else if (handlerAvailable === false) errors.handler = 'This handler is already taken';
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.gender) errors.gender = 'Please select your gender';
    if (!formData.country_id) errors.country_id = 'Please select your country';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        handler: formData.handler,
        gender: formData.gender,
        country_id: parseInt(formData.country_id, 10),
        ...(formData.phone_number && { phone_number: formData.phone_number }),
      };
      await updateProfileAction(payload);
      await onUpdate();
      const userRecord = user as unknown as Record<string, unknown>;
      const changedFields = Object.keys(payload).filter(
        (key) => payload[key as keyof typeof payload] !== userRecord?.[key]
      );
      posthog.capture(AnalyticsEvent.PROFILE_UPDATED, { fields_changed: changedFields });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar
            src={user?.dp || null}
            alt={user?.display_name || 'User'}
            fallback={user?.display_name || 'U'}
            className="w-20 h-20 text-2xl"
          />
          <label className="absolute bottom-0 right-0 p-1.5 bg-surface/80 rounded-full text-text-primary hover:bg-hover transition-colors cursor-pointer border border-border">
            {isUploadingDp ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUploadAvatar(e.target.files?.[0] || undefined)}
              disabled={isUploadingDp}
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">
            {user?.display_name || 'Profile Photo'}
          </p>
          <p className="text-xs text-text-secondary">Click the camera icon to update</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-text-primary">Profile Information</h2>

      {/* Read-only email display */}
      {user?.email && (
        <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-md border border-border">
          <Mail className="w-4 h-4 text-text-secondary" />
          <div>
            <p className="text-xs text-text-secondary">Email</p>
            <p className="text-sm text-text-primary">{user.email}</p>
          </div>
        </div>
      )}

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Display Name <span className="text-red-primary">*</span>
        </label>
        <input
          type="text"
          value={formData.display_name}
          onChange={(e) => updateField('display_name', e.target.value)}
          placeholder="e.g. Alex Rivera"
          className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
        />
        {formErrors.display_name && (
          <p className="mt-1.5 text-xs text-red-primary">{formErrors.display_name}</p>
        )}
      </div>

      {/* Handler */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Handler <span className="text-red-primary">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">@</span>
          <input
            type="text"
            value={formData.handler}
            onChange={(e) => updateField('handler', e.target.value)}
            placeholder="username"
            className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {handlerChecking && <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />}
            {!handlerChecking &&
              handlerAvailable === true &&
              formData.handler &&
              !handlerValidationError && <Check className="w-5 h-5 text-green-500" />}
            {!handlerChecking && handlerAvailable === false && (
              <X className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
        {!handlerChecking &&
          handlerAvailable === true &&
          formData.handler &&
          !handlerValidationError && (
            <p className="mt-1.5 text-xs text-green-500">This handler is available</p>
          )}
        {(handlerValidationError || formErrors.handler) && (
          <p className="mt-1.5 text-xs text-red-primary">
            {handlerValidationError || formErrors.handler}
          </p>
        )}
        {!handlerChecking &&
          handlerAvailable === false &&
          !handlerValidationError &&
          !formErrors.handler && (
            <p className="mt-1.5 text-xs text-red-primary">This handler is already taken</p>
          )}
      </div>

      {/* First Name / Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            First Name <span className="text-red-primary">*</span>
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => updateField('first_name', e.target.value)}
            placeholder="First name"
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
          />
          {formErrors.first_name && (
            <p className="mt-1.5 text-xs text-red-primary">{formErrors.first_name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Last Name <span className="text-red-primary">*</span>
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => updateField('last_name', e.target.value)}
            placeholder="Last name"
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
          />
          {formErrors.last_name && (
            <p className="mt-1.5 text-xs text-red-primary">{formErrors.last_name}</p>
          )}
        </div>
      </div>

      {/* Gender & Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Gender <span className="text-red-primary">*</span>
          </label>
          <div className="flex gap-6 items-center pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={(e) => updateField('gender', e.target.value)}
                className="w-5 h-5 accent-red-primary"
              />
              <span className="text-sm text-text-primary group-hover:text-white transition-colors">
                Male
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={(e) => updateField('gender', e.target.value)}
                className="w-5 h-5 accent-red-primary"
              />
              <span className="text-sm text-text-primary group-hover:text-white transition-colors">
                Female
              </span>
            </label>
          </div>
          {formErrors.gender && (
            <p className="mt-1.5 text-xs text-red-primary">{formErrors.gender}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Country <span className="text-red-primary">*</span>
          </label>
          <select
            value={formData.country_id}
            onChange={(e) => updateField('country_id', e.target.value)}
            disabled={countriesLoading}
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors cursor-pointer"
          >
            <option value="">
              {countriesLoading ? 'Loading countries...' : 'Select your country'}
            </option>
            {countries.map((country) => (
              <option key={country.id} value={country.id.toString()}>
                {country.emoji} {country.name}
              </option>
            ))}
          </select>
          {formErrors.country_id && (
            <p className="mt-1.5 text-xs text-red-primary">{formErrors.country_id}</p>
          )}
        </div>
      </div>

      {/* Phone Number (Optional) */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          <Phone className="w-4 h-4 inline mr-2" />
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phone_number}
          onChange={(e) => updateField('phone_number', e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
        />
      </div>

      <Button type="submit" disabled={isSubmitting || handlerChecking} className="btn-premium">
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
