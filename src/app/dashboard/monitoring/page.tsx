import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getRealtimeAgendasToday } from '@/app/actions/agenda';
import { School, Clock, BookOpen, AlertTriangle, CheckCircle, UserCheck } from 'lucide-react';


export default async function MonitoringPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });

  if (!currentUser || !['KEPSEK', 'WAKA_KURIKULUM', 'ADMIN', 'TU'].includes(currentUser.role)) {
    redirect('/dashboard');
  }

  const agendas = await getRealtimeAgendasToday();

  // Hitung guru terlambat & tepat waktu hari ini
  const lateTeachers = agendas.filter((a) => a.isLate);
  const onTimeTeachers = agendas.filter((a) => !a.isLate);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-300 border border-white/20">
            Pengawasan Real-Time Kepala Sekolah & Kurikulum
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <span>📡 Monitoring Guru Mengajar Real-Time</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Pantau di mana setiap guru sedang mengajar saat ini, materi pokok yang diajarkan, serta deteksi keterlambatan guru masuk kelas berdasarkan scan barcode kelas.
          </p>
        </div>
      </div>

      {/* Ringkasan Cepat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Guru Mengajar Hari Ini</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{agendas.length} Kelas</span>
          <span className="text-[11px] text-indigo-600 font-semibold">Terekam Melalui Barcode Kelas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Masuk Tepat Waktu</span>
          <span className="text-3xl font-black text-emerald-700 mt-1 block">{onTimeTeachers.length} Guru</span>
          <span className="text-[11px] text-emerald-600 font-semibold">Sesuai Jadwal Pelajaran</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm bg-gradient-to-br from-white to-rose-50/40">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Terlambat Masuk Kelas</span>
          <span className="text-3xl font-black text-rose-700 mt-1 block">{lateTeachers.length} Guru</span>
          <span className="text-[11px] text-rose-600 font-semibold">Melewati Jadwal Jam Kelas</span>
        </div>
      </div>

      {/* Daftar Guru Mengajar Hari Ini */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            <span>Aktivitas Guru Mengajar di Kelas Hari Ini</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Diperbarui Secara Real-Time</span>
        </div>

        {agendas.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {agendas.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{item.teacher?.name}</span>
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-md border border-indigo-100 flex items-center gap-1">
                      <School className="w-3.5 h-3.5" />
                      <span>{item.classroom?.name}</span>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        item.isLate
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {item.isLate ? `⚠️ TERLAMBAT ${item.lateMinutes} MENIT` : '✓ TEPAT WAKTU'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="font-bold text-indigo-700">{item.subject}</span>
                    <span>•</span>
                    <span className="text-slate-500">
                      Jadwal: {item.scheduledStartTime} - {item.scheduledEndTime} WIB
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">
                      Scan: {new Date(item.scanTime).toLocaleTimeString('id-ID')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block text-[11px] mb-0.5">Materi yang Diajarkan:</strong>
                    {item.teachingMaterial}
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 italic">
                      Catatan Kelas: {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <School className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">Belum Ada Guru yang Memindai Barcode Hari Ini</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Saat guru mata pelajaran menscan barcode di ruang kelas masing-masing, data mengajar akan langsung tampil di layar ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
