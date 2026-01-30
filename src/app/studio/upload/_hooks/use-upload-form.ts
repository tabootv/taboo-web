'use client';

import { useCallback, useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UploadConfig, UploadFormData, StepId } from '../_config/types';
import { videoUploadSchema } from '../_config/video.config';
import { shortUploadSchema } from '../_config/short.config';

/**
 * Default form values
 */
const defaultFormValues: UploadFormData = {
  title: '',
  description: '',
  tags: [],
  location: '',
  countryId: null,
  latitude: null,
  longitude: null,
  isAdultContent: false,
  publishMode: 'none',
  scheduledAt: null,
  thumbnailPath: null,
};

/**
 * Field mappings per step - defines which form fields are validated at each step
 */
const STEP_FIELDS: Record<StepId, (keyof UploadFormData)[]> = {
  'video-file': [], // File validation handled separately
  details: ['title', 'description'],
  thumbnail: ['thumbnailPath'],
  location: ['location', 'countryId', 'latitude', 'longitude'],
  tags: ['tags'],
  'content-rating': ['isAdultContent'],
  publishing: ['publishMode', 'scheduledAt'],
};

export interface UseUploadFormOptions {
  config: UploadConfig;
}

export interface UseUploadFormReturn {
  form: UseFormReturn<UploadFormData>;
  validateStep: (stepId: StepId) => Promise<boolean>;
  getStepFields: (stepId: StepId) => (keyof UploadFormData)[];
  isStepValid: (stepId: StepId) => boolean;
  resetForm: () => void;
}

/**
 * Hook for managing upload form state and validation
 * Uses react-hook-form with Zod schema validation
 */
export function useUploadForm({ config }: UseUploadFormOptions): UseUploadFormReturn {
  // Select the correct schema based on type
  const schema = config.type === 'video' ? videoUploadSchema : shortUploadSchema;

  const form = useForm<UploadFormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  const { trigger, getFieldState, formState } = form;

  /**
   * Get fields that should be validated for a specific step
   */
  const getStepFields = useCallback((stepId: StepId): (keyof UploadFormData)[] => {
    return STEP_FIELDS[stepId] || [];
  }, []);

  /**
   * Validate fields for a specific step
   */
  const validateStep = useCallback(
    async (stepId: StepId): Promise<boolean> => {
      const fields = getStepFields(stepId);

      if (fields.length === 0) {
        return true;
      }

      const result = await trigger(fields);
      return result;
    },
    [trigger, getStepFields]
  );

  /**
   * Check if a step's fields are currently valid (without triggering validation)
   */
  const isStepValid = useCallback(
    (stepId: StepId): boolean => {
      const fields = getStepFields(stepId);

      if (fields.length === 0) {
        return true;
      }

      return fields.every((field) => {
        const fieldState = getFieldState(field, formState);
        return !fieldState.invalid;
      });
    },
    [getStepFields, getFieldState, formState]
  );

  /**
   * Reset form to default values
   */
  const resetForm = useCallback(() => {
    form.reset(defaultFormValues);
  }, [form]);

  return useMemo(
    () => ({
      form,
      validateStep,
      getStepFields,
      isStepValid,
      resetForm,
    }),
    [form, validateStep, getStepFields, isStepValid, resetForm]
  );
}
