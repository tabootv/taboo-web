'use client';

import { useUpdateAvatar } from '@/api/mutations';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/spinner';
import { useCountries } from '@/hooks/use-countries';
import { useHandlerCheck } from '@/hooks/use-handler-check';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { User } from '@/types';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ProfileSidebar, type ProfileTab } from '../_components/profile-sidebar';
import { deleteAccountAction, updatePasswordAction, updateProfileAction } from './_actions';

export default function SettingsPage() {
  const { user, fetchUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['profile', 'password', 'danger', 'subscription'].includes(tab)) {
      setActiveTab(tab as ProfileTab);
    }
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        await fetchUser();
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [fetchUser]);

  if (isLoading) {
    return <LoadingScreen message="Loading settings..." />;
  }

  return (
    <div className="account-container py-8">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-[calc(30%-2rem)] shrink-0">
          <ProfileSidebar activeTab={activeTab} />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-text-primary mb-6">Account</h1>
          {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={fetchUser} />}
          {activeTab === 'password' && <PasswordSettings user={user} />}
          {activeTab === 'danger' && <DangerZone />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ user, onUpdate }: { user: User | null; onUpdate: () => Promise<void> }) {
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
      await updateProfileAction({
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        handler: formData.handler,
        gender: formData.gender,
        country_id: parseInt(formData.country_id, 10),
        ...(formData.phone_number && { phone_number: formData.phone_number }),
      });
      await onUpdate();
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
          Phone Number <span className="font-normal text-text-muted ml-1">(Optional)</span>
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

function PasswordSettings({ user }: { user: User | null }) {
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

function DangerZone() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      await deleteAccountAction();
      await logout();
      toast.success('Account deleted successfully');
      router.push('/');
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-red-primary">Danger Zone</h2>

      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
        <h3 className="font-medium text-text-primary mb-2">Delete Account</h3>
        <p className="text-sm text-text-secondary mb-4">
          Once you delete your account, there is no going back. All your data will be permanently
          removed. Please be certain.
        </p>

        {!showConfirm ? (
          <Button
            variant="outline"
            onClick={() => setShowConfirm(true)}
            className="border-red-500 text-red-500 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-primary font-medium">
              Are you absolutely sure? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
