"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function createCourse(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const cookieStore = await cookies();
  const teacherId = cookieStore.get('auth_token')?.value;

  if (!title || !teacherId) {
    return { error: 'Judul dan ID Guru tidak valid.' };
  }

  await prisma.course.create({
    data: {
      title,
      description,
      teacherId,
    },
  });

  revalidatePath('/dashboard/courses');
}

export async function deleteCourse(formData: FormData) {
  const id = formData.get('id') as string;
  
  if (id) {
    await prisma.course.delete({
      where: { id }
    });
    revalidatePath('/dashboard/courses');
  }
}
