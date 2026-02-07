'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { handlerClient } from '@/api/client/handler.client';

const HANDLER_MIN_LENGTH = 4;
const HANDLER_MAX_LENGTH = 20;
const HANDLER_REGEX = /^\w+$/;
const DEBOUNCE_MS = 500;

interface UseHandlerCheckOptions {
  currentHandler?: string | undefined;
}

export function useHandlerCheck(handler: string, options?: UseHandlerCheckOptions) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = useCallback(
    (value: string): string | null => {
      if (!value) return null; // Empty is not an error, just nothing to check
      if (value.length < HANDLER_MIN_LENGTH) {
        return `Must be at least ${HANDLER_MIN_LENGTH} characters`;
      }
      if (value.length > HANDLER_MAX_LENGTH) {
        return `Must be at most ${HANDLER_MAX_LENGTH} characters`;
      }
      if (!HANDLER_REGEX.test(value)) {
        return 'Only letters, numbers, and underscores allowed';
      }
      // Skip server check if matches current user's handler
      if (options?.currentHandler && value === options.currentHandler) {
        return null;
      }
      return null;
    },
    [options?.currentHandler]
  );

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Reset state
    setIsAvailable(null);
    setError(null);

    // Validate client-side first
    const clientError = validate(handler);
    setValidationError(clientError);

    if (!handler || clientError) {
      setIsChecking(false);
      return;
    }

    // Skip server check if matches current handler
    if (options?.currentHandler && handler === options.currentHandler) {
      setIsAvailable(true);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);

    timerRef.current = setTimeout(async () => {
      try {
        const result = await handlerClient.checkAvailability(handler);
        setIsAvailable(result.available);
        setError(null);
      } catch {
        setError('Failed to check availability');
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [handler, validate, options?.currentHandler]);

  return { isAvailable, isChecking, error, validationError };
}
