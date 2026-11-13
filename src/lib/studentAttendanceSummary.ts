export interface StudentAttendanceRecord {
  date: string;
  checkInStatus: string | null;
}

export interface AttendanceDateRange {
  startDate: string;
  endDate: string;
}

export interface AttendancePeriodSummary extends AttendanceDateRange {
  total: number;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpa: number;
  title?: string;
}

export interface StudentAttendanceSummary {
  daily: AttendancePeriodSummary;
  weekly: AttendancePeriodSummary;
  monthly: AttendancePeriodSummary;
  semester: AttendancePeriodSummary;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getStudentAttendanceDateRanges(today: string): Record<'daily' | 'weekly' | 'monthly' | 'semester', AttendanceDateRange & { title?: string }> {
  const currentDate = new Date(`${today}T00:00:00.000Z`);
  const weekStart = new Date(currentDate);
  const daysSinceMonday = (currentDate.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(currentDate.getUTCDate() - daysSinceMonday);

  const monthStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
  const isOddSemester = currentDate.getUTCMonth() >= 6;
  const semesterStart = new Date(Date.UTC(currentDate.getUTCFullYear(), isOddSemester ? 6 : 0, 1));
  const semesterTitle = isOddSemester
    ? `Semester Ganjil ${currentDate.getUTCFullYear()}/${currentDate.getUTCFullYear() + 1}`
    : `Semester Genap ${currentDate.getUTCFullYear() - 1}/${currentDate.getUTCFullYear()}`;

  return {
    daily: { startDate: today, endDate: today },
    weekly: { startDate: toDateString(weekStart), endDate: today },
    monthly: { startDate: toDateString(monthStart), endDate: today },
    semester: { startDate: toDateString(semesterStart), endDate: today, title: semesterTitle },
  };
}

export function buildStudentAttendanceSummary(
  records: StudentAttendanceRecord[],
  today: string,
): StudentAttendanceSummary {
  const ranges = getStudentAttendanceDateRanges(today);

  function summarize(period: AttendanceDateRange & { title?: string }): AttendancePeriodSummary {
    const periodRecords = records.filter((record) => record.date >= period.startDate && record.date <= period.endDate);
    return {
      ...period,
      total: periodRecords.length,
      hadir: periodRecords.filter((record) => record.checkInStatus === 'HADIR').length,
      terlambat: periodRecords.filter((record) => record.checkInStatus === 'TERLAMBAT').length,
      izin: periodRecords.filter((record) => record.checkInStatus === 'IZIN').length,
      sakit: periodRecords.filter((record) => record.checkInStatus === 'SAKIT').length,
      alpa: periodRecords.filter((record) => record.checkInStatus === 'ALPA').length,
    };
  }

  return {
    daily: summarize(ranges.daily),
    weekly: summarize(ranges.weekly),
    monthly: summarize(ranges.monthly),
    semester: summarize(ranges.semester),
  };
}