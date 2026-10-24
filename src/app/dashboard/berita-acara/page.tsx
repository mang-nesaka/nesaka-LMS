import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getActivityReports } from '@/app/actions/activity';
import BeritaAcaraClient from './BeritaAcaraClient';

const prisma = new PrismaClient();

export default async function BeritaAcaraPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

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

  const params = await searchParams;
  const roleFilter = params.role || 'ALL';
  const reports = await getActivityReports(roleFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
          <span>📝 Berita Acara Kegiatan Wakil Kepala Sekolah (Waka)</span>
        </h1>
        <p className="text-amber-100 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          Modul resmi pencatatan Berita Acara, Notulensi, dan Dokumentasi Kegiatan untuk Waka Kurikulum, Waka Kesiswaan, Waka Sarana & Prasarana, serta Waka Hubungan Industri (Hubdin).
        </p>
      </div>

      <BeritaAcaraClient user={currentUser} reports={reports} initialRoleFilter={roleFilter} />
    </div>
  );
}
