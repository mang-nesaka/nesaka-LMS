"use client";

import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, CircleX, RefreshCw, ShieldAlert, Stethoscope } from 'lucide-react';
import { getStudentAttendanceSummary } from '@/app/actions/attendance';
import type { AttendancePeriodSummary, StudentAttendanceSummary } from '@/lib/studentAttendanceSummary';

type PeriodKey = keyof StudentAttendanceSummary;

const periods: { key: PeriodKey; label: string }[] = [
  { key: 'daily', label: 'Harian' },
  { key: 'weekly', label: 'Mingguan' },
  { key: 'monthly', label: 'Bulanan' },
  { key: 'semester', label: 'Semester' },
];

const statuses = [
  { key: 'hadir', label: 'Hadir', Icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
  { key: 'terlambat', label: 'Terlambat', Icon: ShieldAlert, color: 'text-amber-700 bg-amber-50' },
  { key: 'izin', label: 'Izin', Icon: CalendarDays, color: 'text-blue-700 bg-blue-50' },
  { key: 'sakit', label: 'Sakit', Icon: Stethoscope, color: 'text-rose-700 bg-rose-50' },
  { key: 'alpa', label: 'Alpa', Icon: CircleX, color: 'text-slate-700 bg-slate-100' },
] as const;

function formatPeriodRange(period: AttendancePeriodSummary): string {
  const formatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const start = formatter.format(new Date(`${period.startDate}T00:00:00.000Z`));
  if (period.startDate === period.endDate) return start;
  const end = formatter.format(new Date(`${period.endDate}T00:00:00.000Z`));
  return `${start} - ${end}`;
}

export default function StudentAttendanceRecap({ initialSummary }: { initialSummary: StudentAttendanceSummary }) {
  const [summary, setSummary] = useState(initialSummary);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('daily');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let isRequestInFlight = false;

    async function refreshSummary() {
      if (isRequestInFlight) return;
      isRequestInFlight = true;
      setIsRefreshing(true);
      try {
        const freshSummary = await getStudentAttendanceSummary();
        if (isMounted) {
          setSummary(freshSummary);
          setLastUpdated(new Date());
          setRefreshError(false);
        }
      } catch {
        if (isMounted) setRefreshError(true);
      } finally {
        isRequestInFlight = false;
        if (isMounted) setIsRefreshing(false);
      }
    }

    void refreshSummary();
    const intervalId = window.setInterval(() => void refreshSummary(), 30_000);
    window.addEventListener('focus', refreshSummary);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshSummary);
    };
  }, [refreshKey]);

  const selectedSummary = summary[selectedPeriod];
  const selectedLabel = periods.find((period) => period.key === selectedPeriod)?.label ?? 'Harian';

  return (
    <section aria-labelledby="student-attendance-recap-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="student-attendance-recap-title" className="text-base font-bold text-slate-900">Rekap Presensi Saya</h3>
          <p className="mt-1 text-xs text-slate-500">
            {selectedPeriod === 'semester' ? selectedSummary.title : selectedLabel} · {formatPeriodRange(selectedSummary)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500" aria-live="polite">
          <span className={`h-2 w-2 rounded-full ${refreshError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          <span>
            {refreshError ? 'Pembaruan gagal' : lastUpdated ? `Diperbarui ${lastUpdated.toLocaleTimeString('id-ID')}` : 'Memuat data terbaru'}
          </span>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={isRefreshing}
            aria-label="Perbarui rekap presensi"
            title="Perbarui rekap presensi"
            className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Periode rekap presensi" className="mt-5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 sm:grid-cols-4">
        {periods.map((period) => (
          <button
            key={period.key}
            type="button"
            role="tab"
            aria-selected={selectedPeriod === period.key}
            aria-controls="student-attendance-period"
            onClick={() => setSelectedPeriod(period.key)}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${selectedPeriod === period.key ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div id="student-attendance-period" role="tabpanel" className="mt-4">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-sm font-medium text-slate-600">Hari tercatat</span>
          <span className="text-xl font-black tabular-nums text-slate-900">{selectedSummary.total}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {statuses.map(({ key, label, Icon, color }) => (
            <div key={key} className="flex items-center gap-2 rounded-lg border border-slate-100 p-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-medium text-slate-500">{label}</span>
                <span className="block text-base font-bold tabular-nums text-slate-900">{selectedSummary[key]}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}