"use server";

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function updateProfilePhoto(base64Image: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    throw new Error('Sesi login telah habis. Silakan masuk kembali.');
  }

  if (!base64Image || !base64Image.startsWith('data:image/')) {
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
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    throw new Error('Sesi login telah habis. Silakan masuk kembali.');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  });

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/profile');
  return { success: true };
}
