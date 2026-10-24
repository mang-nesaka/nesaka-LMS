import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getClassAttendanceRecap } from '@/app/actions/attendance';
import { getClassrooms } from '@/app/actions/agenda';
import WaliKelasClient from './WaliKelasClient';

const prisma = new PrismaClient();

export default async function WaliKelasPage({ searchParams }: { searchParams: Promise<{ class?: string; period?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, waliKelasOf: true },
  });

  if (!currentUser) {
    redirect('/login');
  }

  const params = await searchParams;
  const classrooms = await getClassrooms();

  // Tentukan kelas yang ditampilkan
  // Jika wali kelas, utamakan kelas yang diwalikannya
  let selectedClass = params.class || currentUser.waliKelasOf || (classrooms[0]?.name ?? 'X RPL 1');
  const selectedPeriod = (params.period as 'daily' | 'weekly' | 'monthly' | 'semester') || 'daily';

  const { students, today } = await getClassAttendanceRecap({
    className: selectedClass,
    period: selectedPeriod,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-200 border border-white/20">
            {currentUser.role === 'WALI_KELAS' ? `Wali Kelas: ${currentUser.waliKelasOf || 'Semua'}` : 'Portal Monitoring Kehadiran'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            📊 Rekapitulasi Presensi Kehadiran Siswa
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Pantau kehadiran harian, mingguan, bulanan, dan per semester siswa lengkap dengan durasi keterlambatan, status kepulangan, dan foto kehadiran.
          </p>
        </div>
      </div>

      <WaliKelasClient
        user={currentUser}
        classrooms={classrooms}
        selectedClass={selectedClass}
        selectedPeriod={selectedPeriod}
        students={students}
        today={today}
      />
    </div>
  );
}
