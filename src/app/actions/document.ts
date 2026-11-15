"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { isGradeTwelve } from '@/lib/eIjazah';


const VALID_DOC_TYPES = ['AKTE_KELAHIRAN', 'KARTU_KELUARGA', 'IJAZAH_SMP'];

export async function uploadStudentDocument(formData: FormData) {
  const { id: userId } = await requireRole('STUDENT');

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
  const { id: userId } = await requireRole('STUDENT');
  if (!VALID_DOC_TYPES.includes(docType)) throw new Error('Jenis dokumen tidak valid.');

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
  await requireRole('TU', 'ADMIN');
  if (!['VERIFIED', 'REJECTED'].includes(status)) throw new Error('Status dokumen tidak valid.');

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

export async function uploadEIjazahAction(studentId: string, formData: FormData) {
  await requireRole('TU', 'ADMIN');

  if (!studentId) throw new Error('Siswa tidak valid.');

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('File E-Ijazah wajib dipilih.');
  }
  if (file.size > 4 * 1024 * 1024) {
    throw new Error('Ukuran file maksimal 4MB.');
  }
  if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('E-Ijazah harus berupa file PDF.');
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId, role: 'STUDENT' },
    select: {
      studentClass: true,
      classroom: { select: { name: true, level: true } },
    },
  });
  if (!student || !isGradeTwelve(student.studentClass, student.classroom?.level, student.classroom?.name)) {
    throw new Error('E-Ijazah hanya dapat diunggah untuk siswa kelas XII.');
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') {
    throw new Error('Isi file bukan dokumen PDF yang valid.');
  }

  const fileUrl = `data:application/pdf;base64,${Buffer.from(bytes).toString('base64')}`;
  await prisma.studentDocument.upsert({
    where: { studentId_docType: { studentId, docType: 'E_IJAZAH' } },
    update: {
      fileName: file.name,
      fileUrl,
      fileType: 'application/pdf',
      fileSize: file.size,
      status: 'VERIFIED',
      feedback: null,
      verifiedAt: new Date(),
    },
    create: {
      studentId,
      docType: 'E_IJAZAH',
      fileName: file.name,
      fileUrl,
      fileType: 'application/pdf',
      fileSize: file.size,
      status: 'VERIFIED',
      verifiedAt: new Date(),
    },
  });

  revalidatePath('/dashboard/ijazah');
  return { success: true };
}
