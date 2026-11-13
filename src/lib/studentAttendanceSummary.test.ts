import { describe, expect, it } from 'vitest';
import { buildStudentAttendanceSummary, getStudentAttendanceDateRanges } from './studentAttendanceSummary';

describe('student attendance summary periods', () => {
  it('uses the Monday-to-current-day range for the week', () => {
    expect(getStudentAttendanceDateRanges('2026-11-13').weekly).toEqual({
      startDate: '2026-11-09',
      endDate: '2026-11-13',
    });
  });

  it('uses the correct Indonesian school semester and calendar range', () => {
    expect(getStudentAttendanceDateRanges('2026-11-13').semester).toEqual({
      startDate: '2026-07-01',
      endDate: '2026-11-13',
      title: 'Semester Ganjil 2026/2027',
    });
    expect(getStudentAttendanceDateRanges('2027-03-10').semester).toEqual({
      startDate: '2027-01-01',
      endDate: '2027-03-10',
      title: 'Semester Genap 2026/2027',
    });
  });

  it('counts this student\'s records in each period by recorded status', () => {
    const summary = buildStudentAttendanceSummary([
      { date: '2026-07-01', checkInStatus: 'HADIR' },
      { date: '2026-11-09', checkInStatus: 'TERLAMBAT' },
      { date: '2026-11-12', checkInStatus: 'IZIN' },
      { date: '2026-11-13', checkInStatus: 'ALPA' },
      { date: '2026-06-30', checkInStatus: 'SAKIT' },
      { date: '2026-11-14', checkInStatus: 'HADIR' },
    ], '2026-11-13');

    expect(summary.daily).toMatchObject({ total: 1, hadir: 0, alpa: 1 });
    expect(summary.weekly).toMatchObject({ total: 3, terlambat: 1, izin: 1, alpa: 1 });
    expect(summary.monthly).toMatchObject({ total: 3, terlambat: 1, izin: 1, alpa: 1 });
    expect(summary.semester).toMatchObject({ total: 4, hadir: 1, terlambat: 1, izin: 1, alpa: 1, sakit: 0 });
  });
});