'use server';

import { authClient } from '@/api/client/auth.client';

export async function resetPasswordAction(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  return authClient.resetPassword(payload);
}
