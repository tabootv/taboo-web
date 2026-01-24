'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, User, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { profileClient as profileApi } from '@/api/client/profile.client';
import { useAuthStore } from '@/lib/stores';
import { toast } from 'sonner';

type Step = 'photo' | 'details' | 'complete';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>('photo');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.dp || null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    gender: user?.gender || '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkipPhoto = () => {
    setCurrentStep('details');
  };

  const handleSavePhoto = async () => {
    if (!profileImageFile) {
      setCurrentStep('details');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await profileApi.updateDisplayPicture(profileImageFile);
      updateUser(updatedUser);
      setCurrentStep('details');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await profileApi.updateProfile(formData);
      updateUser(updatedUser);
      setCurrentStep('complete');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    router.push('/home');
  };

  const steps = [
    { id: 'photo', label: 'Photo' },
    { id: 'details', label: 'Details' },
    { id: 'complete', label: 'Done' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <button
            onClick={() => router.push('/home')}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStepIndex
                      ? 'bg-red-primary text-white'
                      : 'bg-hover text-text-secondary'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-2 text-sm hidden sm:block ${
                    index <= currentStepIndex ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 mx-4 text-text-secondary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Step 1: Photo */}
          {currentStep === 'photo' && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-text-primary mb-2">Add a profile photo</h1>
              <p className="text-text-secondary mb-8">
                Help others recognize you with a profile picture
              </p>

              {/* Photo Upload */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div
                  className="w-full h-full rounded-full overflow-hidden border-4 border-border bg-surface cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-primary to-red-dark">
                      <User className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-red-primary flex items-center justify-center text-white shadow-lg hover:bg-red-hover transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSavePhoto}
                  disabled={isLoading}
                  className="w-full btn-premium"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    profileImageFile ? 'Continue' : 'Choose Photo'
                  )}
                </Button>
                <Button variant="ghost" onClick={handleSkipPhoto} className="w-full">
                  Skip for now
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 'details' && (
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2 text-center">
                Complete your profile
              </h1>
              <p className="text-text-secondary mb-8 text-center">
                Tell us a bit more about yourself
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDetails();
                }}
                className="space-y-6"
              >
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                    placeholder="How should we call you?"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary"
                  />
                </div>

                {/* First & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      placeholder="First name"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      placeholder="Last name"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Gender (Optional)
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full btn-premium">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                </Button>
              </form>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 'complete' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-text-primary mb-2">
                You&apos;re all set!
              </h1>
              <p className="text-text-secondary mb-8">
                Your profile is complete. Start exploring TabooTV!
              </p>

              {/* Profile Preview */}
              <div className="bg-surface rounded-lg border border-border p-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                    {profileImage || user?.dp ? (
                      <Image
                        src={profileImage || user?.dp || ''}
                        alt="Profile"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {(formData.display_name || formData.first_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-text-primary">
                      {formData.display_name || `${formData.first_name} ${formData.last_name}`.trim() || 'User'}
                    </p>
                    <p className="text-sm text-text-secondary">{user?.email}</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleComplete} className="w-full btn-premium">
                Start Watching
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
