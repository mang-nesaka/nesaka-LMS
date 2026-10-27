"use client";

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { QrCode, BookOpen, AlertTriangle, CheckCircle, School, FileText, Check, Camera, X } from 'lucide-react';
import { scanBarcodeAndSubmitAgenda } from '@/app/actions/agenda';

interface ClassSchedule {
  id: string;
  subject: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom: { name: string; code: string };
}

interface AgendaRow {
  id: string;
  classScheduleId: string | null;
  classroom: { name: string };
  subject: string;
  isLate: boolean;
  lateMinutes: number;
  teachingMaterial: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  scanTime: Date | string;
}

export default function TeacherAgendaClient({ schedules, initialAgendas }: { schedules: ClassSchedule[]; initialAgendas: AgendaRow[] }) {
  const [barcodeCode, setBarcodeCode] = useState('');
  const [teachingMaterial, setTeachingMaterial] = useState('');
  const [notes, setNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [agendas, setAgendas] = useState(initialAgendas);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const hasScannedRef = useRef(false);

  const stopScanner = () => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setIsScanning(false);
  };

  useEffect(() => () => scannerControlsRef.current?.stop(), []);

  const startScanner = async () => {
    if (!videoRef.current) return;
    hasScannedRef.current = false;
    setResultMessage(null);
    setIsScanning(true);
    try {
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        videoRef.current,
        (result, _error, currentControls) => {
          scannerControlsRef.current = currentControls;
          if (!result || hasScannedRef.current) return;
          hasScannedRef.current = true;
          setBarcodeCode(result.getText());
          setResultMessage({ type: 'success', text: 'QR ruang terbaca. Isi materi lalu simpan agenda.' });
          currentControls.stop();
          scannerControlsRef.current = null;
          setIsScanning(false);
        },
      );
      scannerControlsRef.current = controls;
    } catch (error) {
      setIsScanning(false);
      setResultMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Kamera gagal dibuka. Periksa izin kamera browser.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeCode) {
      setResultMessage({ type: 'error', text: 'Scan QR ruang kelas terlebih dahulu.' });
      return;
    }
    if (!teachingMaterial.trim()) {
      setResultMessage({ type: 'error', text: 'Materi yang diajarkan wajib diisi.' });
      return;
    }

    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const res = await scanBarcodeAndSubmitAgenda({
        barcodeCode,
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
        setBarcodeCode('');
        setTeachingMaterial('');
        setNotes('');
      }
    } catch (err) {
      setResultMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses agenda.',
      });
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
          <section className="rounded-xl border border-slate-200 p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Jadwal Hari Ini</h3>
            {schedules.length ? schedules.map((schedule) => {
              const scanned = agendas.some((agenda) => agenda.classScheduleId === schedule.id);
              return (
                <div key={schedule.id} className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2 text-sm">
                  <div>
                    <p className="font-semibold text-slate-800">{schedule.startTime}–{schedule.endTime} · {schedule.classroom.name}</p>
                    <p className="text-xs text-slate-500">{schedule.subject}</p>
                  </div>
                  <span className={`text-xs font-semibold ${scanned ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {scanned ? 'Sudah discan' : 'Menunggu scan'}
                  </span>
                </div>
              );
            }) : <p className="text-sm text-slate-500">Tidak ada jadwal hari ini. Hubungi TU untuk memeriksa jadwal.</p>}
          </section>

          <div className="space-y-3">
            <video ref={videoRef} className={`w-full aspect-video rounded-xl bg-slate-950 object-cover ${isScanning ? 'block' : 'hidden'}`} muted playsInline />
            <div className="flex gap-2">
              {!isScanning ? (
                <button type="button" disabled={!schedules.length} onClick={startScanner} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
                  <Camera className="w-4 h-4" /> Buka Kamera & Scan QR
                </button>
              ) : (
                <button type="button" onClick={stopScanner} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-bold text-white">
                  <X className="w-4 h-4" /> Tutup Kamera
                </button>
              )}
            </div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider space-y-1.5">
              Kode QR Terbaca
              <input readOnly value={barcodeCode} placeholder="Belum discan" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-mono normal-case" />
            </label>
          </div>

          <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
            Sistem mengambil mata pelajaran dan jam dari jadwal TU/Admin, lalu mencatat keterlambatan berdasarkan waktu scan.
          </p>
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
