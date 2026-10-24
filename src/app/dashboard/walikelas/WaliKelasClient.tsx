"use client";

import { useRouter } from 'next/navigation';
import { Users, Calendar, Clock, CheckCircle, AlertTriangle, Printer, School, UserCheck } from 'lucide-react';

interface Props {
  user: {
    id: string;
    name: string;
    role: string;
    waliKelasOf?: string | null;
  };
  classrooms: Array<{ id: string; name: string }>;
  selectedClass: string;
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'semester';
  students: any[];
  today: string;
}

export default function WaliKelasClient({
  user,
  classrooms,
  selectedClass,
  selectedPeriod,
  students,
  today,
}: Props) {
  const router = useRouter();

  const handleFilterChange = (newClass: string, newPeriod: string) => {
    router.push(`/dashboard/walikelas?class=${encodeURIComponent(newClass)}&period=${newPeriod}`);
  };

  // Ringkasan statistik
  let countHadir = 0;
  let countTerlambat = 0;
  let countBolos = 0;
  let countBelum = 0;

  students.forEach((s) => {
    const todayAtt = s.attendances?.find((a: any) => a.date === today);
    if (!todayAtt) {
      countBelum++;
    } else {
      if (todayAtt.checkInStatus === 'HADIR') countHadir++;
      if (todayAtt.checkInStatus === 'TERLAMBAT') countTerlambat++;
      if (todayAtt.checkOutStatus === 'BOLOS' || todayAtt.checkInStatus === 'ALPA') countBolos++;
    }
  });

  const totalSiswa = students.length;
  const persentaseHadir = totalSiswa > 0 ? Math.round(((countHadir + countTerlambat) / totalSiswa) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Bar Filter Kelas & Periode */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Pilihan Kelas */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <School className="w-5 h-5 text-indigo-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kelas:</span>
          {user.role === 'WALI_KELAS' && user.waliKelasOf ? (
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-sm border border-indigo-100">
              {user.waliKelasOf}
            </span>
          ) : (
            <select
              value={selectedClass}
              onChange={(e) => handleFilterChange(e.target.value, selectedPeriod)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kelas</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Tab Periode: Harian, Mingguan, Bulanan, Semester */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full md:w-auto overflow-x-auto">
          {(['daily', 'weekly', 'monthly', 'semester'] as const).map((p) => {
            const labels = {
              daily: 'Hari Ini',
              weekly: 'Mingguan (7 Hari)',
              monthly: 'Bulanan (30 Hari)',
              semester: 'Per Semester',
            };
            const isActive = selectedPeriod === p;
            return (
              <button
                key={p}
                onClick={() => handleFilterChange(selectedClass, p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>

        {/* Tombol Cetak */}
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Rekap</span>
        </button>
      </div>

      {/* Kartu Statistik Cepat */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Siswa</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalSiswa} Siswa</span>
          <span className="text-[11px] text-indigo-600 font-semibold">{persentaseHadir}% Presensi Hari Ini</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Hadir Tepat Waktu</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{countHadir} Siswa</span>
          <span className="text-[11px] text-slate-400">&lt; 07:00 WIB</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Hadir Terlambat</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{countTerlambat} Siswa</span>
          <span className="text-[11px] text-amber-600">&ge; 07:00 WIB</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm bg-gradient-to-br from-white to-rose-50/30">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Belum / Bolos</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{countBolos + countBelum} Siswa</span>
          <span className="text-[11px] text-rose-500">Alpa / Pulang Cepat</span>
        </div>
      </div>

      {/* Tabel Data Rekapan Siswa */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Daftar Siswa & Riwayat Presensi ({selectedClass})</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Periode: {selectedPeriod.toUpperCase()}</span>
        </div>

        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-3">NIS/NISN</th>
                  <th className="py-3.5 px-3">Kelas</th>
                  <th className="py-3.5 px-3">Status Masuk</th>
                  <th className="py-3.5 px-3">Jam Masuk</th>
                  <th className="py-3.5 px-3">Jam Pulang</th>
                  <th className="py-3.5 px-3">Status Pulang</th>
                  <th className="py-3.5 px-3 text-center">Foto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {students.map((student) => {
                  const todayAtt = student.attendances?.[0]; // Terbaru
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{student.name}</span>
                        <span className="text-[10px] text-slate-400">{student.email}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{student.nipOrNis || '-'}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[11px]">
                          {student.studentClass || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {todayAtt?.checkInStatus ? (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              todayAtt.checkInStatus === 'HADIR'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : todayAtt.checkInStatus === 'TERLAMBAT'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {todayAtt.checkInStatus}
                            {todayAtt.checkInLateMinutes > 0 ? ` (+${todayAtt.checkInLateMinutes}m)` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum Absen</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {todayAtt?.checkInTime ? new Date(todayAtt.checkInTime).toLocaleTimeString('id-ID') : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {todayAtt?.checkOutTime ? new Date(todayAtt.checkOutTime).toLocaleTimeString('id-ID') : '-'}
                      </td>
                      <td className="py-3 px-3">
                        {todayAtt?.checkOutStatus ? (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              todayAtt.checkOutStatus === 'PULANG'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {todayAtt.checkOutStatus}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {todayAtt?.checkInPhoto ? (
                          <img
                            src={todayAtt.checkInPhoto}
                            alt="Foto Presensi"
                            className="w-8 h-8 rounded-full object-cover mx-auto border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Tidak ada data siswa untuk kelas ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
