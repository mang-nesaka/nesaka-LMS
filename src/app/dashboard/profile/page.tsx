export const instant = false;

import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DigitalStudentCard from './DigitalStudentCard';


export default async function ProfilePage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      dapodikForm: true,
      enrollments: {
        include: {
          course: {
            include: {
              teacher: {
                select: { name: true },
              },
            },
          },
        },
      },
      coursesAsTeacher: {
        include: {
          teacher: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const isTeacher = user.role === 'TEACHER';

  // Format list courses
  const formattedCourses = isTeacher
    ? user.coursesAsTeacher.map((c) => ({
        id: c.id,
        title: c.title,
        teacherName: c.teacher.name,
      }))
    : user.enrollments.map((e) => ({
        id: e.course.id,
        title: e.course.title,
        teacherName: e.course.teacher.name,
      }));

  const cardData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    hasAvatar: Boolean(user.avatarUrl),
    createdAt: user.createdAt.toISOString(),
    dapodik: user.dapodikForm
      ? {
          namaLengkap: user.dapodikForm.namaLengkap,
          nisn: user.dapodikForm.nisn,
          nis: user.dapodikForm.nis,
          nik: user.dapodikForm.nik,
          jenisKelamin: user.dapodikForm.jenisKelamin,
          tempatLahir: user.dapodikForm.tempatLahir,
          tanggalLahir: user.dapodikForm.tanggalLahir,
          agama: user.dapodikForm.agama,
          alamat: user.dapodikForm.alamat,
          noHp: user.dapodikForm.noHp,
          sekolahAsal: user.dapodikForm.sekolahAsal,
        }
      : null,
    courses: formattedCourses,
  };

  return <DigitalStudentCard data={cardData} />;
}
