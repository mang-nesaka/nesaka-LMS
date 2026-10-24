"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Haversine formula to calculate distance in meters between two coordinates
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Format local date YYYY-MM-DD
function getLocalDateString(): string {
  const now = new Date();
  // Adjust to local time (WIB / UTC+7)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getSchoolSetting() {
  let setting = await prisma.schoolSetting.findUnique({
    where: { id: 'default' },
  });

  if (!setting) {
    setting = await prisma.schoolSetting.create({
      data: {
        id: 'default',
        schoolName: 'SMK Nesaka (SMKN 1)',
        schoolLat: -6.9175,
        schoolLng: 107.6191,
        radiusMeters: 200.0,
        checkInStartTime: '06:30',
        checkInLateTime: '07:00',
        checkOutStartTime: '15:00',
      },
    });
  }

  return setting;
}

export async function updateSchoolSetting(formData: FormData) {
  const schoolName = formData.get('schoolName') as string;
  const schoolLat = parseFloat(formData.get('schoolLat') as string);
  const schoolLng = parseFloat(formData.get('schoolLng') as string);
  const radiusMeters = parseFloat(formData.get('radiusMeters') as string) || 200.0;
  const checkInStartTime = formData.get('checkInStartTime') as string || '06:30';
  const checkInLateTime = formData.get('checkInLateTime') as string || '07:00';
  const checkOutStartTime = formData.get('checkOutStartTime') as string || '15:00';

  await prisma.schoolSetting.upsert({
    where: { id: 'default' },
    update: {
      schoolName,
      schoolLat,
      schoolLng,
      radiusMeters,
      checkInStartTime,
      checkInLateTime,
      checkOutStartTime,
    },
    create: {
      id: 'default',
      schoolName,
      schoolLat,
      schoolLng,
      radiusMeters,
      checkInStartTime,
      checkInLateTime,
      checkOutStartTime,
    },
  });

  revalidatePath('/dashboard/settings/school');
  return { success: true, message: 'Pengaturan lokasi & jam sekolah berhasil diperbarui.' };
}

export async function getStudentTodayAttendance(studentId: string) {
  const dateStr = getLocalDateString();
  const attendance = await prisma.studentAttendance.findUnique({
    where: {
      studentId_date: {
        studentId,
        date: dateStr,
      },
    },
  });

  const setting = await getSchoolSetting();

  return { attendance, setting, today: dateStr };
}

export async function submitStudentAttendance(data: {
  studentId: string;
  type: 'IN' | 'OUT';
  lat: number;
  lng: number;
  photoBase64: string;
}) {
  const { studentId, type, lat, lng, photoBase64 } = data;
  const dateStr = getLocalDateString();
  const setting = await getSchoolSetting();

  // 1. Validasi Radius Geolocation
  const distanceMeters = calculateDistanceMeters(lat, lng, setting.schoolLat, setting.schoolLng);

  if (distanceMeters > setting.radiusMeters) {
    return {
      error: `Presensi Ditolak! Anda berada di luar radius sekolah. Jarak Anda saat ini: ${distanceMeters} meter (Maksimal diperbolehkan: ${setting.radiusMeters} meter).`,
    };
  }

  // Waktu sekarang WIB
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  const currentHour = wibDate.getHours();
  const currentMinute = wibDate.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  if (type === 'IN') {
    // Parse checkInStartTime (default 06:30)
    const [startH, startM] = setting.checkInStartTime.split(':').map(Number);
    const startTotalMinutes = startH * 60 + startM;

    if (currentTotalMinutes < startTotalMinutes) {
      return {
        error: `Presensi pagi belum dibuka. Presensi masuk dimulai pukul ${setting.checkInStartTime} WIB.`,
      };
    }

    // Parse checkInLateTime (default 07:00)
    const [lateH, lateM] = setting.checkInLateTime.split(':').map(Number);
    const lateTotalMinutes = lateH * 60 + lateM;

    let checkInStatus = 'HADIR';
    let checkInLateMinutes = 0;

    if (currentTotalMinutes >= lateTotalMinutes) {
      checkInStatus = 'TERLAMBAT';
      checkInLateMinutes = currentTotalMinutes - lateTotalMinutes;
    }

    await prisma.studentAttendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: dateStr,
        },
      },
      update: {
        checkInTime: now,
        checkInPhoto: photoBase64,
        checkInLat: lat,
        checkInLng: lng,
        checkInDistance: distanceMeters,
        checkInStatus,
        checkInLateMinutes,
      },
      create: {
        studentId,
        date: dateStr,
        checkInTime: now,
        checkInPhoto: photoBase64,
        checkInLat: lat,
        checkInLng: lng,
        checkInDistance: distanceMeters,
        checkInStatus,
        checkInLateMinutes,
      },
    });

    revalidatePath('/dashboard/attendance');
    return {
      success: true,
      status: checkInStatus,
      lateMinutes: checkInLateMinutes,
      message: checkInStatus === 'TERLAMBAT'
        ? `Presensi Masuk Berhasil! Anda tercatat TERLAMBAT (${checkInLateMinutes} menit). Jarak: ${distanceMeters}m.`
        : `Presensi Masuk Berhasil Tepat Waktu (HADIR)! Jarak: ${distanceMeters}m.`,
    };
  } else {
    // Presensi Pulang (OUT)
    const [outH, outM] = setting.checkOutStartTime.split(':').map(Number);
    const outTotalMinutes = outH * 60 + outM;

    let checkOutStatus = 'PULANG';
    if (currentTotalMinutes < outTotalMinutes) {
      checkOutStatus = 'BOLOS'; // Siswa pulang sebelum jam 15:00
    }

    await prisma.studentAttendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: dateStr,
        },
      },
      update: {
        checkOutTime: now,
        checkOutPhoto: photoBase64,
        checkOutLat: lat,
        checkOutLng: lng,
        checkOutStatus,
      },
      create: {
        studentId,
        date: dateStr,
        checkOutTime: now,
        checkOutPhoto: photoBase64,
        checkOutLat: lat,
        checkOutLng: lng,
        checkOutStatus,
        checkInStatus: 'ALPA', // Tidak pernah absen masuk
      },
    });

    revalidatePath('/dashboard/attendance');
    return {
      success: true,
      status: checkOutStatus,
      message: checkOutStatus === 'BOLOS'
        ? `Presensi Pulang Tercatat: Anda absen sebelum pukul ${setting.checkOutStartTime} WIB (Status: BOLOS / Pulang Lebih Awal).`
        : `Presensi Pulang Berhasil! Terima kasih dan hati-hati di jalan.`,
    };
  }
}

export async function getClassAttendanceRecap(options: {
  className?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'semester';
  date?: string;
}) {
  const { className, period } = options;
  const now = new Date();
  const todayStr = getLocalDateString();

  // Query students
  const studentWhere: any = { role: 'STUDENT' };
  if (className && className !== 'ALL') {
    studentWhere.studentClass = className;
  }

  const students = await prisma.user.findMany({
    where: studentWhere,
    select: {
      id: true,
      name: true,
      email: true,
      studentClass: true,
      nipOrNis: true,
      attendances: {
        orderBy: { date: 'desc' },
        take: period === 'daily' ? 1 : period === 'weekly' ? 7 : period === 'monthly' ? 30 : 120,
      },
    },
    orderBy: { name: 'asc' },
  });

  return { students, today: todayStr };
}
