"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function createExtracurricular(formData: FormData) {
  await requireRole('WAKA_KESISWAAN', 'ADMIN');

  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const advisorId = String(formData.get('advisorId') ?? '');
  if (!name || name.length > 100) throw new Error('Nama ekstrakurikuler wajib diisi (maksimal 100 karakter).');

  const advisor = await prisma.user.findUnique({ where: { id: advisorId }, select: { role: true } });
  if (!advisor || !['TEACHER', 'WALI_KELAS'].includes(advisor.role)) {
    throw new Error('Pembina harus dipilih dari akun guru atau wali kelas.');
  }

  await prisma.extracurricular.create({
    data: { name, description: description || null, advisorId },
  });
  revalidatePath('/dashboard/kesiswaan');
}

export async function addExtracurricularMember(formData: FormData) {
  await requireRole('WAKA_KESISWAAN', 'ADMIN');

  const extracurricularId = String(formData.get('extracurricularId') ?? '');
  const studentId = String(formData.get('studentId') ?? '');
  const student = await prisma.user.findFirst({
    where: {
      id: studentId,
      role: 'STUDENT',
      OR: [{ classroom: { level: '10' } }, { studentClass: { startsWith: 'X' } }],
    },
    select: { id: true },
  });
  if (!student) throw new Error('Pilih siswa kelas 10.');

  await prisma.extracurricularMember.create({ data: { extracurricularId, studentId } });
  revalidatePath('/dashboard/kesiswaan');
}

export async function createStudentAnnouncement(formData: FormData) {
  const author = await requireRole('WAKA_KESISWAAN', 'ADMIN');
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  if (!title || title.length > 140 || !body || body.length > 5000) {
    throw new Error('Judul dan isi pengumuman wajib diisi. Maksimal 140 karakter untuk judul dan 5.000 untuk isi.');
  }

  await prisma.announcement.create({ data: { authorId: author.id, title, body } });
  revalidatePath('/dashboard/kesiswaan');
  revalidatePath('/dashboard');
}