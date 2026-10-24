export const instant = false;
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import SettingsForm from './SettingsForm';
import { redirect } from 'next/navigation';


export default async function SettingsPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true }
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Pengaturan Akun</h2>
        <p className="text-slate-500 mt-1">Kelola informasi profil dan preferensi keamanan Anda.</p>
      </div>

      <SettingsForm user={user} />
    </div>
  );
}


