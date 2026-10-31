import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { getNonSmartphoneStudents } from '@/app/actions/tuAttendance';
import NonSmartphoneManagementClient from './NonSmartphoneManagementClient';

export default async function NonSmartphoneManagementPage() {
  const currentUser = await requireRole('TU', 'ADMIN');

  const [classrooms, { students, today }] = await Promise.all([
    prisma.classroom.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    getNonSmartphoneStudents(),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-amber-300 border border-white/20">
            Manajemen Khusus Tata Usaha (TU)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <span>📱 Manajemen Siswa Tanpa Smartphone</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Kelola pendaftaran siswa yang tidak memiliki smartphone atau membawa gawai, cetak kartu barcode presensi fisik, dan pantau status kehadiran mereka di loket TU sekolah.
          </p>
        </div>
      </div>

      <NonSmartphoneManagementClient
        currentUser={currentUser}
        initialStudents={students}
        classrooms={classrooms}
        today={today}
      />
    </div>
  );
}
