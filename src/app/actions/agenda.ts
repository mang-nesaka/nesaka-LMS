"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

function getLocalDateString(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getClassrooms() {
  return await prisma.classroom.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createClassroom(formData: FormData) {
  const name = formData.get('name') as string;
  const level = (formData.get('level') as string) || '10';
  const code = (formData.get('code') as string) || `NESAKA-${name.toUpperCase().replace(/\s+/g, '-')}`;

  await prisma.classroom.create({
    data: {
      name,
      level,
      code,
    },
  });

  revalidatePath('/dashboard/classrooms');
  return { success: true, message: `Ruang kelas ${name} berhasil ditambahkan.` };
}

export async function scanBarcodeAndSubmitAgenda(data: {
  teacherId: string;
  barcodeCode: string;
  subject: string;
  scheduledStartTime: string; // e.g. "07:30"
  scheduledEndTime: string;   // e.g. "09:30"
  teachingMaterial: string;   // Materi yang diajarkan
  notes?: string;
}) {
  const { teacherId, barcodeCode, subject, scheduledStartTime, scheduledEndTime, teachingMaterial, notes } = data;
  const todayStr = getLocalDateString();

  // 1. Cari kelas berdasarkan Barcode Code
  const classroom = await prisma.classroom.findUnique({
    where: { code: barcodeCode.trim() },
  });

  if (!classroom) {
    return {
      error: `Barcode Ruang Kelas Tidak Valid! Kode "${barcodeCode}" tidak ditemukan di database sekolah.`,
    };
  }

  // 2. Hitung Waktu dan Keterlambatan
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  const currentTotalMinutes = wibDate.getHours() * 60 + wibDate.getMinutes();

  const [schedH, schedM] = scheduledStartTime.split(':').map(Number);
  const schedTotalMinutes = schedH * 60 + schedM;

  let isLate = false;
  let lateMinutes = 0;

  if (currentTotalMinutes > schedTotalMinutes) {
    isLate = true;
    lateMinutes = currentTotalMinutes - schedTotalMinutes;
  }

  // 3. Simpan Agenda Guru Mengajar
  const agenda = await prisma.teacherClassAgenda.create({
    data: {
      teacherId,
      classroomId: classroom.id,
      subject,
      scheduledStartTime,
      scheduledEndTime,
      scanTime: now,
      isLate,
      lateMinutes,
      teachingMaterial,
      notes,
      date: todayStr,
    },
    include: {
      classroom: true,
      teacher: {
        select: { name: true, email: true },
      },
    },
  });

  revalidatePath('/dashboard/teacher-agenda');
  revalidatePath('/dashboard/monitoring');
  revalidatePath('/dashboard');

  return {
    success: true,
    isLate,
    lateMinutes,
    classroomName: classroom.name,
    message: isLate
      ? `Barcode Kelas "${classroom.name}" Berhasil Discan! Agenda tersimpan. Catatan: Terlambat masuk kelas ${lateMinutes} menit (Jadwal: ${scheduledStartTime} WIB).`
      : `Barcode Kelas "${classroom.name}" Berhasil Discan Tepat Waktu! Agenda mengajar Anda berhasil diaktifkan.`,
    agenda,
  };
}

export async function getTeacherTodayAgendas(teacherId: string) {
  const todayStr = getLocalDateString();
  return await prisma.teacherClassAgenda.findMany({
    where: {
      teacherId,
      date: todayStr,
    },
    include: {
      classroom: true,
    },
    orderBy: { scanTime: 'desc' },
  });
}

// Untuk Monitoring Real-time Kepala Sekolah & Waka Kurikulum
export async function getRealtimeAgendasToday() {
  const todayStr = getLocalDateString();
  return await prisma.teacherClassAgenda.findMany({
    where: {
      date: todayStr,
    },
    include: {
      classroom: true,
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { scanTime: 'desc' },
  });
}
