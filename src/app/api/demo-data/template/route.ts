import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { requireRole } from '@/lib/auth';
import { generateDemoDataset } from '@/lib/demo-dataset.mjs';

export async function GET() {
  await requireRole('ADMIN', 'TU');
  const dataset = generateDemoDataset();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NESAKA LMS';
  workbook.subject = 'Template data demo sekolah';

  const addSheet = (name: string, columns: Array<{ header: string; key: string; width: number }>, rows: object[]) => {
    const sheet = workbook.addWorksheet(name);
    sheet.columns = columns;
    sheet.addRows(rows);
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    return sheet;
  };

  addSheet('Petunjuk', [
    { header: 'Informasi', key: 'information', width: 110 },
  ], [
    { information: 'Template ini berisi 30 kelas, 50 guru, 1.080 siswa, dan 600 jadwal (Senin-Jumat).' },
    { information: 'Email akun menggunakan domain @nesaka.demo agar tidak berbenturan dengan akun sekolah.' },
    { information: 'Jangan ubah nama sheet atau header kolom. Setiap akun baru mendapat password acak; setelah import unduh file kredensial.' },
    { information: 'Import ulang aman: akun, kelas, dan jadwal yang sudah ada tidak ditimpa atau diduplikasi.' },
    { information: 'Jadwal menggunakan hari 1=Senin sampai 5=Jumat; 0=Minggu dan 6=Sabtu.' },
  ]);
  addSheet('Kelas', [
    { header: 'name', key: 'name', width: 48 },
    { header: 'code', key: 'code', width: 28 },
    { header: 'level', key: 'level', width: 12 },
    { header: 'program', key: 'program', width: 52 },
  ], dataset.classrooms);
  addSheet('Guru', [
    { header: 'name', key: 'name', width: 26 },
    { header: 'email', key: 'email', width: 38 },
    { header: 'role', key: 'role', width: 16 },
  ], dataset.teachers);
  addSheet('Siswa', [
    { header: 'name', key: 'name', width: 24 },
    { header: 'email', key: 'email', width: 40 },
    { header: 'studentClass', key: 'studentClass', width: 52 },
    { header: 'nipOrNis', key: 'nipOrNis', width: 18 },
    { header: 'classroomCode', key: 'classroomCode', width: 28 },
  ], dataset.students);
  addSheet('Jadwal', [
    { header: 'teacherEmail', key: 'teacherEmail', width: 40 },
    { header: 'classroomCode', key: 'classroomCode', width: 28 },
    { header: 'subject', key: 'subject', width: 52 },
    { header: 'dayOfWeek', key: 'dayOfWeek', width: 14 },
    { header: 'startTime', key: 'startTime', width: 14 },
    { header: 'endTime', key: 'endTime', width: 14 },
  ], dataset.schedules);

  const bytes = await workbook.xlsx.writeBuffer();
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="nesaka-demo-data-template.xlsx"',
      'Cache-Control': 'private, no-store',
    },
  });
}
