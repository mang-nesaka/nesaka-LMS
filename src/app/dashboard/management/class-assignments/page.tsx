import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import ClassAssignmentsClient from './ClassAssignmentsClient';

export default async function ClassAssignmentsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/login');

  const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'TU') redirect('/dashboard');

  const [classrooms, teachers, students, homeroomTeachers] = await Promise.all([
    prisma.classroom.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        name: true,
        email: true,
        teachingClassrooms: { select: { classroomId: true, classroom: { select: { name: true } } } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        studentClass: true,
        classroomId: true,
        classroom: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'WALI_KELAS' },
      select: {
        id: true,
        name: true,
        email: true,
        waliKelasOf: true,
        homeroomClassId: true,
        homeroomClass: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-xs font-semibold uppercase text-teal-300">Manajemen sekolah</p>
        <h1 className="mt-2 text-2xl font-bold">Penempatan Kelas</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Hubungkan guru pengampu, siswa, dan wali kelas ke ruang kelas terdaftar.
        </p>
      </header>
      <ClassAssignmentsClient
        classrooms={classrooms}
        teachers={teachers}
        students={students}
        homeroomTeachers={homeroomTeachers}
      />
    </div>
  );
}