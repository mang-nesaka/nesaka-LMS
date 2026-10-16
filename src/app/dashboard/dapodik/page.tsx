export const instant = false;

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DapodikClientForm from './DapodikClientForm';
import { FileSpreadsheet, Users, CheckCircle, Download, Search, School } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function DapodikPage() {
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

  const isStudent = currentUser.role === 'STUDENT';
  const isTUOrAdmin = currentUser.role === 'TU' || currentUser.role === 'ADMIN';

  // JIKA USER ADALAH SISWA: Tampilkan Form Pengisian (Hanya sekali)
  if (isStudent) {
    const existingData = await prisma.dapodikForm.findUnique({
      where: { studentId: currentUser.id },
    });

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Formulir Dapodik Siswa Baru</h2>
          <p className="text-slate-500 mt-1">
            Data Pokok Pendidikan (F-PD) - Wajib diisi oleh siswa kelas 10 untuk pendataan resmi sekolah.
          </p>
        </div>

        <DapodikClientForm 
          existingData={existingData} 
          defaultStudentName={currentUser.name} 
        />
      </div>
    );
  }

  // JIKA USER ADALAH TU / ADMIN: Tampilkan Rekap & Tombol Download Spreadsheet
  const allSubmissions = await prisma.dapodikForm.findMany({
    include: {
      student: {
        select: {
          name: true,
          email: true,
          enrollments: {
            include: {
              course: { select: { title: true } }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
  const totalSubmitted = allSubmissions.length;
  const pendingCount = Math.max(0, totalStudents - totalSubmitted);

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rekapitulasi Formulir Dapodik (F-PD)</h2>
          <p className="text-slate-500 mt-1">
            Pantau dan unduh data formulir Dapodik siswa baru kelas 10 secara terpusat.
          </p>
        </div>

        {isTUOrAdmin && (
          <a
            href="/api/dapodik/export"
            download
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download Format Spreadsheet (.CSV)
          </a>
        )}
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Siswa Terdaftar</p>
            <p className="text-2xl font-bold text-slate-800">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Sudah Mengisi Dapodik</p>
            <p className="text-2xl font-bold text-emerald-600">{totalSubmitted}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Belum Mengisi</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Tabel Data Dapodik Siswa */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-slate-800">Daftar Pengisian Siswa</h3>
          <span className="text-xs text-slate-500">
            Total {totalSubmitted} data terekam
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">NISN / NIK</th>
                <th className="px-6 py-4">Tempat, Tanggal Lahir</th>
                <th className="px-6 py-4">Nama Orang Tua</th>
                <th className="px-6 py-4">Kontak (HP)</th>
                <th className="px-6 py-4 text-center">Tgl Submit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Belum ada siswa yang mengisi formulir Dapodik.
                  </td>
                </tr>
              ) : (
                allSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div>{item.namaLengkap}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {item.student.enrollments.map(e => e.course.title).join(", ") || "Belum ada kelas"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-mono text-xs">{item.nisn}</div>
                      <div className="text-slate-400 font-mono text-xs">{item.nik}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{item.tempatLahir}</div>
                      <div className="text-xs text-slate-400">{item.tanggalLahir}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>A: {item.namaAyah}</div>
                      <div className="text-xs text-slate-400">I: {item.namaIbu}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-mono text-xs">
                      {item.noHp}
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
