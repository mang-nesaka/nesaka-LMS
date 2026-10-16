import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { populateExactFpdWorksheet } from '@/lib/excelFpd';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'TU') {
    return new NextResponse('Forbidden: Hanya TU atau Admin yang bisa mendownload format Dapodik F-PD', { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const targetStudentId = searchParams.get('studentId');

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LMS Sekolah - SMK Negeri 1 Kandanghaur';
  workbook.created = new Date();

  if (targetStudentId) {
    // Unduh spesifik satu siswa
    const record = await prisma.dapodikForm.findUnique({
      where: { studentId: targetStudentId },
      include: {
        student: {
          select: {
            name: true,
            enrollments: {
              include: { course: { select: { title: true } } }
            }
          }
        }
      }
    });

    if (!record) {
      return new NextResponse('Data formulir tidak ditemukan.', { status: 404 });
    }

    const programTitle = record.student.enrollments.map(e => e.course.title).join(", ") || 'Teknik Otomotif';
    const worksheet = workbook.addWorksheet(`F-PD ${record.namaLengkap.slice(0, 20)}`);
    populateExactFpdWorksheet(worksheet, record, programTitle);

    const buffer = await workbook.xlsx.writeBuffer();
    const cleanName = record.namaLengkap.replace(/[^a-zA-Z0-9]/g, '_');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="F-PD_${cleanName}_${record.nisn}.xlsx"`,
      },
    });
  }

  // Unduh semua siswa
  const records = await prisma.dapodikForm.findMany({
    include: {
      student: {
        select: {
          name: true,
          enrollments: {
            include: { course: { select: { title: true } } }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' },
  });

  if (records.length === 0) {
    const emptySheet = workbook.addWorksheet('Data Kosong');
    emptySheet.addRow(['Belum ada data formulir Dapodik yang tersimpan.']);
  } else {
    // Buat sheet terpisah untuk setiap siswa dengan format resmi F-PD
    records.forEach((record, index) => {
      // Batasi nama sheet max 31 karakter sesuai aturan Excel
      const rawSheetName = `${index + 1}. ${record.namaLengkap}`;
      const safeSheetName = rawSheetName.replace(/[:\\/?*[\]]/g, '').slice(0, 31);
      const programTitle = record.student.enrollments.map(e => e.course.title).join(", ") || 'Teknik Otomotif';
      
      const worksheet = workbook.addWorksheet(safeSheetName);
      populateExactFpdWorksheet(worksheet, record, programTitle);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split('T')[0];

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Format_F-PD_Dapodik_Semua_Siswa_${dateStr}.xlsx"`,
    },
  });
}
