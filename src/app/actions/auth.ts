"use server";

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { createAuthToken } from '@/lib/auth-token';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: "Email dan kata sandi harus diisi." };
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Email atau kata sandi salah." };
  }

  const isPasswordHash = user.password.startsWith('$2');
  const passwordMatches = isPasswordHash
    ? await bcrypt.compare(password, user.password)
    : user.password === password;

  if (!passwordMatches) {
    return { error: "Email atau kata sandi salah." };
  }

  if (!isPasswordHash) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(password, 12) },
    });
  }

  // Set auth cookie
  const cookieStore = await cookies();
  cookieStore.set('auth_token', createAuthToken(user.id, Math.floor(Date.now() / 1000)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });

  // Redirect to dashboard on success
  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}
