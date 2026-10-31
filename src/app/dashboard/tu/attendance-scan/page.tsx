import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { getSchoolSetting } from '@/app/actions/attendance';
import { getTuScanTodayHistory } from '@/app/actions/tuAttendance';
import TuAttendanceScanClient from './TuAttendanceScanClient';

export default async function TuAttendanceScanPage() {
  const currentUser = await requireRole('TU', 'ADMIN');
  const setting = await getSchoolSetting();
  const initialHistory = await getTuScanTodayHistory();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-200 border border-white/20">
            Loket Presensi Tata Usaha (TU)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <span>📷 Scanner Barcode Presensi Siswa</span>
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Pindai kartu barcode atau QR code tanda pelajar siswa yang tidak memiliki smartphone atau terkendala gawai. Sistem otomatis mencatat kehadiran masuk dan pulang ke basis data presensi sekolah.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs space-y-1">
          <div className="text-emerald-200 font-semibold">Aturan Waktu Presensi:</div>
          <div>Masuk: <strong className="text-white">{setting.checkInStartTime}</strong> (≥ {setting.checkInLateTime} Terlambat)</div>
          <div>Pulang: Mulai <strong className="text-white">{setting.checkOutStartTime}</strong> (&lt; {setting.checkOutStartTime} Bolos)</div>
        </div>
      </div>

      <TuAttendanceScanClient
        currentUser={currentUser}
        setting={setting}
        initialHistory={initialHistory}
      />
    </div>
  );
}
