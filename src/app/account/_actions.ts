'use server';

import { profileClient } from '@/api/client/profile.client';
import type { UpdatePasswordData, UpdateProfileData } from '@/api/client/profile.client';
import { decodeCookieToken, TOKEN_KEY } from '@/shared/lib/auth/cookie-config';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(data: UpdateProfileData) {
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  const result = await profileClient.updateProfile(data, serverToken);

  revalidatePath('/account');

  return result;
}

export async function updatePasswordAction(data: UpdatePasswordData) {
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  const result = await profileClient.updatePassword(data, serverToken);

  return result;
}
