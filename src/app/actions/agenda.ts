"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { findActiveSchedule, findNextSchedule } from '@/lib/classSchedule';


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
  await requireRole('ADMIN', 'TU', 'TEACHER', 'WALI_KELAS', 'KEPSEK', 'WAKA_KURIKULUM', 'WAKA_SARPRAS');
  return await prisma.classroom.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createClassroom(formData: FormData) {
  await requireRole('ADMIN', 'TU', 'WAKA_KURIKULUM', 'WAKA_SARPRAS');
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

export async function getClassSchedules() {
  await requireRole('ADMIN', 'TU');
  return prisma.classTeachingSchedule.findMany({
    include: {
      classroom: { select: { id: true, name: true, code: true } },
      teacher: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
}

export async function createClassSchedule(formData: FormData) {
  await requireRole('ADMIN', 'TU');
  const teacherId = String(formData.get('teacherId') ?? '');
  const classroomId = String(formData.get('classroomId') ?? '');
  const subject = String(formData.get('subject') ?? '').trim();
  const dayOfWeek = Number(formData.get('dayOfWeek'));
  const startTime = String(formData.get('startTime') ?? '');
  const endTime = String(formData.get('endTime') ?? '');

  if (!teacherId || !classroomId || !subject || !Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('Guru, ruang, mata pelajaran, dan hari wajib dipilih.');
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) || startTime >= endTime) {
    throw new Error('Rentang waktu jadwal tidak valid.');
  }

  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { role: true },
  });
  if (teacher?.role !== 'TEACHER') throw new Error('Pengguna yang dipilih bukan Guru Mapel.');
  const classroom = await prisma.classroom.findUnique({ where: { id: classroomId }, select: { id: true } });
  if (!classroom) throw new Error('Ruang kelas tidak ditemukan.');

  const conflict = await prisma.classTeachingSchedule.findFirst({
    where: {
      isActive: true,
      dayOfWeek,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      OR: [{ teacherId }, { classroomId }],
    },
    select: { id: true },
  });
  if (conflict) throw new Error('Jadwal bentrok dengan jadwal guru atau ruang yang sudah ada.');

  await prisma.classTeachingSchedule.create({
    data: { teacherId, classroomId, subject, dayOfWeek, startTime, endTime },
  });
  revalidatePath('/dashboard/classrooms/schedules');
  revalidatePath('/dashboard/teacher-agenda');
  return { success: true };
}

export async function deactivateClassSchedule(scheduleId: string) {
  await requireRole('ADMIN', 'TU');
  if (!scheduleId) throw new Error('Jadwal tidak valid.');
  await prisma.classTeachingSchedule.update({
    where: { id: scheduleId },
    data: { isActive: false },
  });
  revalidatePath('/dashboard/classrooms/schedules');
  revalidatePath('/dashboard/teacher-agenda');
  return { success: true };
}

export async function getTeacherTodaySchedules() {
  const teacher = await requireRole('TEACHER');
  const dayOfWeek = getLocalDayOfWeek();
  return prisma.classTeachingSchedule.findMany({
    where: { teacherId: teacher.id, dayOfWeek, isActive: true },
    include: { classroom: { select: { name: true, code: true } } },
    orderBy: { startTime: 'asc' },
  });
}

export async function getTeacherAgendaDashboard() {
  const teacher = await requireRole('TEACHER');
  const today = getLocalDateString();
  const dayOfWeek = getLocalDayOfWeek();
  const [schedules, agendas] = await prisma.$transaction([
    prisma.classTeachingSchedule.findMany({
      where: { teacherId: teacher.id, dayOfWeek, isActive: true },
      include: { classroom: { select: { name: true, code: true } } },
      orderBy: { startTime: 'asc' },
    }),
    prisma.teacherClassAgenda.findMany({
      where: { teacherId: teacher.id, date: today },
      include: { classroom: true, classSchedule: { select: { id: true } } },
      orderBy: { scanTime: 'desc' },
    }),
  ]);
  return { schedules, agendas };
}

function getLocalDayOfWeek(): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000).getDay();
}

export async function scanBarcodeAndSubmitAgenda(data: {
  barcodeCode: string;
  teachingMaterial: string;   // Materi yang diajarkan
  notes?: string;
}) {
  const teacher = await requireRole('TEACHER');
  const { barcodeCode, teachingMaterial, notes } = data;
  const todayStr = getLocalDateString();
  const schedules = await prisma.classTeachingSchedule.findMany({
    where: {
      teacherId: teacher.id,
      dayOfWeek: getLocalDayOfWeek(),
      isActive: true,
    },
    include: { classroom: true },
    orderBy: { startTime: 'asc' },
  });

  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  const currentTime = `${String(wibDate.getHours()).padStart(2, '0')}:${String(wibDate.getMinutes()).padStart(2, '0')}`;
  const schedule = findActiveSchedule(schedules, currentTime);

  if (!schedule) {
    const nextSchedule = findNextSchedule(schedules, currentTime);
    if (nextSchedule) return { error: `Jadwal berikutnya mulai pukul ${nextSchedule.startTime} WIB di ${nextSchedule.classroom.name}.` };
    return { error: 'Tidak ada jadwal mengajar aktif pada waktu ini.' };
  }
  if (schedule.classroom.code.trim().toLowerCase() !== barcodeCode.trim().toLowerCase()) {
    return { error: `QR tidak sesuai. Jadwal saat ini berada di ${schedule.classroom.name}.` };
  }

  const existingAgenda = await prisma.teacherClassAgenda.findFirst({
    where: { classScheduleId: schedule.id, date: todayStr },
    select: { id: true },
  });
  if (existingAgenda) return { error: 'Jadwal ini sudah discan hari ini.' };

  if (!teachingMaterial.trim()) return { error: 'Materi pembelajaran wajib diisi.' };
  const { classroom } = schedule;
  const { subject, startTime: scheduledStartTime, endTime: scheduledEndTime } = schedule;

  // 2. Hitung Waktu dan Keterlambatan
  const currentTotalMinutes = wibDate.getHours() * 60 + wibDate.getMinutes();

  const [schedH, schedM] = scheduledStartTime.split(':').map(Number);
  const schedTotalMinutes = schedH * 60 + schedM;
  const [endH, endM] = scheduledEndTime.split(':').map(Number);
  const endTotalMinutes = endH * 60 + endM;

  if (currentTotalMinutes >= endTotalMinutes) {
    return { error: `Waktu jadwal ini berakhir pukul ${scheduledEndTime} WIB.` };
  }

  let isLate = false;
  let lateMinutes = 0;

  if (currentTotalMinutes > schedTotalMinutes) {
    isLate = true;
    lateMinutes = currentTotalMinutes - schedTotalMinutes;
  }

  // 3. Simpan Agenda Guru Mengajar
  const agenda = await prisma.teacherClassAgenda.create({
    data: {
      teacherId: teacher.id,
      classroomId: classroom.id,
      classScheduleId: schedule.id,
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

export async function getTeacherTodayAgendas() {
  const teacher = await requireRole('TEACHER');
  const todayStr = getLocalDateString();
  return await prisma.teacherClassAgenda.findMany({
    where: {
      teacherId: teacher.id,
      date: todayStr,
    },
    include: {
      classroom: true,
      classSchedule: { select: { id: true } },
    },
    orderBy: { scanTime: 'desc' },
  });
}

// Untuk Monitoring Real-time Kepala Sekolah & Waka Kurikulum
export async function getRealtimeAgendasToday() {
  await requireRole('KEPSEK', 'WAKA_KURIKULUM', 'ADMIN', 'TU');
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
