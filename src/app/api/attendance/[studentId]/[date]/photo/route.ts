import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ studentId: string; date: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { studentId, date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return new NextResponse('Invalid date', { status: 400 });

  const attendance = await prisma.studentAttendance.findUnique({
    where: { studentId_date: { studentId, date } },
    select: {
      checkInPhoto: true,
      student: { select: { studentClass: true } },
    },
  });
  if (!attendance?.checkInPhoto) return new NextResponse('Not found', { status: 404 });

  const isOwner = user.role === 'STUDENT' && user.id === studentId;
  const isAssignedClass = user.role === 'WALI_KELAS' &&
    Boolean(user.waliKelasOf) && attendance.student.studentClass === user.waliKelasOf;
  const canReview = ['ADMIN', 'KEPSEK', 'TU', 'WAKA_KESISWAAN'].includes(user.role);
  if (!isOwner && !isAssignedClass && !canReview) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const prefix = 'data:image/jpeg;base64,';
  if (!attendance.checkInPhoto.startsWith(prefix)) {
    return new NextResponse('Invalid photo data', { status: 500 });
  }

  const bytes = Buffer.from(attendance.checkInPhoto.slice(prefix.length), 'base64');
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
