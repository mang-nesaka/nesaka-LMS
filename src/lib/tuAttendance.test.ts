import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  parseStudentBarcodeIdentifier,
  evaluateTuAttendanceTime,
} from './nonSmartphoneAttendance';

describe('TU Attendance and Non-Smartphone Logic', () => {
  describe('Barcode scanning format recognition', () => {
    it('recognizes standard verification URL and extracts student id & nisn', () => {
      const sampleUrl = 'https://nesaka-lms.sch.id/verify/student/cmteststudent01?nisn=3089912345&valid=true';
      const parsed = parseStudentBarcodeIdentifier(sampleUrl);

      expect(parsed.extractedId).toBe('cmteststudent01');
      expect(parsed.extractedNisn).toBe('3089912345');
      expect(parsed.cleaned).toBe('cmteststudent01');
    });

    it('recognizes physical student card prefix NESAKA-SISWA-', () => {
      const sampleCode = 'NESAKA-SISWA-X-RPL-1-001';
      const parsed = parseStudentBarcodeIdentifier(sampleCode);

      expect(parsed.extractedId).toBe('X-RPL-1-001');
      expect(parsed.cleaned).toBe('X-RPL-1-001');
    });

    it('handles direct numeric NISN barcode scan without prefix', () => {
      const sampleNisn = '3071234567';
      const parsed = parseStudentBarcodeIdentifier(sampleNisn);

      expect(parsed.cleaned).toBe('3071234567');
      expect(parsed.raw).toBe('3071234567');
    });
  });

  describe('TU attendance time & status calculation', () => {
    const defaultSchedule = {
      checkInStartTime: '06:30',
      checkInLateTime: '07:00',
      checkOutStartTime: '15:00',
    };

    it('blocks early check-in before 06:30', () => {
      const result = evaluateTuAttendanceTime({
        type: 'IN',
        currentHour: 6,
        currentMinute: 10,
        ...defaultSchedule,
      });

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('belum dibuka');
    });

    it('marks check-in on time (06:40) as HADIR with 0 late minutes', () => {
      const result = evaluateTuAttendanceTime({
        type: 'IN',
        currentHour: 6,
        currentMinute: 40,
        ...defaultSchedule,
      });

      expect(result.allowed).toBe(true);
      expect(result.status).toBe('HADIR');
      expect(result.lateMinutes).toBe(0);
    });

    it('marks check-in at 07:15 as TERLAMBAT with 15 minutes penalty', () => {
      const result = evaluateTuAttendanceTime({
        type: 'IN',
        currentHour: 7,
        currentMinute: 15,
        ...defaultSchedule,
      });

      expect(result.allowed).toBe(true);
      expect(result.status).toBe('TERLAMBAT');
      expect(result.lateMinutes).toBe(15);
      expect(result.message).toContain('TERLAMBAT 15 menit');
    });

    it('marks early checkout at 13:45 as BOLOS (pulang lebih awal)', () => {
      const result = evaluateTuAttendanceTime({
        type: 'OUT',
        currentHour: 13,
        currentMinute: 45,
        ...defaultSchedule,
      });

      expect(result.allowed).toBe(true);
      expect(result.status).toBe('BOLOS');
      expect(result.message).toContain('BOLOS');
    });

    it('marks normal checkout at 15:10 as PULANG', () => {
      const result = evaluateTuAttendanceTime({
        type: 'OUT',
        currentHour: 15,
        currentMinute: 10,
        ...defaultSchedule,
      });

      expect(result.allowed).toBe(true);
      expect(result.status).toBe('PULANG');
      expect(result.message).toContain('Tepat Waktu');
    });
  });
});
