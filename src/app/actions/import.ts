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
  
  // Asumsi CSV header: name, email, password
  // Row 0 adalah header, kita lewati.
  const usersToCreate = [];

  for (let i = 1; i < rows.length; i++) {
    const columns = rows[i].split(',');
    if (columns.length >= 3) {
      const name = columns[0].trim();
      const email = columns[1].trim();
      const password = columns[2].trim();

      if (name && email && password) {
        usersToCreate.push({
          name,
          email,
          password, // Pada produksi, harus di-hash
          role: 'STUDENT'
        });
      }
    }
  }

  if (usersToCreate.length === 0) {
    throw new Error('Tidak ada data valid yang ditemukan di file CSV.');
  }

  // Insert semua data siswa
  // Menggunakan createMany untuk bulk insert
  await prisma.user.createMany({
    data: usersToCreate,
    skipDuplicates: true, // Lewati jika email sudah ada
  });

  revalidatePath('/dashboard/students');
}
