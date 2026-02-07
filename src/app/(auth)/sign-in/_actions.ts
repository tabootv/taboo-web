'use server';

import { authClient } from '@/api/client/auth.client';
import { revalidatePath } from 'next/cache';

export async function loginAction(credentials: { email: string; password: string }) {
  const result = await authClient.login(credentials);

  revalidatePath('/profile');
  revalidatePath('/');

  return result;
}

export async function logoutAction() {
  await authClient.logout();

  revalidatePath('/', 'layout');
}
