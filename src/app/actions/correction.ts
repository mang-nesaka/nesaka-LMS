"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function submitDataCorrectionRequest(data: {
  studentId: string;
  notes: string;
}) {
  const { studentId, notes } = data;

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

export async function getStudentCorrectionRequests(studentId: string) {
  return await prisma.dataCorrectionRequest.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllCorrectionRequests() {
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
