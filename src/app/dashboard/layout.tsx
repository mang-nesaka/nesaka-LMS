export const instant = false;

import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardShell from './DashboardShell';


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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
      avatarUrl: true,
    },
  });

  if (!currentUser) {
    redirect('/login');
  }

  const shellUser = {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    hasAvatar: Boolean(currentUser.avatarUrl),
  };

  return (
    <DashboardShell user={shellUser}>
      {children}
    </DashboardShell>
  );
}
