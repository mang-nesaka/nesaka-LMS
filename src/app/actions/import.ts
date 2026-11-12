"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export interface StudentImportRow {
  name: string;
  email: string;
  password: string;
  classroomName: string;
  rowNumber?: number;
}

export interface StudentImportSkippedRow {
  rowNumber: number;
  email: string;
  reason: string;
}

export interface StudentImportResult {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  skippedRows: StudentImportSkippedRow[];
}

export async function importStudentsCSVBatch(rows: StudentImportRow[], isFinalBatch: boolean): Promise<StudentImportResult> {
  await requireRole('TU', 'ADMIN');

  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 25) {
    throw new Error('Data impor harus berisi 1 sampai 25 baris per proses.');
  }

  const uniqueRows = new Map<string, StudentImportRow>();
  const skippedRows: StudentImportSkippedRow[] = [];
  for (const [index, row] of rows.entries()) {
    const name = typeof row?.name === 'string' ? row.name.trim() : '';
    const email = typeof row?.email === 'string' ? row.email.trim() : '';
    const password = typeof row?.password === 'string' ? row.password.trim() : '';
    const classroomName = typeof row?.classroomName === 'string' ? row.classroomName.trim() : '';
    const rowNumber = row?.rowNumber ?? index + 2;
    const missingFields = [
      !name && 'name',
      !email && 'email',
      !password && 'password',
    ].filter((field): field is string => Boolean(field));
    if (missingFields.length) {
      skippedRows.push({ rowNumber, email, reason: `Kolom ${missingFields.join(', ')} kosong.` });
      continue;
    }
    if (uniqueRows.has(email)) {
      skippedRows.push({ rowNumber, email, reason: 'Email duplikat di dalam file.' });
      continue;
    }
    uniqueRows.set(email, { name, email, password, classroomName, rowNumber });
  }

  const validRows = [...uniqueRows.values()];
  if (!validRows.length) {
    return { createdCount: 0, updatedCount: 0, skippedCount: skippedRows.length, skippedRows };
  }

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: validRows.map((row) => row.email) } },
    select: { email: true, role: true },
  });
  const existingByEmail = new Map(existingUsers.map((user) => [user.email, user]));
  const importableRows = validRows.filter((row) => {
    const existing = existingByEmail.get(row.email);
    if (existing && existing.role !== 'STUDENT') {
      skippedRows.push({
        rowNumber: row.rowNumber ?? 0,
        email: row.email,
        reason: `Email sudah digunakan akun dengan peran ${existing.role}.`,
      });
      return false;
    }
    return true;
  });

  const classroomNames = [...new Set(importableRows.map((row) => row.classroomName).filter(Boolean))];
  const [classrooms, courses, hashedRows] = await Promise.all([
    classroomNames.length
      ? prisma.classroom.findMany({
        where: { name: { in: classroomNames } },
        select: { id: true, name: true },
      })
      : Promise.resolve([]),
    classroomNames.length
      ? prisma.course.findMany({
        where: { title: { in: classroomNames } },
        select: { id: true, title: true },
      })
      : Promise.resolve([]),
    Promise.all(importableRows.map(async (row) => ({
      ...row,
      passwordHash: await bcrypt.hash(row.password, 12),
    }))),
  ]);
  const classroomByName = new Map(classrooms.map((classroom) => [classroom.name, classroom]));
  const courseByTitle = new Map(courses.map((course) => [course.title, course]));

  const importedUsers = await Promise.all(hashedRows.map(async (row) => {
    const classroom = classroomByName.get(row.classroomName);
    const user = await prisma.user.upsert({
      where: { email: row.email },
      update: {
        name: row.name,
        password: row.passwordHash,
        ...(classroom ? { classroomId: classroom.id, studentClass: classroom.name } : {}),
      },
      create: {
        name: row.name,
        email: row.email,
        password: row.passwordHash,
        role: 'STUDENT',
        ...(classroom ? { classroomId: classroom.id, studentClass: classroom.name } : {}),
      },
      select: { id: true },
    });
    const course = courseByTitle.get(row.classroomName);
    return course ? { studentId: user.id, courseId: course.id } : null;
  }));

  const enrollments = importedUsers.filter((enrollment): enrollment is NonNullable<typeof enrollment> => enrollment !== null);
  for (let start = 0; start < enrollments.length; start += 500) {
    await prisma.enrollment.createMany({
      data: enrollments.slice(start, start + 500),
      skipDuplicates: true,
    });
  }

  if (isFinalBatch) {
    revalidatePath('/dashboard/students');
    revalidatePath('/dashboard/management');
    revalidatePath('/dashboard/management/class-assignments');
    revalidatePath('/dashboard/assignments');
  }

  return {
    createdCount: importableRows.filter((row) => !existingByEmail.has(row.email)).length,
    updatedCount: importableRows.filter((row) => existingByEmail.has(row.email)).length,
    skippedCount: skippedRows.length,
    skippedRows,
  };
}
