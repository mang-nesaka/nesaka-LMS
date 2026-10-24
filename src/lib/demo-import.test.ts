import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { generateDemoDataset } from './demo-dataset.mjs';
import { parseDemoWorkbook } from './demo-import';

describe('demo workbook import format', () => {
  it('round-trips all classes, accounts, students, and schedules', async () => {
    const dataset = generateDemoDataset();
    const workbook = new ExcelJS.Workbook();
    const sheetDefinitions = [
      ['Kelas', dataset.classrooms],
      ['Guru', dataset.teachers],
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
    const imported = await parseDemoWorkbook(input);

    expect(imported.classrooms).toHaveLength(30);
    expect(imported.teachers).toHaveLength(50);
    expect(imported.students).toHaveLength(1080);
    expect(imported.schedules).toHaveLength(600);
    expect(imported.students[0].classroomCode).toBe(imported.classrooms[0].code);
  });
});
