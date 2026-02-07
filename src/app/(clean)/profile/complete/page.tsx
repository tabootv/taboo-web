'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, User, Loader2, Check, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { profileClient as profileApi } from '@/api/client/profile.client';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useHandlerCheck } from '@/hooks/use-handler-check';
import { useCountries } from '@/hooks/use-countries';
import { getOnboardingRedirectPath } from '@/shared/lib/auth/profile-completion';
import { toast } from 'sonner';

type Step = 'photo' | 'details' | 'complete';

const GLASS_CARD = 'rounded-2xl backdrop-blur-xl' as const;

const GLASS_CARD_STYLE = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
} as const;

const INPUT_CLASS =
  'w-full px-4 py-3.5 rounded-xl text-base text-white placeholder:text-text-secondary transition-all outline-none' as const;

const INPUT_STYLE = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
} as const;

const INPUT_FOCUS_STYLE =
  'focus:[background:rgba(255,255,255,0.08)] focus:[border-color:var(--red-primary)] focus:[box-shadow:0_0_0_2px_rgba(171,0,19,0.2)]';

const LABEL_CLASS =
  'block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2' as const;

function getStepCircleClass(index: number, currentStepIndex: number) {
  const base =
    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all';
  if (index < currentStepIndex) return `${base} bg-red-primary text-white`;
  if (index === currentStepIndex)
    return `${base} bg-red-primary text-white ring-4 ring-red-primary/20`;
  return `${base} bg-surface-hover text-text-secondary`;
}

function getStepCircleStyle(index: number, currentStepIndex: number): React.CSSProperties {
  if (index === currentStepIndex) return { boxShadow: '0 0 20px rgba(171,0,19,0.5)' };
  if (index < currentStepIndex) return { boxShadow: '0 0 15px rgba(171,0,19,0.3)' };
  return { border: '1px solid rgba(255,255,255,0.1)' };
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, updateUser, fetchUser, isSubscribed } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { countries, isLoading: countriesLoading } = useCountries();

  const [currentStep, setCurrentStep] = useState<Step>('photo');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.dp || null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    handler: user?.handler || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    gender: user?.gender || '',
    country_id: user?.country_id?.toString() || '',
    phone_number: user?.phone_number || '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const {
    isAvailable: handlerAvailable,
    isChecking: handlerChecking,
    validationError: handlerValidationError,
  } = useHandlerCheck(formData.handler, { currentHandler: user?.handler });

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

  const validateDetailsForm = (): boolean => {
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

  const handleSaveDetails = async () => {
    if (!validateDetailsForm()) return;

    setIsLoading(true);
    try {
      await profileApi.updateProfile({
        display_name: formData.display_name,
        handler: formData.handler,
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender,
        country_id: parseInt(formData.country_id, 10),
        ...(formData.phone_number && { phone_number: formData.phone_number }),
      });
      await fetchUser();
      setCurrentStep('complete');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    const redirectPath = getOnboardingRedirectPath(useAuthStore.getState().user, isSubscribed);
    router.push(redirectPath || '/home');
  };

  const steps = [
    { id: 'photo', label: 'Photo' },
    { id: 'details', label: 'Details' },
    { id: 'complete', label: 'Done' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex flex-col relative overflow-hidden min-h-[calc(100vh-3.5rem)]">
      {/* Hero glow */}
      <div
        className="absolute inset-x-0 top-0 h-[600px] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(171,0,19,0.15) 0%, transparent 60%)',
        }}
      />

      {/* Progress Bar */}
      <div className="relative z-10 py-8">
        <div className="max-w-xl mx-auto px-4">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center"
                style={{ flex: index < steps.length - 1 ? 1 : undefined }}
              >
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={getStepCircleClass(index, currentStepIndex)}
                    style={getStepCircleStyle(index, currentStepIndex)}
                  >
                    {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold ${
                      index <= currentStepIndex ? 'text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div
                    className="flex-1 mx-3 self-start mt-5"
                    style={{
                      height: 1,
                      background:
                        index < currentStepIndex ? 'var(--red-primary)' : 'rgba(255,255,255,0.1)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-start md:items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-lg">
          <div className={GLASS_CARD} style={GLASS_CARD_STYLE}>
            <div className="p-6 md:p-10 animate-[fadeInScale_0.4s_cubic-bezier(0.4,0,0.2,1)]">
              {/* Step 1: Photo */}
              {currentStep === 'photo' && (
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
                    Add a profile photo
                  </h1>
                  <p className="text-text-secondary text-sm md:text-base mb-10">
                    Help others recognize you with a profile picture
                  </p>

                  {/* Photo Upload */}
                  <div className="relative w-40 h-40 mx-auto mb-10">
                    <div
                      className="w-full h-full rounded-full overflow-hidden border-4 border-white/[0.08] bg-surface cursor-pointer group transition-shadow hover:shadow-[0_0_30px_rgba(171,0,19,0.3)]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt="Profile"
                          width={160}
                          height={160}
                          className="w-full h-full object-cover rounded-full"
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
                      className="w-full btn-premium h-12 rounded-xl text-base font-bold group"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>{profileImageFile ? 'Continue' : 'Choose Photo'}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSkipPhoto}
                      className="w-full text-text-secondary"
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 'details' && (
                <div>
                  <div className="text-center mb-10">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
                      Complete your profile
                    </h1>
                    <p className="text-text-secondary text-sm md:text-base">
                      Tell us a bit more about yourself to get started.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveDetails();
                    }}
                    className="space-y-6"
                  >
                    {/* Display Name */}
                    <div>
                      <label className={LABEL_CLASS}>
                        Display Name <span className="text-red-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => {
                          setFormData({ ...formData, display_name: e.target.value });
                          if (formErrors.display_name)
                            setFormErrors({ ...formErrors, display_name: '' });
                        }}
                        placeholder="e.g. Alex Rivera"
                        className={`${INPUT_CLASS} ${INPUT_FOCUS_STYLE}`}
                        style={INPUT_STYLE}
                      />
                      {formErrors.display_name && (
                        <p className="mt-1.5 text-xs text-red-primary">{formErrors.display_name}</p>
                      )}
                    </div>

                    {/* Handler */}
                    <div>
                      <label className={LABEL_CLASS}>
                        Handler <span className="text-red-primary">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-base">
                          @
                        </span>
                        <input
                          type="text"
                          value={formData.handler}
                          onChange={(e) => {
                            setFormData({ ...formData, handler: e.target.value });
                            if (formErrors.handler) setFormErrors({ ...formErrors, handler: '' });
                          }}
                          placeholder="username"
                          className={`${INPUT_CLASS} !pl-10 !pr-10 ${INPUT_FOCUS_STYLE}`}
                          style={INPUT_STYLE}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {handlerChecking && (
                            <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
                          )}
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
                          <p className="mt-1.5 text-[11px] font-medium text-green-500/90">
                            This handler is available
                          </p>
                        )}
                      {(handlerValidationError || formErrors.handler) && (
                        <p className="mt-1.5 text-xs text-red-primary">
                          {handlerValidationError || formErrors.handler}
                        </p>
                      )}
                      {!handlerChecking &&
                        handlerAvailable === false &&
                        !handlerValidationError && (
                          <p className="mt-1.5 text-xs text-red-primary">
                            This handler is already taken
                          </p>
                        )}
                    </div>

                    {/* First & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={LABEL_CLASS}>
                          First Name <span className="text-red-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => {
                            setFormData({ ...formData, first_name: e.target.value });
                            if (formErrors.first_name)
                              setFormErrors({ ...formErrors, first_name: '' });
                          }}
                          placeholder="First name"
                          className={`${INPUT_CLASS} ${INPUT_FOCUS_STYLE}`}
                          style={INPUT_STYLE}
                        />
                        {formErrors.first_name && (
                          <p className="mt-1.5 text-xs text-red-primary">{formErrors.first_name}</p>
                        )}
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>
                          Last Name <span className="text-red-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => {
                            setFormData({ ...formData, last_name: e.target.value });
                            if (formErrors.last_name)
                              setFormErrors({ ...formErrors, last_name: '' });
                          }}
                          placeholder="Last name"
                          className={`${INPUT_CLASS} ${INPUT_FOCUS_STYLE}`}
                          style={INPUT_STYLE}
                        />
                        {formErrors.last_name && (
                          <p className="mt-1.5 text-xs text-red-primary">{formErrors.last_name}</p>
                        )}
                      </div>
                    </div>

                    {/* Gender & Country */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={LABEL_CLASS}>
                          Gender <span className="text-red-primary">*</span>
                        </label>
                        <div className="flex gap-6 items-center pt-1">
                          <label className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              type="radio"
                              name="gender"
                              value="male"
                              checked={formData.gender === 'male'}
                              onChange={(e) => {
                                setFormData({ ...formData, gender: e.target.value });
                                if (formErrors.gender) setFormErrors({ ...formErrors, gender: '' });
                              }}
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
                              onChange={(e) => {
                                setFormData({ ...formData, gender: e.target.value });
                                if (formErrors.gender) setFormErrors({ ...formErrors, gender: '' });
                              }}
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
                        <label className={LABEL_CLASS}>
                          Country <span className="text-red-primary">*</span>
                        </label>
                        <select
                          value={formData.country_id}
                          onChange={(e) => {
                            setFormData({ ...formData, country_id: e.target.value });
                            if (formErrors.country_id)
                              setFormErrors({ ...formErrors, country_id: '' });
                          }}
                          disabled={countriesLoading}
                          className={`${INPUT_CLASS} cursor-pointer ${INPUT_FOCUS_STYLE}`}
                          style={INPUT_STYLE}
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
                      <label className={LABEL_CLASS}>
                        Phone Number{' '}
                        <span className="font-normal normal-case text-text-muted ml-1">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className={`${INPUT_CLASS} ${INPUT_FOCUS_STYLE}`}
                        style={INPUT_STYLE}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || handlerChecking}
                      className="w-full btn-premium h-12 rounded-xl text-base font-bold group mt-4 active:scale-[0.98] transition-all"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </>
                      )}
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

                  <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
                    You&apos;re all set!
                  </h1>
                  <p className="text-text-secondary mb-10">
                    Your profile is complete.{' '}
                    {isSubscribed ? 'Start exploring TabooTV!' : 'Choose a plan to start watching.'}
                  </p>

                  {/* Profile Preview */}
                  <div
                    className="rounded-xl p-6 mb-8"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center flex-shrink-0">
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
                            {(formData.display_name || formData.first_name || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-text-primary">
                          {formData.display_name ||
                            `${formData.first_name} ${formData.last_name}`.trim() ||
                            'User'}
                        </p>
                        {formData.handler && (
                          <p className="text-sm text-text-secondary">@{formData.handler}</p>
                        )}
                        <p className="text-sm text-text-secondary">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleComplete}
                    className="w-full btn-premium h-12 rounded-xl text-base font-bold group active:scale-[0.98] transition-all"
                  >
                    <span>{isSubscribed ? 'Start Watching' : 'Choose a Plan'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Step counter */}
      <div className="relative z-10 py-6 px-4 text-center">
        <p className="text-text-muted text-xs font-medium uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
