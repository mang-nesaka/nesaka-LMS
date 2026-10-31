export interface ParsedStudentBarcode {
  raw: string;
  cleaned: string;
  extractedId?: string;
  extractedNisn?: string;
}

export function parseStudentBarcodeIdentifier(rawInput: string): ParsedStudentBarcode {
  const raw = (rawInput || '').trim();
  if (!raw) {
    return { raw: '', cleaned: '' };
  }

  // Handle URL format: https://nesaka-lms.sch.id/verify/student/:id?nisn=...
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const url = new URL(raw);
      const pathname = url.pathname;
      const match = pathname.match(/\/verify\/(?:student|siswa)\/([^/?#]+)/i);
      const extractedId = match ? decodeURIComponent(match[1]) : undefined;
      const extractedNisn = url.searchParams.get('nisn') || undefined;
      return {
        raw,
        cleaned: extractedId || extractedNisn || raw,
        extractedId,
        extractedNisn,
      };
    } catch {
      // If URL parsing fails, continue to string match
    }
  }

  // Handle prefix NESAKA-SISWA- or NESAKA-STUDENT-
  const prefixMatch = raw.match(/^NESAKA-(?:SISWA|STUDENT)-(.*)$/i);
  if (prefixMatch && prefixMatch[1]) {
    const cleaned = prefixMatch[1].trim();
    return {
      raw,
      cleaned,
      extractedId: cleaned,
    };
  }

  return {
    raw,
    cleaned: raw,
  };
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

export interface AttendanceEvaluationResult {
  allowed: boolean;
  type: 'IN' | 'OUT';
  status: 'HADIR' | 'TERLAMBAT' | 'PULANG' | 'BOLOS';
  lateMinutes: number;
  message: string;
}

export function evaluateTuAttendanceTime(params: {
  type: 'IN' | 'OUT';
  currentHour: number;
  currentMinute: number;
  checkInStartTime: string; // e.g. "06:30"
  checkInLateTime: string;  // e.g. "07:00"
  checkOutStartTime: string; // e.g. "15:00"
}): AttendanceEvaluationResult {
  const { type, currentHour, currentMinute, checkInStartTime, checkInLateTime, checkOutStartTime } = params;
  const currentTotal = currentHour * 60 + currentMinute;

  if (type === 'IN') {
    const startMinutes = parseTimeToMinutes(checkInStartTime);
    const lateMinutesBoundary = parseTimeToMinutes(checkInLateTime);

    if (currentTotal < startMinutes) {
      return {
        allowed: false,
        type: 'IN',
        status: 'HADIR',
        lateMinutes: 0,
        message: `Presensi pagi belum dibuka. Presensi masuk dimulai pukul ${checkInStartTime} WIB.`,
      };
    }

    if (currentTotal >= lateMinutesBoundary) {
      const lateDuration = currentTotal - lateMinutesBoundary;
      return {
        allowed: true,
        type: 'IN',
        status: 'TERLAMBAT',
        lateMinutes: lateDuration,
        message: `Presensi Masuk Berhasil (TERLAMBAT ${lateDuration} menit via Loket TU).`,
      };
    }

    return {
      allowed: true,
      type: 'IN',
      status: 'HADIR',
      lateMinutes: 0,
      message: 'Presensi Masuk Berhasil Tepat Waktu (HADIR via Loket TU).',
    };
  } else {
    const outBoundary = parseTimeToMinutes(checkOutStartTime);

    if (currentTotal < outBoundary) {
      return {
        allowed: true,
        type: 'OUT',
        status: 'BOLOS',
        lateMinutes: 0,
        message: `Presensi Pulang Tercatat Lebih Awal sebelum pukul ${checkOutStartTime} WIB (Status: BOLOS / Pulang Cepat).`,
      };
    }

    return {
      allowed: true,
      type: 'OUT',
      status: 'PULANG',
      lateMinutes: 0,
      message: 'Presensi Pulang Berhasil Tercatat Tepat Waktu di Loket TU.',
    };
  }
}
