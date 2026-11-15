import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isGradeTwelve } from '@/lib/eIjazah';

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { studentId } = await params;
  const student = await prisma.user.findUnique({
    where: { id: studentId, role: 'STUDENT' },
    select: {
      id: true,
      studentClass: true,
      classroom: { select: { name: true, level: true } },
      documents: {
        where: { docType: 'E_IJAZAH' },
        select: { fileName: true, fileType: true, fileUrl: true },
        take: 1,
      },
    },
  });

  if (!student || !isGradeTwelve(student.studentClass, student.classroom?.level, student.classroom?.name)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const isOwner = user.role === 'STUDENT' && user.id === student.id;
  const isManager = user.role === 'TU' || user.role === 'ADMIN';
  if (!isOwner && !isManager) return new NextResponse('Forbidden', { status: 403 });

  const document = student.documents[0];
  if (!document) return new NextResponse('Not found', { status: 404 });

  const prefix = 'data:application/pdf;base64,';
  if (document.fileType !== 'application/pdf' || !document.fileUrl.startsWith(prefix)) {
    return new NextResponse('Invalid document data', { status: 500 });
  }

  const bytes = Buffer.from(document.fileUrl.slice(prefix.length), 'base64');
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(bytes.byteLength),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}