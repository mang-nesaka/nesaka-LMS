"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';


export async function createAssignment(formData: FormData) {
  const currentUser = await requireRole('TEACHER', 'ADMIN');
  const courseId = formData.get('courseId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDateStr = formData.get('dueDate') as string;

  if (!courseId || !title) {
    throw new Error('Data tidak lengkap.');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { teacherId: true },
  });
  if (!course) throw new Error('Kelas tidak ditemukan.');
  if (currentUser.role !== 'ADMIN' && course.teacherId !== currentUser.id) {
    throw new Error('Anda hanya dapat membuat tugas di kelas yang Anda kelola.');
  }

  // Karena Assignment di skema terhubung ke Lesson, kita cek apakah sudah ada Lesson di Course ini
  let lesson = await prisma.lesson.findFirst({
    where: { courseId }
  });

  // Jika belum ada, buat Lesson "Materi Umum"
  if (!lesson) {
    lesson = await prisma.lesson.create({
      data: {
        title: 'Materi Umum',
        courseId: courseId,
      }
    });
  }

  await prisma.assignment.create({
    data: {
      title,
      description,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      lessonId: lesson.id,
    },
  });

  revalidatePath('/dashboard/assignments');
}

export async function deleteAssignment(formData: FormData) {
  const currentUser = await requireRole('TEACHER', 'ADMIN');
  const id = formData.get('id') as string;
  
  if (!id) throw new Error('ID tugas tidak valid.');

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    select: { lesson: { select: { course: { select: { teacherId: true } } } } },
  });
  if (!assignment) throw new Error('Tugas tidak ditemukan.');
  if (currentUser.role !== 'ADMIN' && assignment.lesson.course.teacherId !== currentUser.id) {
    throw new Error('Anda hanya dapat menghapus tugas dari kelas yang Anda kelola.');
  }

  await prisma.assignment.delete({ where: { id } });
  revalidatePath('/dashboard/assignments');
}
