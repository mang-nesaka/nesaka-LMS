"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { requireUser } from '@/lib/auth';


export async function updateProfile(formData: FormData) {
  const { id: userId } = await requireUser();

  const name = formData.get('name') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!name) return { error: 'Nama tidak boleh kosong.' };

  const updateData: { name: string; password?: string } = { name };
  if (newPassword && newPassword.length >= 6) {
    updateData.password = await bcrypt.hash(newPassword, 12);
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
