export const instant = false;

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import ScheduleManager from './ScheduleManager';

export default async function ClassSchedulesPage() {
  await requireRole('ADMIN', 'TU');

  const [classrooms, teachers, schedules] = await prisma.$transaction([
    prisma.classroom.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    prisma.classTeachingSchedule.findMany({
      include: {
        classroom: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">Jadwal Mengajar</h1>
        <p className="mt-1 text-sm text-slate-600">Atur guru, mata pelajaran, ruang, dan jam scan barcode kelas.</p>
      </header>
      <ScheduleManager
        classrooms={classrooms}
        teachers={teachers.map((teacher) => ({ id: teacher.id, name: teacher.name, detail: teacher.email }))}
        schedules={schedules}
      />
    </div>
  );
}
