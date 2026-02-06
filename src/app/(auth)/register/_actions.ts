'use server';

import { authClient } from '@/api/client/auth.client';
import { revalidatePath } from 'next/cache';

export async function registerAction(userData: {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email: string;
  password: string;
  password_confirmation: string;
  privacy_policy: boolean;
  terms_and_condition: boolean;
  referral_code?: string;
  device_token?: string;
}) {
  const result = await authClient.register(userData);

  revalidatePath('/profile');
  revalidatePath('/home');

  return result;
}
