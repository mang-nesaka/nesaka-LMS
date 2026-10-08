"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function createAssignment(formData: FormData) {
  const courseId = formData.get('courseId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDateStr = formData.get('dueDate') as string;

  if (!courseId || !title) {
    return { error: 'Data tidak lengkap.' };
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
  const id = formData.get('id') as string;
  
  if (id) {
    await prisma.assignment.delete({
      where: { id }
    });
    revalidatePath('/dashboard/assignments');
  }
}
