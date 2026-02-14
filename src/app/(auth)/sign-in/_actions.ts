'use server';

import { authClient } from '@/api/client/auth.client';
import { createActionLogger } from '@/shared/lib/logger';
import { revalidatePath } from 'next/cache';

const log = createActionLogger('loginAction');
const logoutLog = createActionLogger('logoutAction');

export async function loginAction(credentials: { email: string; password: string }) {
  try {
    const result = await authClient.login(credentials);

    revalidatePath('/profile');
    revalidatePath('/');

    return result;
  } catch (error) {
    log.error({ err: error }, 'Login failed');
    throw error;
  }
}

export async function logoutAction() {
  try {
    await authClient.logout();

    revalidatePath('/', 'layout');
  } catch (error) {
    logoutLog.error({ err: error }, 'Logout failed');
    throw error;
  }
}
