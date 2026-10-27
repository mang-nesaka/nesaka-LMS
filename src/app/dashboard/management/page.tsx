export const instant = false;

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import ManagementHub from './ManagementHub';

const demoAccountWhere = {
  email: { endsWith: '@nesaka.demo' },
  role: { in: ['STUDENT', 'TEACHER'] },
};

function formatJoinedDate(date: Date) {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function ManagementPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/login');

  const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'TU') redirect('/dashboard');

  const [students, teachers, demoStudentCount, demoTeacherCount, demoAccounts] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        studentClass: true,
        createdAt: true,
        _count: { select: { enrollments: true, submissions: true } },
        dapodikForm: { select: { id: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { coursesAsTeacher: true, classSchedules: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.count({ where: { ...demoAccountWhere, role: 'STUDENT' } }),
    prisma.user.count({ where: { ...demoAccountWhere, role: 'TEACHER' } }),
    prisma.user.findMany({
      where: demoAccountWhere,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
  ]);

  return (
    <ManagementHub
      students={students.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        studentClass: student.studentClass,
        createdAt: formatJoinedDate(student.createdAt),
        enrollments: student._count.enrollments,
        submissions: student._count.submissions,
        hasDapodik: Boolean(student.dapodikForm),
      }))}
      teachers={teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        createdAt: formatJoinedDate(teacher.createdAt),
        courses: teacher._count.coursesAsTeacher,
        schedules: teacher._count.classSchedules,
      }))}
      demoAccounts={demoAccounts.map((account) => ({
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        createdAt: formatJoinedDate(account.createdAt),
      }))}
      demoStudentCount={demoStudentCount}
      demoTeacherCount={demoTeacherCount}
    />
  );
}