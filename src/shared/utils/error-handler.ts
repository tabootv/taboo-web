/**
 * Error handling utilities for consistent error management across the application.
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Extracts a user-friendly error message from an error object.
 *
 * @param error - The error object (can be Error, AxiosError, or unknown)
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    if (typeof errorObj.error === 'string') {
      return errorObj.error;
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Checks if the application is online.
 *
 * @returns True if online, false if offline
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  return navigator.onLine;
}

/**
 * Handles API errors with user-friendly messages and offline detection.
 *
 * @param error - The error object
 * @param defaultMessage - Default message if error cannot be parsed
 * @returns User-friendly error message
 */
export function handleApiError(error: unknown, defaultMessage = 'An error occurred'): string {
  if (!isOnline()) {
    return 'You are currently offline. Please check your internet connection and try again.';
  }

  const message = getErrorMessage(error);
  return message || defaultMessage;
}
