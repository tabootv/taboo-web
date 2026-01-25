'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { User } from '@/types';
import {
  updateProfileAction,
  updateContactAction,
  updateEmailAction,
  updatePasswordAction,
  deleteAccountAction,
} from './_actions';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/spinner';
import { toast } from 'sonner';
import Link from 'next/link';

type SettingsTab = 'profile' | 'email' | 'password' | 'danger';

export default function SettingsPage() {
  const { user, fetchUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(true);

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

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: UserIcon },
    { id: 'email' as SettingsTab, label: 'Email', icon: Mail },
    { id: 'password' as SettingsTab, label: 'Password', icon: Lock },
    { id: 'danger' as SettingsTab, label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/profile"
          className="p-2 rounded-sm hover:bg-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-secondary">Manage your account settings</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="bg-surface rounded-lg border border-border p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-primary/10 text-red-primary'
                    : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-surface rounded-lg border border-border p-6">
            {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={fetchUser} />}
            {activeTab === 'email' && <EmailSettings user={user} onUpdate={fetchUser} />}
            {activeTab === 'password' && <PasswordSettings />}
            {activeTab === 'danger' && <DangerZone />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({
  user,
  onUpdate,
}: {
  user: User | null;
  onUpdate: () => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfileAction({
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
      });

      if (phone !== user?.phone_number) {
        await updateContactAction({ phone });
      }

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
      <h2 className="text-lg font-semibold text-text-primary">Profile Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          <Phone className="w-4 h-4 inline mr-2" />
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="btn-premium">
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}

function EmailSettings({
  user,
  onUpdate,
}: {
  user: User | null;
  onUpdate: () => Promise<void>;
}) {
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error('Please enter your current password');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateEmailAction({ email, password });
      await onUpdate();
      setPassword('');
      toast.success('Email updated successfully');
    } catch {
      toast.error('Failed to update email. Please check your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">Email Settings</h2>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          New Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Current Password (required)
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your current password"
            className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="btn-premium">
        {isSubmitting ? 'Updating...' : 'Update Email'}
      </Button>
    </form>
  );
}

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
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
      toast.success('Password updated successfully');
    } catch {
      toast.error('Failed to update password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Change Password</h2>
        <button
          type="button"
          onClick={() => setShowPasswords(!showPasswords)}
          className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1"
        >
          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPasswords ? 'Hide' : 'Show'}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Current Password
        </label>
        <input
          type={showPasswords ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          New Password
        </label>
        <input
          type={showPasswords ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Confirm New Password
        </label>
        <input
          type={showPasswords ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:border-red-primary transition-colors"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="btn-premium">
        {isSubmitting ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
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
          Once you delete your account, there is no going back. All your data will be
          permanently removed. Please be certain.
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
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
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
