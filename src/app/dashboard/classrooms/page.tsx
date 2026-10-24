import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getClassrooms, createClassroom } from '@/app/actions/agenda';
import ClassroomListClient from './ClassroomListClient';

const prisma = new PrismaClient();

export default async function ClassroomsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });

  if (!currentUser) {
    redirect('/login');
  }

  const classrooms = await getClassrooms();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            🏷️ Barcode & QR Code Ruang Kelas
          </h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-2xl leading-relaxed">
            Barcode/QR Code ini ditempel di pintu atau meja setiap ruang kelas. Guru mata pelajaran memindai kode ini saat memasuki kelas untuk mencatat agenda mengajar dan waktu kedatangan.
          </p>
        </div>
      </div>

      <ClassroomListClient classrooms={classrooms} canCreate={['ADMIN', 'TU', 'WAKA_KURIKULUM', 'WAKA_SARPRAS'].includes(currentUser.role)} />
    </div>
  );
}
