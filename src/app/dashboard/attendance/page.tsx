import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getStudentTodayAttendance } from '@/app/actions/attendance';
import StudentAttendanceClient from './StudentAttendanceClient';


export default async function AttendancePage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      studentClass: true,
    },
  });

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  const { attendance, setting, today } = await getStudentTodayAttendance();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
          <span>📍 Presensi Kehadiran Siswa (GPS & Wajah)</span>
        </h1>
        <p className="text-indigo-100 text-sm mt-2 max-w-2xl leading-relaxed">
          Presensi wajib menggunakan kamera selfie dan mengaktifkan GPS lokasi. Radius maksimal adalah{' '}
          <span className="font-bold underline text-white">{setting.radiusMeters} meter</span> dari titik gerbang {setting.schoolName}.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs font-semibold">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
            <span className="block text-indigo-200 text-[10px] uppercase">Presensi Pagi Dibuka</span>
            <span className="text-sm font-bold">{setting.checkInStartTime} WIB</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
            <span className="block text-amber-200 text-[10px] uppercase">Batas Tepat Waktu</span>
            <span className="text-sm font-bold">&lt; {setting.checkInLateTime} WIB</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 col-span-2 sm:col-span-1">
            <span className="block text-emerald-200 text-[10px] uppercase">Presensi Pulang</span>
            <span className="text-sm font-bold">Mulai {setting.checkOutStartTime} WIB</span>
          </div>
        </div>
      </div>

      <StudentAttendanceClient
        student={currentUser}
        attendance={attendance}
        setting={setting}
        today={today}
      />
    </div>
  );
}
