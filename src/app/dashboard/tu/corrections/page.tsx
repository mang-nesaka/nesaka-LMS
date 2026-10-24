import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllCorrectionRequests } from '@/app/actions/correction';
import TuCorrectionsClient from './TuCorrectionsClient';

const prisma = new PrismaClient();

export default async function TuCorrectionsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });

  if (!currentUser || !['TU', 'ADMIN'].includes(currentUser.role)) {
    redirect('/dashboard');
  }

  const requests = await getAllCorrectionRequests();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <span>📋 Pengaduan Koreksi Data Diri Siswa (Tata Usaha)</span>
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          Daftar pengaduan ketidaksesuaian data diri dari siswa. Staf TU dapat meninjau aduan, memperbarui data Dapodik resmi, dan memberikan tanggapan perbaikan kepada siswa.
        </p>
      </div>

      <TuCorrectionsClient requests={requests} />
    </div>
  );
}
