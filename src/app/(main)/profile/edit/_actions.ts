'use server';

import { profileClient } from '@/api/client/profile.client';
import type {
  UpdateContactData,
  UpdateEmailData,
  UpdatePasswordData,
  UpdateProfileData,
} from '@/api/client/profile.client';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(data: UpdateProfileData) {
  const result = await profileClient.updateProfile(data);

  revalidatePath('/profile');

  return result;
}

export async function updateContactAction(data: UpdateContactData) {
  const result = await profileClient.updateContact(data);

  revalidatePath('/profile');

  return result;
}

export async function updateEmailAction(data: UpdateEmailData) {
  const result = await profileClient.updateEmail(data);

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
