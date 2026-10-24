import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  const document = await prisma.studentDocument.findUnique({
    where: { id },
    select: { studentId: true, fileName: true, fileType: true, fileUrl: true },
  });
  if (!document) return new NextResponse('Not found', { status: 404 });

  const isOwner = user.role === 'STUDENT' && document.studentId === user.id;
  const isReviewer = user.role === 'ADMIN' || user.role === 'TU';
  if (!isOwner && !isReviewer) return new NextResponse('Forbidden', { status: 403 });

  const prefix = `data:${document.fileType};base64,`;
  if (!document.fileUrl.startsWith(prefix)) {
    return new NextResponse('Invalid document data', { status: 500 });
  }

  const bytes = Buffer.from(document.fileUrl.slice(prefix.length), 'base64');
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': document.fileType,
      'Content-Length': String(bytes.byteLength),
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
