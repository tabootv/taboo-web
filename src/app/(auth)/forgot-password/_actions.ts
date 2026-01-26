'use server';

import { authClient } from '@/api/client/auth.client';

export async function forgotPasswordAction(email: string) {
  return authClient.forgotPassword(email);
}
