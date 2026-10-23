"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) return { error: 'Tidak terautentikasi.' };

  const name = formData.get('name') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!name) return { error: 'Nama tidak boleh kosong.' };

  const updateData: any = { name };
  if (newPassword && newPassword.length >= 6) {
    updateData.password = newPassword; // Di production, password harus di-hash!
  } else if (newPassword && newPassword.length < 6) {
    return { error: 'Password minimal 6 karakter.' };
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  revalidatePath('/dashboard/settings');
  return { success: true };
}
