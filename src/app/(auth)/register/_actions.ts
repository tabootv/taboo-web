'use server';

import { authClient } from '@/api/client/auth.client';
import { createActionLogger } from '@/shared/lib/logger';
import { revalidatePath } from 'next/cache';

const log = createActionLogger('registerAction');

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
  try {
    const result = await authClient.register(userData);

    revalidatePath('/profile');
    revalidatePath('/');

    return result;
  } catch (error) {
    log.error({ err: error }, 'Registration failed');
    throw error;
  }
}
