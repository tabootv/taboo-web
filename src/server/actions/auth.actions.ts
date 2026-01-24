/**
 * Authentication Server Actions
 *
 * Next.js Server Actions for authentication mutations.
 * Provides server-side execution for better security and automatic cache revalidation.
 *
 * Usage:
 *   import { loginAction } from '@/server/actions/auth.actions';
 *   await loginAction({ email, password });
 */

'use server';

import { authClient } from '@/api/client/auth.client';
import { revalidatePath } from 'next/cache';

export async function loginAction(credentials: { email: string; password: string }) {
  const result = await authClient.login(credentials);

  // Revalidate user-dependent pages
  revalidatePath('/profile');
  revalidatePath('/home');

  return result;
}

export async function registerAction(userData: {
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  const result = await authClient.register(userData);

  // Revalidate user-dependent pages
  revalidatePath('/profile');
  revalidatePath('/home');

  return result;
}

export async function logoutAction() {
  await authClient.logout();

  // Revalidate all pages (user is now logged out)
  revalidatePath('/', 'layout');
}

export async function forgotPasswordAction(email: string) {
  return authClient.forgotPassword(email);
}

export async function resetPasswordAction(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  return authClient.resetPassword(payload);
}
