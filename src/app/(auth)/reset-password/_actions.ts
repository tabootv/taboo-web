'use server';

import { authClient } from '@/api/client/auth.client';
import { createActionLogger } from '@/shared/lib/logger';

const log = createActionLogger('resetPasswordAction');

export async function resetPasswordAction(payload: {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}) {
  try {
    return await authClient.resetPassword(payload);
  } catch (error) {
    log.error({ err: error }, 'Password reset failed');
    throw error;
  }
}
