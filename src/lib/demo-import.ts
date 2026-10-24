import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import type { Prisma, PrismaClient } from '@prisma/client';

export interface DemoDataset {
  classrooms: Array<{ name: string; code: string; level: string; program: string }>;
  teachers: Array<{ name: string; email: string; role: 'TEACHER' }>;
  students: Array<{ name: string; email: string; studentClass: string; nipOrNis: string; classroomCode: string }>;
  schedules: Array<{ teacherEmail: string; classroomCode: string; subject: string; dayOfWeek: number; startTime: string; endTime: string }>;
}

const EXPECTED = { classrooms: 30, teachers: 50, students: 1080, schedules: 600 };

function readSheet(workbook: ExcelJS.Workbook, name: string): Record<string, string>[] {
  const sheet = workbook.getWorksheet(name);
  if (!sheet || sheet.rowCount < 2) throw new Error(`Sheet ${name} wajib diisi.`);

  const headerRow = sheet.getRow(1);
  const headers = Array.from({ length: headerRow.cellCount }, (_, index) => String(headerRow.getCell(index + 1).text ?? '').trim());
  const rows: Record<string, string>[] = [];
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const values = headers.map((_, index) => String(row.getCell(index + 1).text ?? '').trim());
    if (values.every((value) => !value)) continue;
    rows.push(Object.fromEntries(headers.map((header, index) => [header, values[index]])));
  }
  return rows;
}

function validateDataset(dataset: DemoDataset) {
  for (const [key, expected] of Object.entries(EXPECTED)) {
    if (dataset[key as keyof typeof EXPECTED].length !== expected) {
      throw new Error(`Jumlah ${key} harus ${expected}; file berisi ${dataset[key as keyof typeof EXPECTED].length}.`);
    }
  }

  const roomCodes = new Set(dataset.classrooms.map((room) => room.code));
  const teacherEmails = new Set(dataset.teachers.map((teacher) => teacher.email.toLowerCase()));
  const studentEmails = new Set(dataset.students.map((student) => student.email.toLowerCase()));
  if (roomCodes.size !== EXPECTED.classrooms || teacherEmails.size !== EXPECTED.teachers || studentEmails.size !== EXPECTED.students) {
    throw new Error('Kode ruang atau email pada template tidak boleh duplikat.');
  }
  if (dataset.students.some((student) => !roomCodes.has(student.classroomCode))) {
    throw new Error('Ada siswa dengan kelas yang tidak tercantum pada sheet Kelas.');
  }
  if (dataset.schedules.some((schedule) => !roomCodes.has(schedule.classroomCode) || !teacherEmails.has(schedule.teacherEmail.toLowerCase()))) {
    throw new Error('Semua jadwal harus merujuk guru dan ruang yang ada pada template.');
  }
  if (dataset.classrooms.some((classroom) => !classroom.name || !classroom.code || !classroom.level || !classroom.program)) {
    throw new Error('Nama, kode, tingkat, dan program wajib diisi pada sheet Kelas.');
  }
  if (dataset.teachers.some((teacher) => !teacher.name || !teacher.email)) {
    throw new Error('Nama dan email wajib diisi pada sheet Guru.');
  }
  if (dataset.students.some((student) => !student.name || !student.email || !student.studentClass || !student.nipOrNis)) {
    throw new Error('Nama, email, kelas, dan NIS wajib diisi pada sheet Siswa.');
  }
  if (dataset.schedules.some((schedule) =>
    !Number.isInteger(schedule.dayOfWeek) || schedule.dayOfWeek < 1 || schedule.dayOfWeek > 5 ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.startTime) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.endTime) ||
    schedule.startTime >= schedule.endTime || !schedule.subject,
  )) {
    throw new Error('Jadwal harus memiliki hari kerja, mata pelajaran, dan jam yang valid.');
  }
}

export async function parseDemoWorkbook(input: ArrayBuffer): Promise<DemoDataset> {
  const workbook = new ExcelJS.Workbook();
  const buffer = Buffer.from(input) as unknown as Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(buffer);
  const classrooms = readSheet(workbook, 'Kelas');
  const teachers = readSheet(workbook, 'Guru');
  const students = readSheet(workbook, 'Siswa');
  const schedules = readSheet(workbook, 'Jadwal');

  const dataset: DemoDataset = {
    classrooms: classrooms.map((row) => ({ name: row.name, code: row.code, level: row.level, program: row.program })),
    teachers: teachers.map((row) => ({ name: row.name, email: row.email, role: 'TEACHER' })),
    students: students.map((row) => ({
      name: row.name,
      email: row.email,
      studentClass: row.studentClass,
      nipOrNis: row.nipOrNis,
      classroomCode: row.classroomCode,
    })),
    schedules: schedules.map((row) => ({
      teacherEmail: row.teacherEmail,
      classroomCode: row.classroomCode,
      subject: row.subject,
      dayOfWeek: Number(row.dayOfWeek),
      startTime: row.startTime,
      endTime: row.endTime,
    })),
  };
  validateDataset(dataset);
  return dataset;
}

export async function importDemoDataset(prisma: PrismaClient, dataset: DemoDataset) {
  validateDataset(dataset);

  const accountRows = [
    ...dataset.teachers.map((teacher) => ({ ...teacher, role: 'TEACHER', studentClass: null, nipOrNis: null })),
    ...dataset.students.map((student) => ({
      name: student.name,
      email: student.email,
      role: 'STUDENT',
      studentClass: student.studentClass,
      nipOrNis: student.nipOrNis,
    })),
  ];
  const emails = accountRows.map((account) => account.email.toLowerCase());
  const existingAccounts = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true, role: true },
  });
  const existingByEmail = new Map(existingAccounts.map((account) => [account.email.toLowerCase(), account.role]));
  for (const account of accountRows) {
    const existingRole = existingByEmail.get(account.email.toLowerCase());
    if (existingRole && existingRole !== account.role) {
      throw new Error(`Email ${account.email} sudah digunakan oleh role ${existingRole}.`);
    }
  }

  const newAccounts = accountRows.filter((account) => !existingByEmail.has(account.email.toLowerCase()));
  const credentials: Array<{ email: string; role: string; password: string }> = [];
  const accountsWithHashes: Prisma.UserCreateManyInput[] = [];
  for (let start = 0; start < newAccounts.length; start += 20) {
    const batch = newAccounts.slice(start, start + 20);
    const hashedBatch = await Promise.all(batch.map(async (account) => {
      const password = randomBytes(12).toString('base64url');
      credentials.push({ email: account.email, role: account.role, password });
      return { ...account, password: await bcrypt.hash(password, 8) };
    }));
    accountsWithHashes.push(...hashedBatch);
  }

  return prisma.$transaction(async (tx) => {
    const classroomResult = await tx.classroom.createMany({
      data: dataset.classrooms.map(({ name, code, level }) => ({ name, code, level })),
      skipDuplicates: true,
    });
    const classrooms = await tx.classroom.findMany({
      where: { code: { in: dataset.classrooms.map((classroom) => classroom.code) } },
      select: { id: true, name: true, code: true },
    });
    if (classrooms.length !== EXPECTED.classrooms) {
      throw new Error('Sebagian nama ruang demo sudah digunakan oleh ruang lain. Data lama tidak diubah.');
    }

    const teacherResult = await tx.user.createMany({
      data: accountsWithHashes.filter((account) => account.role === 'TEACHER'),
      skipDuplicates: true,
    });
    const studentResult = await tx.user.createMany({
      data: accountsWithHashes.filter((account) => account.role === 'STUDENT'),
      skipDuplicates: true,
    });
    const users = await tx.user.findMany({
      where: { email: { in: accountRows.map((account) => account.email) } },
      select: { id: true, email: true, role: true },
    });
    const userByEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]));
    const roomByCode = new Map(classrooms.map((classroom) => [classroom.code, classroom]));
    const scheduleRows = dataset.schedules.map((schedule) => {
      const teacher = userByEmail.get(schedule.teacherEmail.toLowerCase());
      const classroom = roomByCode.get(schedule.classroomCode);
      if (!teacher || teacher.role !== 'TEACHER' || !classroom) {
        throw new Error('Relasi guru/ruang pada jadwal demo tidak valid.');
      }
      return {
        teacherId: teacher.id,
        classroomId: classroom.id,
        subject: schedule.subject,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      };
    });
    const existingSchedules = await tx.classTeachingSchedule.findMany({
      where: {
        teacherId: { in: [...new Set(scheduleRows.map((schedule) => schedule.teacherId))] },
        classroomId: { in: [...new Set(scheduleRows.map((schedule) => schedule.classroomId))] },
        dayOfWeek: { in: [...new Set(scheduleRows.map((schedule) => schedule.dayOfWeek))] },
      },
      select: { teacherId: true, classroomId: true, dayOfWeek: true, startTime: true, endTime: true },
    });
    const scheduleKey = (schedule: {
      teacherId: string;
      classroomId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }) =>
      `${schedule.teacherId}|${schedule.classroomId}|${schedule.dayOfWeek}|${schedule.startTime}|${schedule.endTime}`;
    const existingScheduleKeys = new Set(existingSchedules.map(scheduleKey));
    const newScheduleRows = scheduleRows.filter((schedule) => !existingScheduleKeys.has(scheduleKey(schedule)));
    const scheduleResult = await tx.classTeachingSchedule.createMany({ data: newScheduleRows, skipDuplicates: true });

    return {
      classroomsCreated: classroomResult.count,
      teachersCreated: teacherResult.count,
      studentsCreated: studentResult.count,
      schedulesCreated: scheduleResult.count,
      credentialsCount: credentials.length,
      credentialsCsv: [
        'email,role,temporary_password',
        ...credentials.map((credential) => `${credential.email},${credential.role},${credential.password}`),
      ].join('\r\n'),
    };
  }, { maxWait: 10000, timeout: 120000 });
}
