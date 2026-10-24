"use client";

import { useState } from 'react';
import { QrCode, BookOpen, Clock, AlertTriangle, CheckCircle, School, FileText, Check } from 'lucide-react';
import { scanBarcodeAndSubmitAgenda } from '@/app/actions/agenda';

interface Props {
  teacher: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  classrooms: Array<{ id: string; name: string; code: string; level: string }>;
  initialAgendas: any[];
}

export default function TeacherAgendaClient({ teacher, classrooms, initialAgendas }: Props) {
  const [barcodeCode, setBarcodeCode] = useState('');
  const [subject, setSubject] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('07:30');
  const [scheduledEndTime, setScheduledEndTime] = useState('09:30');
  const [teachingMaterial, setTeachingMaterial] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [agendas, setAgendas] = useState(initialAgendas);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeCode) {
      alert('Pilih atau masukkan Barcode Kelas terlebih dahulu!');
      return;
    }
    if (!subject || !teachingMaterial) {
      alert('Harap isi Mata Pelajaran dan Materi yang diajarkan!');
      return;
    }

    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const res = await scanBarcodeAndSubmitAgenda({
        teacherId: teacher.id,
        barcodeCode,
        subject,
        scheduledStartTime,
        scheduledEndTime,
        teachingMaterial,
        notes,
      });

      if (res.error) {
        setResultMessage({ type: 'error', text: res.error });
      } else {
        setResultMessage({ type: 'success', text: res.message || 'Agenda berhasil disimpan.' });
        if (res.agenda) {
          setAgendas([res.agenda, ...agendas]);
        }
        setTeachingMaterial('');
        setNotes('');
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat memproses agenda.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Scan & Pengisian Agenda (2 Kolom) */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-emerald-600" />
          <span>Form Scan Barcode Kelas & Agenda Mengajar</span>
        </h2>

        {resultMessage && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold border flex items-start gap-3 ${
              resultMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {resultMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{resultMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Barcode Ruang Kelas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Scan / Pilih Barcode Ruang Kelas
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={barcodeCode}
                onChange={(e) => setBarcodeCode(e.target.value)}
                placeholder="Contoh: NESAKA-X-RPL-1"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <select
                onChange={(e) => setBarcodeCode(e.target.value)}
                value={barcodeCode}
                className="px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Pilih Kelas --</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              * Arahkan scanner barcode ke kode QR di kelas atau pilih dari daftar kelas di atas.
            </p>
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mata Pelajaran
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Pemrograman Web, Matematika, Bahasa Indonesia"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Waktu Jadwal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Jadwal Mulai Kelas
              </label>
              <input
                type="time"
                required
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Jadwal Selesai Kelas
              </label>
              <input
                type="time"
                required
                value={scheduledEndTime}
                onChange={(e) => setScheduledEndTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
            ⚠️ Sistem otomatis mencatat waktu saat ini. Jika Anda memindai barcode melewati jadwal mulai, sistem akan merekam menit keterlambatan Anda.
          </p>

          {/* Materi yang diajarkan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Materi Pelajaran yang Diajarkan Hari Ini
            </label>
            <textarea
              required
              rows={3}
              value={teachingMaterial}
              onChange={(e) => setTeachingMaterial(e.target.value)}
              placeholder="Tuliskan pokok bahasan, bab materi, atau kegiatan pembelajaran yang disampaikan di kelas..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Catatan / Keterangan Kelas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan / Kejadian di Kelas (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Siswa aktif, proyektor sempat bermasalah, tugas dikumpulkan di LMS"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <Check className="w-5 h-5" />
            <span>{isSubmitting ? 'Menyimpan Agenda...' : 'SCAN & SIMPAN AGENDA MENGAJAR'}</span>
          </button>
        </form>
      </div>

      {/* Riwayat Agenda Guru Hari Ini (1 Kolom) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>Agenda Mengajar Hari Ini</span>
          </h3>

          {agendas.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[550px] pr-1">
              {agendas.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <School className="w-4 h-4 text-emerald-600" />
                      {a.classroom?.name || 'Kelas'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        a.isLate
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {a.isLate ? `TERLAMBAT ${a.lateMinutes}m` : 'TEPAT WAKTU'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900">{a.subject}</p>
                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 line-clamp-2">
                    {a.teachingMaterial}
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>
                      Jadwal: {a.scheduledStartTime} - {a.scheduledEndTime}
                    </span>
                    <span>Scan: {new Date(a.scanTime).toLocaleTimeString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Belum ada agenda mengajar yang discan hari ini.</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Data agenda ini otomatis terpantau secara real-time oleh <strong>Kepala Sekolah</strong> dan <strong>Waka Kurikulum</strong>.
        </div>
      </div>
    </div>
  );
}
