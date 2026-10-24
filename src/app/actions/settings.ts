"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { requireUser } from '@/lib/auth';


export async function updateProfile(formData: FormData) {
  const { id: userId } = await requireUser();

  const newPassword = String(formData.get('newPassword') ?? '');
  const updateData: { password?: string } = {};
  if (newPassword && newPassword.length >= 6) {
    updateData.password = await bcrypt.hash(newPassword, 12);
  } else if (newPassword && newPassword.length < 6) {
    return { error: 'Password minimal 6 karakter.' };
  }

  if (updateData.password) {
    await prisma.user.update({ where: { id: userId }, data: updateData });
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}
