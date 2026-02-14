'use server';

import { authClient } from '@/api/client/auth.client';
import { createActionLogger } from '@/shared/lib/logger';

const log = createActionLogger('forgotPasswordAction');

export async function forgotPasswordAction(email: string) {
  try {
    return await authClient.forgotPassword(email);
  } catch (error) {
    log.error({ err: error }, 'Forgot password request failed');
    throw error;
  }
}
