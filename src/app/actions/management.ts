"use server";

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function createTeacherAccount(formData: FormData) {
  await requireRole('ADMIN', 'TU');

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Nama dan alamat email guru harus valid.');
  }
  if (password.length < 6) {
    throw new Error('Password guru minimal 6 karakter.');
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  });
  if (existingUser) throw new Error('Email tersebut sudah digunakan.');

  await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 12), role: 'TEACHER' },
  });

  revalidatePath('/dashboard/management');
  revalidatePath('/dashboard/management/class-assignments');
  return { success: true };
}

export async function assignStudentToClass(formData: FormData) {
  await requireRole('ADMIN', 'TU');
  const studentId = String(formData.get('studentId') ?? '');
  const classroomId = String(formData.get('classroomId') ?? '');
  const [student, classroom] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId }, select: { role: true } }),
    prisma.classroom.findUnique({ where: { id: classroomId }, select: { id: true, name: true } }),
  ]);
  if (student?.role !== 'STUDENT') throw new Error('Akun yang dipilih bukan siswa.');
  if (!classroom) throw new Error('Kelas tidak ditemukan.');

  await prisma.user.update({
    where: { id: studentId },
    data: { classroomId, studentClass: classroom.name },
  });
  revalidateClassAssignments();
  return { success: true };
}

export async function assignTeacherToClass(formData: FormData) {
  await requireRole('ADMIN', 'TU');
  const teacherId = String(formData.get('teacherId') ?? '');
  const classroomId = String(formData.get('classroomId') ?? '');
  const [teacher, classroom] = await Promise.all([
    prisma.user.findUnique({ where: { id: teacherId }, select: { role: true } }),
    prisma.classroom.findUnique({ where: { id: classroomId }, select: { id: true } }),
  ]);
  if (teacher?.role !== 'TEACHER') throw new Error('Akun yang dipilih bukan guru.');
  if (!classroom) throw new Error('Kelas tidak ditemukan.');

  await prisma.teacherClassroom.upsert({
    where: { teacherId_classroomId: { teacherId, classroomId } },
    update: {},
    create: { teacherId, classroomId },
  });
  revalidateClassAssignments();
  return { success: true };
}

export async function removeTeacherFromClass(formData: FormData) {
  await requireRole('ADMIN', 'TU');
  const teacherId = String(formData.get('teacherId') ?? '');
  const classroomId = String(formData.get('classroomId') ?? '');
  const activeSchedule = await prisma.classTeachingSchedule.findFirst({
    where: { teacherId, classroomId, isActive: true },
    select: { id: true },
  });
  if (activeSchedule) throw new Error('Nonaktifkan jadwal mengajar kelas ini sebelum melepas guru.');
  await prisma.teacherClassroom.deleteMany({ where: { teacherId, classroomId } });
  revalidateClassAssignments();
  return { success: true };
}

export async function assignHomeroomTeacherToClass(formData: FormData) {
  await requireRole('ADMIN', 'TU');
  const teacherId = String(formData.get('teacherId') ?? '');
  const classroomId = String(formData.get('classroomId') ?? '');
  const [teacher, classroom, existingHomeroom] = await Promise.all([
    prisma.user.findUnique({ where: { id: teacherId }, select: { role: true } }),
    prisma.classroom.findUnique({ where: { id: classroomId }, select: { name: true } }),
    prisma.user.findFirst({
      where: { role: 'WALI_KELAS', homeroomClassId: classroomId, id: { not: teacherId } },
      select: { id: true },
    }),
  ]);
  if (teacher?.role !== 'WALI_KELAS') throw new Error('Akun yang dipilih bukan wali kelas.');
  if (!classroom) throw new Error('Kelas tidak ditemukan.');
  if (existingHomeroom) throw new Error('Kelas ini sudah memiliki wali kelas.');

  await prisma.user.update({
    where: { id: teacherId },
    data: { homeroomClassId: classroomId, waliKelasOf: classroom.name },
  });
  revalidateClassAssignments();
  return { success: true };
}

function revalidateClassAssignments() {
  revalidatePath('/dashboard/management');
  revalidatePath('/dashboard/management/class-assignments');
  revalidatePath('/dashboard/classrooms/schedules');
  revalidatePath('/dashboard/management/class-assignments');
  revalidatePath('/dashboard/teacher-agenda');
  revalidatePath('/dashboard/exams/recap');
  revalidatePath('/dashboard/walikelas');
}

export async function clearDemoAccounts() {
  await requireRole('ADMIN', 'TU');

  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@nesaka.demo' }, role: { in: ['STUDENT', 'TEACHER'] } },
    select: { id: true, email: true, role: true },
  });
  if (demoUsers.length === 0) return { deletedCount: 0 };

  const teacherIds = demoUsers.filter((user) => user.role === 'TEACHER').map((user) => user.id);
  if (teacherIds.length > 0) {
    const teacherWithCourses = await prisma.course.findFirst({
      where: { teacherId: { in: teacherIds } },
      select: { teacher: { select: { email: true } } },
    });
    if (teacherWithCourses) {
      throw new Error(`Akun guru demo ${teacherWithCourses.teacher.email} masih memiliki kelas. Hapus atau pindahkan kelas tersebut sebelum mengosongkan akun demo.`);
    }
  }

  const userIds = demoUsers.map((user) => user.id);
  const studentIds = demoUsers.filter((user) => user.role === 'STUDENT').map((user) => user.id);
  const deleted = await prisma.$transaction(async (tx) => {
    if (studentIds.length > 0) {
      await tx.submission.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.enrollment.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.dapodikForm.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.studentDocument.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.studentAttendance.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.examResult.deleteMany({ where: { studentId: { in: studentIds } } });
      await tx.dataCorrectionRequest.deleteMany({ where: { studentId: { in: studentIds } } });
    }
    return tx.user.deleteMany({ where: { id: { in: userIds } } });
  });

  revalidatePath('/dashboard/management');
  revalidatePath('/dashboard/students');
  revalidatePath('/dashboard/classrooms/schedules');
  revalidatePath('/dashboard/teacher-agenda');
  return { deletedCount: deleted.count };
}