'use server';

import { profileClient } from '@/api/client/profile.client';
import type { UpdatePasswordData, UpdateProfileData } from '@/api/client/profile.client';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(data: UpdateProfileData) {
  const result = await profileClient.updateProfile(data);

  revalidatePath('/profile');

  return result;
}

export async function updatePasswordAction(data: UpdatePasswordData) {
  const result = await profileClient.updatePassword(data);

  return result;
}

export async function deleteAccountAction() {
  await profileClient.deleteAccount();

  revalidatePath('/', 'layout');
}
