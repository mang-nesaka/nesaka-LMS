"use server";

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

const VALID_DOC_TYPES = ['AKTE_KELAHIRAN', 'KARTU_KELUARGA', 'IJAZAH_SMP'];

export async function uploadStudentDocument(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    throw new Error('Sesi login telah habis. Silakan login kembali.');
  }

  const docType = formData.get('docType') as string;
  const file = formData.get('file') as File;

  if (!docType || !VALID_DOC_TYPES.includes(docType)) {
    throw new Error('Jenis dokumen tidak valid.');
  }

  if (!file || file.name === 'undefined' || file.size === 0) {
    throw new Error('File dokumen wajib dipilih.');
  }

  // Maksimal 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran file maksimal adalah 5MB.');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format file harus berupa gambar (JPG, PNG, WEBP) atau dokumen PDF.');
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const fileUrl = `data:${file.type};base64,${base64}`;

  await prisma.studentDocument.upsert({
    where: {
      studentId_docType: {
        studentId: userId,
        docType,
      },
    },
    update: {
      fileName: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      status: 'PENDING',
      feedback: null,
      verifiedAt: null,
    },
    create: {
      studentId: userId,
      docType,
      fileName: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      status: 'PENDING',
    },
  });

  revalidatePath('/dashboard/documents');
  return { success: true };
}

export async function deleteStudentDocument(docType: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    throw new Error('Sesi login telah habis.');
  }

  await prisma.studentDocument.deleteMany({
    where: {
      studentId: userId,
      docType,
    },
  });

  revalidatePath('/dashboard/documents');
  return { success: true };
}

export async function verifyDocumentAction(documentId: string, status: 'VERIFIED' | 'REJECTED', feedback?: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    throw new Error('Sesi login telah habis.');
  }

  const reviewer = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (reviewer?.role !== 'TU' && reviewer?.role !== 'ADMIN') {
    throw new Error('Hanya Staf Tata Usaha (TU) atau Admin yang berhak memverifikasi dokumen.');
  }

  await prisma.studentDocument.update({
    where: { id: documentId },
    data: {
      status,
      feedback: feedback || null,
      verifiedAt: status === 'VERIFIED' ? new Date() : null,
    },
  });

  revalidatePath('/dashboard/documents');
  return { success: true };
}
