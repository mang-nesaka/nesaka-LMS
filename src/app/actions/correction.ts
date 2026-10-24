"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';


export async function submitDataCorrectionRequest(data: {
  notes: string;
}) {
  const { id: studentId } = await requireRole('STUDENT');
  const notes = data.notes.trim();
  if (!notes) throw new Error('Catatan koreksi wajib diisi.');

  const request = await prisma.dataCorrectionRequest.create({
    data: {
      studentId,
      notes,
      status: 'PENDING',
    },
  });

  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard/dapodik');
  revalidatePath('/dashboard/tu/corrections');

  return {
    success: true,
    message: 'Laporan ketidaksesuaian data berhasil dikirim ke Tata Usaha (TU). Tim TU akan meninjau dan memperbarui data Anda.',
    request,
  };
}

export async function getStudentCorrectionRequests() {
  const { id: studentId } = await requireRole('STUDENT');
  return await prisma.dataCorrectionRequest.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllCorrectionRequests() {
  await requireRole('TU', 'ADMIN');
  return await prisma.dataCorrectionRequest.findMany({
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          studentClass: true,
          nipOrNis: true,
          dapodikForm: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function processCorrectionRequest(id: string, adminResponse: string, status: 'PROCESSED' | 'REJECTED') {
  await requireRole('TU', 'ADMIN');
  if (!['PROCESSED', 'REJECTED'].includes(status)) throw new Error('Status koreksi tidak valid.');
  await prisma.dataCorrectionRequest.update({
    where: { id },
    data: {
      adminResponse,
      status,
    },
  });

  revalidatePath('/dashboard/tu/corrections');
  revalidatePath('/dashboard/dapodik');
  return { success: true, message: 'Status laporan koreksi data berhasil diperbarui oleh TU.' };
}
