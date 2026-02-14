'use server';

import { profileClient } from '@/api/client/profile.client';
import type { UpdatePasswordData, UpdateProfileData } from '@/api/client/profile.client';
import { decodeCookieToken, TOKEN_KEY } from '@/shared/lib/auth/cookie-config';
import { createActionLogger } from '@/shared/lib/logger';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const profileLog = createActionLogger('updateProfileAction');
const passwordLog = createActionLogger('updatePasswordAction');

export async function updateProfileAction(data: UpdateProfileData) {
  try {
    const cookieStore = await cookies();
    const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

    const result = await profileClient.updateProfile(data, serverToken);

    revalidatePath('/account');

    return result;
  } catch (error) {
    profileLog.error({ err: error }, 'Profile update failed');
    throw error;
  }
}

export async function updatePasswordAction(data: UpdatePasswordData) {
  try {
    const cookieStore = await cookies();
    const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

    const result = await profileClient.updatePassword(data, serverToken);

    return result;
  } catch (error) {
    passwordLog.error({ err: error }, 'Password update failed');
    throw error;
  }
}
