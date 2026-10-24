import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getClassrooms, getTeacherTodayAgendas } from '@/app/actions/agenda';
import TeacherAgendaClient from './TeacherAgendaClient';


export default async function TeacherAgendaPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, email: true },
  });

  if (!currentUser) {
    redirect('/login');
  }

  const classrooms = await getClassrooms();
  const todayAgendas = await getTeacherTodayAgendas();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <span>📷 Scan Barcode Kelas & Agenda Mengajar Guru</span>
        </h1>
        <p className="text-emerald-100 text-sm mt-2 max-w-2xl leading-relaxed">
          Pindai Barcode / QR Code yang tertera di kelas Anda untuk mengaktifkan agenda mengajar. Jika Anda memindai barcode melewati jam pelajaran yang ditentukan, sistem akan otomatis mencatat durasi keterlambatan Anda.
        </p>
      </div>

      <TeacherAgendaClient
        teacher={currentUser}
        classrooms={classrooms}
        initialAgendas={todayAgendas}
      />
    </div>
  );
}
