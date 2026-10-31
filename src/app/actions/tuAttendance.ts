"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { getSchoolSetting } from '@/app/actions/attendance';
import {
  parseStudentBarcodeIdentifier,
  evaluateTuAttendanceTime,
} from '@/lib/nonSmartphoneAttendance';
import { getNextAttendanceType } from '@/lib/attendance';

function getLocalDateString(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  const year = wibDate.getFullYear();
  const month = String(wibDate.getMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function findStudentByIdentifier(rawInput: string) {
  const parsed = parseStudentBarcodeIdentifier(rawInput);
  const candidateKeys = [
    parsed.extractedId,
    parsed.extractedNisn,
    parsed.cleaned,
    parsed.raw,
  ].filter(Boolean) as string[];

  if (candidateKeys.length === 0) return null;

  // Search by id, nipOrNis, or email, or Dapodik nisn / nis
  const student = await prisma.user.findFirst({
    where: {
      role: 'STUDENT',
      OR: [
        { id: { in: candidateKeys } },
        { nipOrNis: { in: candidateKeys } },
        { email: { in: candidateKeys } },
        { dapodikForm: { nisn: { in: candidateKeys } } },
        { dapodikForm: { nis: { in: candidateKeys } } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      studentClass: true,
      nipOrNis: true,
      hasSmartphone: true,
      avatarUrl: true,
      dapodikForm: {
        select: {
          nisn: true,
          nis: true,
          namaLengkap: true,
        },
      },
    },
  });

  return student;
}

export async function scanStudentBarcodeByTu(data: {
  barcodeOrIdentifier: string;
  attendanceType?: 'AUTO' | 'IN' | 'OUT';
  notes?: string;
}) {
  const currentTuUser = await requireRole('TU', 'ADMIN');
  const { barcodeOrIdentifier, attendanceType = 'AUTO', notes } = data;

  if (!barcodeOrIdentifier || !barcodeOrIdentifier.trim()) {
    return { error: 'Kode barcode atau identitas siswa tidak boleh kosong.' };
  }

  const student = await findStudentByIdentifier(barcodeOrIdentifier);
  if (!student) {
    return {
      error: `Siswa tidak ditemukan untuk barcode/kode "${barcodeOrIdentifier}". Pastikan barcode atau NISN/NIS siswa sesuai.`,
    };
  }

  const dateStr = getLocalDateString();
  const setting = await getSchoolSetting();

  // Ambil riwayat presensi hari ini
  const existingAttendance = await prisma.studentAttendance.findUnique({
    where: {
      studentId_date: {
        studentId: student.id,
        date: dateStr,
      },
    },
  });

  // Tentukan apakah masuk atau pulang
  let determinedType: 'IN' | 'OUT';
  if (attendanceType === 'AUTO') {
    const nextType = getNextAttendanceType(existingAttendance);
    if (!nextType) {
      return {
        error: `Siswa "${student.name}" sudah menyelesaikan presensi Masuk dan Pulang untuk hari ini (${dateStr}).`,
        student,
        attendance: existingAttendance,
      };
    }
    determinedType = nextType;
  } else {
    determinedType = attendanceType;
  }

  // Waktu WIB
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  const currentHour = wibDate.getHours();
  const currentMinute = wibDate.getMinutes();

  const evalResult = evaluateTuAttendanceTime({
    type: determinedType,
    currentHour,
    currentMinute,
    checkInStartTime: setting.checkInStartTime,
    checkInLateTime: setting.checkInLateTime,
    checkOutStartTime: setting.checkOutStartTime,
  });

  if (!evalResult.allowed) {
    return {
      error: evalResult.message,
      student,
    };
  }

  const defaultTuNote = student.hasSmartphone
    ? `Presensi Loket TU (Di-scan oleh ${currentTuUser.name})`
    : `Presensi Siswa Tanpa Smartphone (Loket TU - ${currentTuUser.name})`;
  const finalNote = notes ? `${defaultTuNote} | Catatan: ${notes}` : defaultTuNote;

  let updatedAttendance;

  if (determinedType === 'IN') {
    updatedAttendance = await prisma.studentAttendance.upsert({
      where: {
        studentId_date: {
          studentId: student.id,
          date: dateStr,
        },
      },
      update: {
        checkInTime: now,
        checkInStatus: evalResult.status,
        checkInLateMinutes: evalResult.lateMinutes,
        checkInDistance: 0,
        scannedByTuId: currentTuUser.id,
        notes: finalNote,
      },
      create: {
        studentId: student.id,
        date: dateStr,
        checkInTime: now,
        checkInStatus: evalResult.status,
        checkInLateMinutes: evalResult.lateMinutes,
        checkInDistance: 0,
        scannedByTuId: currentTuUser.id,
        notes: finalNote,
      },
    });
  } else {
    updatedAttendance = await prisma.studentAttendance.upsert({
      where: {
        studentId_date: {
          studentId: student.id,
          date: dateStr,
        },
      },
      update: {
        checkOutTime: now,
        checkOutStatus: evalResult.status,
        scannedByTuId: currentTuUser.id,
        notes: existingAttendance?.notes
          ? `${existingAttendance.notes} | ${finalNote}`
          : finalNote,
      },
      create: {
        studentId: student.id,
        date: dateStr,
        checkInStatus: 'ALPA', // Tidak pernah presensi masuk
        checkOutTime: now,
        checkOutStatus: evalResult.status,
        scannedByTuId: currentTuUser.id,
        notes: finalNote,
      },
    });
  }

  revalidatePath('/dashboard/tu/attendance-scan');
  revalidatePath('/dashboard/tu/non-smartphone');
  revalidatePath('/dashboard/attendance');
  revalidatePath('/dashboard/walikelas');

  return {
    success: true,
    type: determinedType,
    status: evalResult.status,
    lateMinutes: evalResult.lateMinutes,
    message: `${evalResult.message} Siswa: ${student.name} (${student.studentClass || 'Siswa'})`,
    student,
    attendance: updatedAttendance,
  };
}

export async function toggleStudentSmartphoneStatus(data: {
  studentId: string;
  hasSmartphone: boolean;
}) {
  await requireRole('TU', 'ADMIN');
  const { studentId, hasSmartphone } = data;

  const updated = await prisma.user.update({
    where: { id: studentId, role: 'STUDENT' },
    data: { hasSmartphone },
    select: {
      id: true,
      name: true,
      studentClass: true,
      hasSmartphone: true,
    },
  });

  revalidatePath('/dashboard/tu/non-smartphone');
  revalidatePath('/dashboard/management');

  return {
    success: true,
    message: `Status siswa ${updated.name} berhasil diubah: ${
      hasSmartphone ? 'Memiliki Smartphone' : 'Tanpa Smartphone (Wajib Presensi di Loket TU)'
    }.`,
    student: updated,
  };
}

export async function getNonSmartphoneStudents(filter?: { class?: string; search?: string }) {
  await requireRole('TU', 'ADMIN');
  const todayStr = getLocalDateString();

  const where: any = { role: 'STUDENT' };
  if (filter?.class && filter.class !== 'ALL') {
    where.studentClass = filter.class;
  }
  if (filter?.search && filter.search.trim()) {
    where.OR = [
      { name: { contains: filter.search.trim(), mode: 'insensitive' } },
      { nipOrNis: { contains: filter.search.trim(), mode: 'insensitive' } },
      { email: { contains: filter.search.trim(), mode: 'insensitive' } },
      { dapodikForm: { nisn: { contains: filter.search.trim(), mode: 'insensitive' } } },
    ];
  }

  const students = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      studentClass: true,
      nipOrNis: true,
      hasSmartphone: true,
      avatarUrl: true,
      dapodikForm: {
        select: {
          nisn: true,
          nis: true,
        },
      },
      attendances: {
        where: { date: todayStr },
        take: 1,
      },
    },
    orderBy: [{ hasSmartphone: 'asc' }, { studentClass: 'asc' }, { name: 'asc' }],
  });

  return { students, today: todayStr };
}

export async function getTuScanTodayHistory() {
  await requireRole('TU', 'ADMIN');
  const todayStr = getLocalDateString();

  const history = await prisma.studentAttendance.findMany({
    where: {
      date: todayStr,
      OR: [
        { scannedByTuId: { not: null } },
        { notes: { contains: 'Loket TU' } },
      ],
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          studentClass: true,
          nipOrNis: true,
          hasSmartphone: true,
          avatarUrl: true,
          dapodikForm: {
            select: { nisn: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  return history;
}
