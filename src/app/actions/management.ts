"use server";

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { getNextClassLevel } from '@/lib/studentPromotion';

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

export async function promoteStudentsInBulk(formData: FormData) {
  await requireRole('ADMIN', 'TU');

  const mode = String(formData.get('mode') ?? '');
  const excludedStudentIds = parseExcludedStudentIds(formData);
  if (mode === 'graduate') {
    const graduationYear = Number(formData.get('graduationYear'));
    if (!Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > 2100) {
      throw new Error('Tahun kelulusan harus antara 2000 dan 2100.');
    }
    if (excludedStudentIds.length) {
      const validExclusions = await prisma.user.count({
        where: {
          id: { in: excludedStudentIds },
          role: 'STUDENT',
          graduationYear: null,
          classroom: { level: '12' },
        },
      });
      if (validExclusions !== excludedStudentIds.length) {
        throw new Error('Daftar pengecualian kelas XII sudah berubah. Muat ulang halaman dan coba kembali.');
      }
    }

    const result = await prisma.user.updateMany({
      where: {
        role: 'STUDENT',
        graduationYear: null,
        classroom: { level: '12' },
        ...(excludedStudentIds.length ? { id: { notIn: excludedStudentIds } } : {}),
      },
      data: { graduationYear, classroomId: null, studentClass: null },
    });
    revalidateStudentLists();
    return { changedCount: result.count };
  }

  if (mode !== 'promote') throw new Error('Jenis proses kenaikan kelas tidak valid.');

  const sourceLevel = String(formData.get('sourceLevel') ?? '');
  const targetLevel = getNextClassLevel(sourceLevel);
  if (!targetLevel) throw new Error('Kenaikan hanya dapat dilakukan dari kelas X atau XI.');

  let mappings: Array<{ sourceId: string; targetId: string }>;
  try {
    const parsed: unknown = JSON.parse(String(formData.get('mappings') ?? ''));
    if (!Array.isArray(parsed)) throw new Error();
    mappings = parsed.map((entry) => {
      if (
        !entry ||
        typeof entry !== 'object' ||
        typeof entry.sourceId !== 'string' ||
        typeof entry.targetId !== 'string'
      ) throw new Error();
      return { sourceId: entry.sourceId, targetId: entry.targetId };
    });
  } catch {
    throw new Error('Pemetaan kelas tidak valid. Muat ulang halaman dan coba kembali.');
  }

  if (!mappings.length || mappings.length > 100) throw new Error('Tidak ada pemetaan kelas yang dapat diproses.');
  const sourceIds = mappings.map((mapping) => mapping.sourceId);
  const targetIds = mappings.map((mapping) => mapping.targetId);
  if (new Set(sourceIds).size !== sourceIds.length || new Set(targetIds).size !== targetIds.length) {
    throw new Error('Setiap kelas harus memiliki tujuan yang berbeda.');
  }

  const classrooms = await prisma.classroom.findMany({
    where: { id: { in: [...sourceIds, ...targetIds] } },
    select: { id: true, name: true, level: true },
  });
  const classroomById = new Map(classrooms.map((classroom) => [classroom.id, classroom]));
  if (classrooms.length !== new Set([...sourceIds, ...targetIds]).size) {
    throw new Error('Salah satu kelas tidak ditemukan. Muat ulang halaman dan coba kembali.');
  }
  for (const mapping of mappings) {
    if (
      classroomById.get(mapping.sourceId)?.level !== sourceLevel ||
      classroomById.get(mapping.targetId)?.level !== targetLevel
    ) throw new Error('Pemetaan harus menghubungkan kelas ke tingkat berikutnya.');
  }

  const activeSourceStudents = await prisma.user.findMany({
    where: { role: 'STUDENT', graduationYear: null, classroom: { level: sourceLevel } },
    select: { id: true, classroomId: true },
  });
  const activeSourceStudentIds = new Set(activeSourceStudents.map((student) => student.id));
  if (excludedStudentIds.some((studentId) => !activeSourceStudentIds.has(studentId))) {
    throw new Error('Daftar siswa yang dikecualikan sudah berubah. Muat ulang halaman dan coba kembali.');
  }
  const mappedSourceIds = new Set(sourceIds);
  if (activeSourceStudents.some((student) =>
    student.classroomId &&
    !excludedStudentIds.includes(student.id) &&
    !mappedSourceIds.has(student.classroomId)
  )) {
    throw new Error('Semua kelas yang memiliki siswa harus dipetakan sebelum diproses.');
  }
  const occupiedTarget = await prisma.user.findFirst({
    where: {
      role: 'STUDENT',
      graduationYear: null,
      classroomId: { in: targetIds },
    },
    select: { id: true },
  });
  if (occupiedTarget) {
    throw new Error('Kelas tujuan masih berisi siswa. Proses angkatan di kelas tujuan terlebih dahulu.');
  }

  const updates = mappings.map(({ sourceId, targetId }) => {
    const target = classroomById.get(targetId);
    if (!target) throw new Error('Kelas tujuan tidak ditemukan.');
    return prisma.user.updateMany({
      where: {
        role: 'STUDENT',
        graduationYear: null,
        classroomId: sourceId,
        ...(excludedStudentIds.length ? { id: { notIn: excludedStudentIds } } : {}),
      },
      data: { classroomId: targetId, studentClass: target.name },
    });
  });
  const results = await prisma.$transaction(updates);
  revalidateStudentLists();
  return { changedCount: results.reduce((total, result) => total + result.count, 0) };
}

function parseExcludedStudentIds(formData: FormData): string[] {
  const rawIds = String(formData.get('excludedStudentIds') ?? '[]');
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawIds);
  } catch {
    throw new Error('Daftar pengecualian siswa tidak valid.');
  }
  if (
    !Array.isArray(parsed) ||
    parsed.length > 2000 ||
    parsed.some((studentId) => typeof studentId !== 'string' || !studentId) ||
    new Set(parsed).size !== parsed.length
  ) throw new Error('Daftar pengecualian siswa tidak valid.');
  return parsed;
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

function revalidateStudentLists() {
  revalidateClassAssignments();
  revalidatePath('/dashboard/students');
  revalidatePath('/dashboard/management');
  revalidatePath('/dashboard/dapodik');
  revalidatePath('/dashboard/ijazah');
  revalidatePath('/dashboard/attendance');
  revalidatePath('/dashboard/tu/non-smartphone');
  revalidatePath('/dashboard/kesiswaan');
  revalidatePath('/dashboard/documents');
  revalidatePath('/dashboard');
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