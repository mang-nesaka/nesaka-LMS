"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';


export async function updateProfilePhoto(base64Image: string) {
  const { id: userId } = await requireUser();

  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(base64Image) || base64Image.length > 1_400_000) {
    throw new Error('Format gambar tidak valid. Harap unggah file foto gambar.');
  }

  // Simpan foto profil beresolusi teroptimasi ke database
  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: base64Image },
  });

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/profile');
  return { success: true };
}

export async function deleteProfilePhoto() {
  const { id: userId } = await requireUser();

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  });

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/profile');
  return { success: true };
}
