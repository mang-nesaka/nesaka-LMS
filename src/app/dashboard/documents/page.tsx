export const instant = false;

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import StudentDocumentsClient from './StudentDocumentsClient';
import TuDocumentsVerification from './TuDocumentsVerification';

const prisma = new PrismaClient();

export default async function DocumentsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!currentUser) {
    redirect('/login');
  }

  // TAMPILAN UNTUK SISWA: Upload Akte Kelahiran, Kartu Keluarga, dan Ijazah SMP
  if (currentUser.role === 'STUDENT') {
    const rawDocuments = await prisma.studentDocument.findMany({
      where: { studentId: currentUser.id },
      orderBy: { createdAt: 'desc' },
    });

    const formattedDocs = rawDocuments.map((d) => ({
      id: d.id,
      docType: d.docType,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      fileType: d.fileType,
      fileSize: d.fileSize,
      status: d.status,
      feedback: d.feedback,
      verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString() : null,
      createdAt: d.createdAt.toISOString(),
    }));

    return (
      <StudentDocumentsClient
        documents={formattedDocs}
        studentName={currentUser.name}
      />
    );
  }

  // TAMPILAN UNTUK STAF TU / ADMIN / GURU: Verifikasi Rekap Dokumen Siswa Kelas 10
  const rawStudents = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      dapodikForm: {
        select: { nisn: true, sekolahAsal: true },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  const formattedStudents = rawStudents.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    dapodik: s.dapodikForm,
    documents: s.documents.map((d) => ({
      id: d.id,
      docType: d.docType,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      fileType: d.fileType,
      fileSize: d.fileSize,
      status: d.status,
      feedback: d.feedback,
      verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString() : null,
      createdAt: d.createdAt.toISOString(),
    })),
  }));

  return <TuDocumentsVerification students={formattedStudents} />;
}
