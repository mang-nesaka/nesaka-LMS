import ExcelJS from 'exceljs';
import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { generateDemoDataset } from './demo-dataset.mjs';
import { importDemoDataset, parseDemoWorkbook, type DemoDataset } from './demo-import';

describe('demo workbook import format', () => {
  it('round-trips all classes, accounts, students, and schedules', async () => {
    const dataset = generateDemoDataset() as DemoDataset;
    const workbook = new ExcelJS.Workbook();
    const sheetDefinitions = [
      ['Kelas', dataset.classrooms],
      ['Guru', dataset.teachers.map((teacher, index) => ({ ...teacher, password: index === 0 ? 'guruDemo123' : '' }))],
      ['Siswa', dataset.students.map((student, index) => ({ ...student, password: index === 0 ? 'siswaDemo123' : '' }))],
      ['Jadwal', dataset.schedules],
    ] as const;

    for (const [name, rows] of sheetDefinitions) {
      const sheet = workbook.addWorksheet(name);
      sheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key }));
      sheet.addRows(rows);
    }

    const generated = await workbook.xlsx.writeBuffer();
    const bytes = generated as unknown as Uint8Array;
    const input = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const imported = await parseDemoWorkbook(input);

    expect(imported.classrooms).toHaveLength(30);
    expect(imported.teachers).toHaveLength(50);
    expect(imported.students).toHaveLength(1080);
    expect(imported.schedules).toHaveLength(600);
    expect(imported.students[0].classroomCode).toBe(imported.classrooms[0].code);
    expect(imported.teachers[0].password).toBe('guruDemo123');
    expect(imported.students[0].password).toBe('siswaDemo123');
    expect(imported.teachers[1].password).toBeUndefined();
  });

  it('rejects account passwords shorter than six characters', async () => {
    const dataset = generateDemoDataset();
    const workbook = new ExcelJS.Workbook();
    const sheetDefinitions = [
      ['Kelas', dataset.classrooms],
      ['Guru', dataset.teachers.map((teacher, index) => ({ ...teacher, password: index === 0 ? 'short' : '' }))],
      ['Siswa', dataset.students],
      ['Jadwal', dataset.schedules],
    ] as const;

    for (const [name, rows] of sheetDefinitions) {
      const sheet = workbook.addWorksheet(name);
      sheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key }));
      sheet.addRows(rows);
    }

    const generated = await workbook.xlsx.writeBuffer();
    const bytes = generated as unknown as Uint8Array;
    const input = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    await expect(parseDemoWorkbook(input)).rejects.toThrow('Password akun demo minimal 6 karakter.');
  });

  it('updates existing accounts from non-empty template passwords', async () => {
    const dataset = generateDemoDataset() as DemoDataset;
    dataset.teachers[0].password = 'guruDemo456';
    dataset.students[0].password = 'siswaDemo456';
    const accounts = [
      ...dataset.teachers.map((teacher, index) => ({ id: `teacher-${index}`, email: teacher.email, role: teacher.role })),
      ...dataset.students.map((student, index) => ({ id: `student-${index}`, email: student.email, role: 'STUDENT' })),
    ];
    const updateUser = vi.fn(async (args: { where: { email: string }; data: { password: string } }) => ({
      id: args.where.email,
      ...args.data,
    }));
    const userFindMany = vi.fn(async () => accounts);
    const transactionClient = {
      classroom: {
        createMany: async () => ({ count: 0 }),
        findMany: async () => dataset.classrooms.map((room, index) => ({ id: `room-${index}`, ...room })),
      },
      user: {
        createMany: async () => ({ count: 0 }),
        findMany: userFindMany,
        update: updateUser,
      },
      classTeachingSchedule: {
        findMany: async () => [],
        createMany: async ({ data }: { data: unknown[] }) => ({ count: data.length }),
      },
    };
    const prisma = {
      user: { findMany: vi.fn(async () => accounts) },
      $transaction: async (callback: (tx: typeof transactionClient) => Promise<unknown>) => callback(transactionClient),
    } as unknown as PrismaClient;

    const result = await importDemoDataset(prisma, dataset);

    expect(updateUser).toHaveBeenCalledTimes(2);
    const teacherUpdate = updateUser.mock.calls.find(([args]) => args.where.email === dataset.teachers[0].email);
    const studentUpdate = updateUser.mock.calls.find(([args]) => args.where.email === dataset.students[0].email);
    expect(teacherUpdate).toBeDefined();
    expect(studentUpdate).toBeDefined();
    expect(await bcrypt.compare('guruDemo456', teacherUpdate![0].data.password)).toBe(true);
    expect(await bcrypt.compare('siswaDemo456', studentUpdate![0].data.password)).toBe(true);
    expect(result.passwordsUpdatedCount).toBe(2);
    expect(result.credentialsCount).toBe(2);
    expect(result.credentialsCsv).toContain(`${dataset.teachers[0].email},TEACHER,guruDemo456`);
    expect(result.credentialsCsv).toContain(`${dataset.students[0].email},STUDENT,siswaDemo456`);
  });
});
