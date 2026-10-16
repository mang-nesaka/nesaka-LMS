"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function createCourse(formData: FormData) {
  const cookieStore = await cookies();
  const teacherId = cookieStore.get('auth_token')?.value;

  if (!teacherId) {
    throw new Error('Anda harus login terlebih dahulu.');
  }

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
      teacherId,
    },
  });

  revalidatePath('/dashboard/courses');
  return { success: true };
}

export async function deleteCourse(formData: FormData) {
  const id = formData.get('id') as string;
  
  if (id) {
    // Hapus submissions, assignments, enrollments, lessons terkait sebelum hapus course
    await prisma.submission.deleteMany({
      where: { assignment: { lesson: { courseId: id } } }
    });
    await prisma.assignment.deleteMany({
      where: { lesson: { courseId: id } }
    });
    await prisma.lesson.deleteMany({
      where: { courseId: id }
    });
    await prisma.enrollment.deleteMany({
      where: { courseId: id }
    });
    await prisma.course.delete({
      where: { id }
    });
    revalidatePath('/dashboard/courses');
  }
}

export async function joinCourseAction(courseId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    redirect(`/login?redirect=/join/${courseId}`);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== 'STUDENT') {
    throw new Error('Hanya akun Siswa yang dapat bergabung ke dalam kelas.');
  }

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
