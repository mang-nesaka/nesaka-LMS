import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== 'ADMIN' && user?.role !== 'TU') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const csv = '\uFEFFname,email,password,nama_kelas\r\nBudi Santoso,budi@sekolah.com,password123,Matematika Kelas X-A\r\nSiti Aminah,siti@sekolah.com,password123,Biologi Kelas X-B';

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="template_siswa_dengan_kelas.csv"',
      'Cache-Control': 'private, no-store',
    },
  });
}