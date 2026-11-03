import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return new NextResponse('Unauthorized', { status: 401 });
  if (!['TEACHER', 'ADMIN'].includes(currentUser.role)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const examId = new URL(request.url).searchParams.get('examId');
  if (!examId) return new NextResponse('ID ujian wajib diisi.', { status: 400 });

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: {
      title: true,
      course: { select: { title: true, teacherId: true } },
    },
  });
  if (!exam) return new NextResponse('Ujian tidak ditemukan.', { status: 404 });
  if (currentUser.role === 'TEACHER' && exam.course.teacherId !== currentUser.id) {
    return new NextResponse('Anda tidak memiliki akses ke ujian ini.', { status: 403 });
  }

  const results = await prisma.examResult.findMany({
    where: { examId },
    include: {
      student: { select: { name: true, studentClass: true, nipOrNis: true } },
    },
    orderBy: { student: { name: 'asc' } },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LMS Nesaka';
  const worksheet = workbook.addWorksheet('Nilai CBT');
  worksheet.columns = [
    { header: 'ID Hasil (Jangan Diubah)', key: 'id', width: 30 },
    { header: 'Nama Siswa', key: 'name', width: 28 },
    { header: 'Kelas', key: 'className', width: 18 },
    { header: 'NIS/NISN', key: 'studentNumber', width: 18 },
    { header: 'Nilai Saat Ini', key: 'currentScore', width: 16 },
    { header: 'Nilai Baru', key: 'newScore', width: 16 },
  ];
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  worksheet.autoFilter = 'A1:F1';
  const header = worksheet.getRow(1);
  header.height = 28;
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.eachCell((cell, columnNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: columnNumber === 6 ? 'FF047857' : 'FF334155' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });

  for (const result of results) {
    worksheet.addRow({
      id: result.id,
      name: result.student.name,
      className: result.student.studentClass || '-',
      studentNumber: result.student.nipOrNis || '-',
      currentScore: result.score,
      newScore: result.score,
    });
  }
  worksheet.getColumn(5).numFmt = '0.0';
  worksheet.getColumn(6).numFmt = '0.0';
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    worksheet.getCell(rowNumber, 6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const safeExamName = exam.title.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 60) || 'Ujian';
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Template_Nilai_CBT_${safeExamName}.xlsx"`,
    },
  });
}