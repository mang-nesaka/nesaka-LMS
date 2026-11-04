import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;
  const report = await prisma.facilityReport.findUnique({
    where: { id },
    select: { studentId: true, photoData: true, photoType: true },
  });
  if (!report) return new NextResponse('Not found', { status: 404 });
  if (!['ADMIN', 'WAKA_SARPRAS'].includes(user.role) && !(user.role === 'STUDENT' && user.id === report.studentId)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(report.photoData);
  if (!match || report.photoType !== `image/${match[1]}`) return new NextResponse('Invalid image data', { status: 500 });
  const bytes = Buffer.from(match[2], 'base64');
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': report.photoType,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}