"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function importStudentsCSV(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    throw new Error('Tidak terautentikasi.');
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (currentUser?.role !== 'TU' && currentUser?.role !== 'ADMIN') {
    throw new Error('Akses ditolak. Hanya TU atau Admin yang bisa import.');
  }

  const file = formData.get('file') as File;
  if (!file || file.name === 'undefined') {
    throw new Error('File tidak ditemukan.');
  }

  const text = await file.text();
  const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
  
  // Asumsi CSV header: name, email, password, nama_kelas
  let successCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const columns = rows[i].split(',');
    if (columns.length >= 3) {
      const name = columns[0].trim();
      const email = columns[1].trim();
      const password = columns[2].trim();
      const courseTitle = columns.length >= 4 ? columns[3].trim() : null;

      if (name && email && password) {
        // 1. Buat atau update User (Siswa)
        const user = await prisma.user.upsert({
          where: { email },
          update: { name, password },
          create: { name, email, password, role: 'STUDENT' }
        });

        // 2. Jika ada nama_kelas di CSV, masukkan siswa ke kelas tersebut
        if (courseTitle) {
          // Cari ID kelas berdasarkan nama kelasnya
          const course = await prisma.course.findFirst({
            where: { title: courseTitle }
          });

          if (course) {
            // Mendaftarkan siswa ke kelas tersebut (Enrollment)
            // Cek apakah sudah terdaftar
            const existingEnrollment = await prisma.enrollment.findUnique({
              where: {
                studentId_courseId: {
                  studentId: user.id,
                  courseId: course.id,
                }
              }
            });

            if (!existingEnrollment) {
              await prisma.enrollment.create({
                data: {
                  studentId: user.id,
                  courseId: course.id,
                }
              });
            }
          }
        }
        successCount++;
      }
    }
  }

  if (successCount === 0) {
    throw new Error('Tidak ada data valid yang ditemukan di file CSV.');
  }

  revalidatePath('/dashboard/students');
  revalidatePath('/dashboard/assignments');
}
