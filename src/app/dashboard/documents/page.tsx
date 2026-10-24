export const instant = false;

import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentDocumentsClient from './StudentDocumentsClient';
import TuDocumentsVerification from './TuDocumentsVerification';


export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const userId = await getSessionUserId();

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

  if (currentUser.role !== 'STUDENT' && !['TU', 'ADMIN'].includes(currentUser.role)) {
    redirect('/dashboard');
  }

  // TAMPILAN UNTUK SISWA: Upload Akte Kelahiran, Kartu Keluarga, dan Ijazah SMP
  if (currentUser.role === 'STUDENT') {
    const rawDocuments = await prisma.studentDocument.findMany({
      where: { studentId: currentUser.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, docType: true, fileName: true, fileType: true, fileSize: true,
        status: true, feedback: true, verifiedAt: true, createdAt: true,
      },
    });

    const formattedDocs = rawDocuments.map((d) => ({
      id: d.id,
      docType: d.docType,
      fileName: d.fileName,
      fileUrl: `/api/documents/${d.id}`,
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
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const pageSize = 50;
  const rawStudents = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      name: true,
      email: true,
      dapodikForm: {
        select: { nisn: true, sekolahAsal: true },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, docType: true, fileName: true, fileType: true, fileSize: true,
          status: true, feedback: true, verifiedAt: true, createdAt: true,
        },
      },
    },
    orderBy: { name: 'asc' },
    skip: (page - 1) * pageSize,
    take: pageSize + 1,
  });

  const hasNextPage = rawStudents.length > pageSize;
  const formattedStudents = rawStudents.slice(0, pageSize).map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    dapodik: s.dapodikForm,
    documents: s.documents.map((d) => ({
      id: d.id,
      docType: d.docType,
      fileName: d.fileName,
      fileUrl: `/api/documents/${d.id}`,
      fileType: d.fileType,
      fileSize: d.fileSize,
      status: d.status,
      feedback: d.feedback,
      verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString() : null,
      createdAt: d.createdAt.toISOString(),
    })),
  }));

  return <TuDocumentsVerification students={formattedStudents} page={page} hasNextPage={hasNextPage} />;
}
