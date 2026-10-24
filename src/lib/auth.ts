import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/lib/auth-token';

export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get('auth_token')?.value;
  return token ? verifyAuthToken(token) : null;
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      studentClass: true,
      waliKelasOf: true,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sesi login tidak valid. Silakan login kembali.');
  return user;
}

export async function requireRole(...allowedRoles: string[]) {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.');
  }
  return user;
}
