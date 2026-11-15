"use server";

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { AUTH_SESSION_MAX_AGE_SECONDS, createAuthToken } from '@/lib/auth-token';

export async function login(formData: FormData) {
  const rawEmail = formData.get('email');
  const rawPassword = formData.get('password');

  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  const password = typeof rawPassword === 'string' ? rawPassword.trim() : '';

  if (!email || !password) {
    return { error: "Email dan kata sandi harus diisi." };
  }

  // Find user (case-insensitive email)
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  });

  if (!user) {
    return { error: "Email atau kata sandi salah." };
  }

  const isPasswordHash = user.password.startsWith('$2');
  let passwordMatches = false;

  if (isPasswordHash) {
    passwordMatches = await bcrypt.compare(password, user.password);

    // Fallback: If password entered has leading zeros (e.g. NISN 0087485164) but DB dropped them (87485164)
    if (!passwordMatches && /^0+\d+$/.test(password)) {
      const stripped = password.replace(/^0+/, '');
      passwordMatches = await bcrypt.compare(stripped, user.password);
    } else if (!passwordMatches && /^\d+$/.test(password)) {
      passwordMatches =
        (await bcrypt.compare(`00${password}`, user.password)) ||
        (await bcrypt.compare(`0${password}`, user.password));
    }
  } else {
    passwordMatches =
      user.password === password ||
      user.password.replace(/^0+/, '') === password.replace(/^0+/, '');
  }

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
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
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
