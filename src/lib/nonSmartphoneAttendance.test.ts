import { describe, expect, it } from 'vitest';
import {
  parseStudentBarcodeIdentifier,
  parseTimeToMinutes,
  evaluateTuAttendanceTime,
} from './nonSmartphoneAttendance';

describe('nonSmartphoneAttendance library', () => {
  describe('parseStudentBarcodeIdentifier', () => {
    it('returns empty for empty or whitespace input', () => {
      expect(parseStudentBarcodeIdentifier('')).toEqual({ raw: '', cleaned: '' });
      expect(parseStudentBarcodeIdentifier('   ')).toEqual({ raw: '', cleaned: '' });
    });

    it('extracts student ID from full verification URL', () => {
      const url = 'https://nesaka-lms.sch.id/verify/student/clxyz12345?nisn=3071234567&valid=true';
      const result = parseStudentBarcodeIdentifier(url);
      expect(result.extractedId).toBe('clxyz12345');
      expect(result.extractedNisn).toBe('3071234567');
      expect(result.cleaned).toBe('clxyz12345');
    });

    it('extracts identifier from NESAKA-SISWA- prefix', () => {
      const barcode = 'NESAKA-SISWA-clstudent999';
      const result = parseStudentBarcodeIdentifier(barcode);
      expect(result.extractedId).toBe('clstudent999');
      expect(result.cleaned).toBe('clstudent999');
    });

    it('extracts identifier from NESAKA-STUDENT- prefix (case-insensitive)', () => {
      const barcode = 'nesaka-student-20241001';
      const result = parseStudentBarcodeIdentifier(barcode);
      expect(result.extractedId).toBe('20241001');
      expect(result.cleaned).toBe('20241001');
    });

    it('retains direct NIS/NISN or CUID string without changes', () => {
      const rawNis = '242510045';
      const result = parseStudentBarcodeIdentifier(rawNis);
      expect(result.cleaned).toBe('242510045');
      expect(result.extractedId).toBeUndefined();
    });
  });

  describe('parseTimeToMinutes', () => {
    it('correctly converts HH:MM to total minutes', () => {
      expect(parseTimeToMinutes('06:30')).toBe(6 * 60 + 30);
      expect(parseTimeToMinutes('07:00')).toBe(7 * 60);
      expect(parseTimeToMinutes('15:00')).toBe(15 * 60);
      expect(parseTimeToMinutes('')).toBe(0);
      expect(parseTimeToMinutes('invalid')).toBe(0);
    });
  });

  describe('evaluateTuAttendanceTime', () => {
    it('rejects check-in before checkInStartTime (e.g. 06:15 < 06:30)', () => {
      const res = evaluateTuAttendanceTime({
        type: 'IN',
        currentHour: 6,
        currentMinute: 15,
        checkInStartTime: '06:30',
        checkInLateTime: '07:00',
        checkOutStartTime: '15:00',
      });
      expect(res.allowed).toBe(false);
      expect(res.message).toContain('belum dibuka');
    });

    it('marks check-in as HADIR when on time (e.g. 06:45 between 06:30 and 07:00)', () => {
      const res = evaluateTuAttendanceTime({
        type: 'IN',
        currentHour: 6,
        currentMinute: 45,
        checkInStartTime: '06:30',
        checkInLateTime: '07:00',
        checkOutStartTime: '15:00',
      });
      expect(res.allowed).toBe(true);
      expect(res.status).toBe('HADIR');
      expect(res.lateMinutes).toBe(0);
    });

    it('marks check-in as TERLAMBAT and calculates late minutes when after 07:00', () => {
      const res = evaluateTuAttendanceTime({
        type: 'IN',
        currentHour: 7,
        currentMinute: 20,
        checkInStartTime: '06:30',
        checkInLateTime: '07:00',
        checkOutStartTime: '15:00',
      });
      expect(res.allowed).toBe(true);
      expect(res.status).toBe('TERLAMBAT');
      expect(res.lateMinutes).toBe(20);
      expect(res.message).toContain('TERLAMBAT 20 menit');
    });

    it('marks check-out before 15:00 as BOLOS (pulang lebih awal)', () => {
      const res = evaluateTuAttendanceTime({
        type: 'OUT',
        currentHour: 13,
        currentMinute: 30,
        checkInStartTime: '06:30',
        checkInLateTime: '07:00',
        checkOutStartTime: '15:00',
      });
      expect(res.allowed).toBe(true);
      expect(res.status).toBe('BOLOS');
      expect(res.message).toContain('BOLOS');
    });

    it('marks check-out at or after 15:00 as PULANG tepat waktu', () => {
      const res = evaluateTuAttendanceTime({
        type: 'OUT',
        currentHour: 15,
        currentMinute: 5,
        checkInStartTime: '06:30',
        checkInLateTime: '07:00',
        checkOutStartTime: '15:00',
      });
      expect(res.allowed).toBe(true);
      expect(res.status).toBe('PULANG');
      expect(res.message).toContain('Tepat Waktu');
    });
  });
});
