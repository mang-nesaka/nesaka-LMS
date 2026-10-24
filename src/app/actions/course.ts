"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';


export async function createCourse(formData: FormData) {
  const currentUser = await requireRole('TEACHER', 'ADMIN');

  const subject = (formData.get('subject') as string)?.trim();
  const targetClass = (formData.get('targetClass') as string)?.trim();
  const customTitle = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();

  // Susun judul kelas: contoh "Matematika - Kelas X TKRO 1"
  let title = customTitle;
  if (!title && subject && targetClass) {
    title = `${subject} (${targetClass})`;
  } else if (!title && subject) {
    title = subject;
  }

  if (!title) {
    throw new Error('Nama mata pelajaran atau judul kelas wajib diisi.');
  }

  await prisma.course.create({
    data: {
      title,
      description: description || `Kelas untuk ${targetClass || 'semua siswa'}`,
      teacherId: currentUser.id,
    },
  });

  revalidatePath('/dashboard/courses');
  return { success: true };
}

export async function deleteCourse(formData: FormData) {
  const currentUser = await requireRole('TEACHER', 'ADMIN');
  const id = formData.get('id') as string;

  if (!id) throw new Error('ID kelas tidak valid.');

  const course = await prisma.course.findUnique({
    where: { id },
    select: { teacherId: true },
  });
  if (!course) throw new Error('Kelas tidak ditemukan.');
  if (currentUser.role !== 'ADMIN' && course.teacherId !== currentUser.id) {
    throw new Error('Anda hanya dapat menghapus kelas yang Anda kelola.');
  }

  await prisma.$transaction([
    prisma.submission.deleteMany({ where: { assignment: { lesson: { courseId: id } } } }),
    prisma.assignment.deleteMany({ where: { lesson: { courseId: id } } }),
    prisma.lesson.deleteMany({ where: { courseId: id } }),
    prisma.enrollment.deleteMany({ where: { courseId: id } }),
    prisma.course.delete({ where: { id } }),
  ]);
  revalidatePath('/dashboard/courses');
}

export async function joinCourseAction(courseId: string) {
  const { id: userId } = await requireRole('STUDENT');

  // Cek apakah sudah terdaftar
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: userId,
        courseId,
      }
    }
  });

  if (!existing) {
    await prisma.enrollment.create({
      data: {
        studentId: userId,
        courseId,
      }
    });
  }

  revalidatePath('/dashboard/courses');
  revalidatePath('/dashboard/assignments');
  return { success: true };
}
