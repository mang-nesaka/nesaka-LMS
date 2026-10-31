"use client";

import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { 
  Camera, CheckCircle, AlertTriangle, Clock, RefreshCw, 
  UserCheck, QrCode, PhoneOff, History, User, Volume2, VolumeX, X
} from 'lucide-react';
import { scanStudentBarcodeByTu } from '@/app/actions/tuAttendance';

interface Props {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  setting: {
    schoolName: string;
    checkInStartTime: string;
    checkInLateTime: string;
    checkOutStartTime: string;
  };
  initialHistory: any[];
}

export default function TuAttendanceScanClient({ currentUser, setting, initialHistory }: Props) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [attendanceMode, setAttendanceMode] = useState<'AUTO' | 'IN' | 'OUT'>('AUTO');
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedResult, setLastScannedResult] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>(initialHistory);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const isProcessingRef = useRef(false);

  // Play beep sound on scan
  const playSound = (success: boolean) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (success) {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.15); // D6
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  const handleScanCode = async (rawCode: string) => {
    if (!rawCode || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await scanStudentBarcodeByTu({
        barcodeOrIdentifier: rawCode,
        attendanceType: attendanceMode,
      });

      if (res.error) {
        playSound(false);
        setErrorMessage(res.error);
        setLastScannedResult(null);
      } else if (res.success && res.attendance && res.student) {
        playSound(true);
        setLastScannedResult(res);
        setBarcodeInput('');
        // Perbarui riwayat
        setHistory((prev) => [
          {
            id: res.attendance!.id,
            date: res.attendance!.date,
            checkInTime: res.attendance!.checkInTime,
            checkInStatus: res.attendance!.checkInStatus,
            checkInLateMinutes: res.attendance!.checkInLateMinutes,
            checkOutTime: res.attendance!.checkOutTime,
            checkOutStatus: res.attendance!.checkOutStatus,
            notes: res.attendance!.notes,
            student: res.student!,
          },
          ...prev.filter((item) => item.student?.id !== res.student!.id),
        ]);
      }
    } catch (err: any) {
      playSound(false);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat memproses presensi.');
    } finally {
      setIsSubmitting(false);
      // Debounce camera scanner so it doesn't repeatedly scan the same card in 2.5s
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2500);
    }
  };

  const stopCamera = () => {
    if (scannerControlsRef.current) {
      scannerControlsRef.current.stop();
      scannerControlsRef.current = null;
    }
    setIsScanningCamera(false);
  };

  const startCamera = async () => {
    if (!videoRef.current) return;
    setErrorMessage(null);
    setIsScanningCamera(true);

    try {
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        videoRef.current,
        (result) => {
          if (result && !isProcessingRef.current) {
            const text = result.getText();
            if (text) {
              handleScanCode(text);
            }
          }
        }
      );
      scannerControlsRef.current = controls;
    } catch (err: any) {
      setIsScanningCamera(false);
      setErrorMessage(`Gagal mengaktifkan kamera: ${err.message}. Pastikan izin kamera telah disetujui.`);
    }
  };

  useEffect(() => {
    return () => {
      scannerControlsRef.current?.stop();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    handleScanCode(barcodeInput.trim());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kolom Kiri: Panel Scanner & Input (2 Kolom) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span>Pemindai Barcode / QR Kartu Siswa</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mendukung scanner laser barcode USB, webcam/kamera laptop, atau ketik langsung NISN / ID siswa.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                  soundEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
                title={soundEnabled ? 'Suara Beep Aktif' : 'Suara Beep Mati'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{soundEnabled ? 'Suara Aktif' : 'Mute'}</span>
              </button>
            </div>
          </div>

          {/* Pengaturan Mode Presensi */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setAttendanceMode('AUTO')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                attendanceMode === 'AUTO'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔄 Otomatis (Masuk / Pulang)
            </button>
            <button
              type="button"
              onClick={() => setAttendanceMode('IN')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                attendanceMode === 'IN'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌅 Presensi Masuk Pagi
            </button>
            <button
              type="button"
              onClick={() => setAttendanceMode('OUT')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                attendanceMode === 'OUT'
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌇 Presensi Pulang
            </button>
          </div>

          {/* Form Input Manual / USB Scanner */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Scan Barcode / Masukkan NISN / NIS Siswa:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Arahkan scanner ke sini atau ketik NISN / NIS (tekan Enter)..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {barcodeInput && (
                  <button
                    type="button"
                    onClick={() => setBarcodeInput('')}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !barcodeInput.trim()}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-sm transition-all shrink-0 flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses...' : 'Proses Presensi'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              * Scanner barcode USB otomatis mengisi kolom ini dan memicu tombol proses seketika.
            </p>
          </form>

          {/* Opsi Kamera Scanner */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Pindai Lewat Kamera / Webcam:</span>
              </span>
              {isScanningCamera ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Tutup Kamera
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Nyalakan Kamera</span>
                </button>
              )}
            </div>

            <div className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 ${isScanningCamera ? 'aspect-video' : 'hidden'}`}>
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-emerald-400 border-dashed rounded-2xl shadow-lg bg-emerald-500/10 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Feedback Hasil Scan Terakhir */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {lastScannedResult && (
            <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200 shadow-sm animate-in fade-in zoom-in-95 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                    {lastScannedResult.student.avatarUrl ? (
                      <img
                        src={lastScannedResult.student.avatarUrl}
                        alt={lastScannedResult.student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900">
                        {lastScannedResult.student.name}
                      </span>
                      {!lastScannedResult.student.hasSmartphone && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <PhoneOff className="w-3 h-3" />
                          <span>Non-Smartphone</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      Kelas: <strong className="text-slate-800">{lastScannedResult.student.studentClass || '-'}</strong> • NISN: {lastScannedResult.student.dapodikForm?.nisn || lastScannedResult.student.nipOrNis || '-'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border inline-block ${
                      lastScannedResult.status === 'HADIR' || lastScannedResult.status === 'PULANG'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : lastScannedResult.status === 'TERLAMBAT'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-rose-600 text-white border-rose-700'
                    }`}
                  >
                    {lastScannedResult.status}
                    {lastScannedResult.lateMinutes > 0 ? ` (+${lastScannedResult.lateMinutes}m)` : ''}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-1">
                    {lastScannedResult.type === 'IN' ? 'Presensi Masuk' : 'Presensi Pulang'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-xs text-emerald-900 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lastScannedResult.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Riwayat Presensi Loket TU Hari Ini (1 Kolom) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Riwayat Scan TU Hari Ini</span>
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
              {history.length} Siswa
            </span>
          </div>

          {history.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {history.map((att) => (
                <div key={att.id} className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-100 space-y-1.5 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {att.student?.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        att.checkInStatus === 'HADIR'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : att.checkInStatus === 'TERLAMBAT'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {att.checkInStatus || 'PULANG'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{att.student?.studentClass || 'Siswa'}</span>
                    <span className="font-mono">
                      Masuk: {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      {att.checkOutTime ? ` | Pulang: ${new Date(att.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </span>
                  </div>

                  {att.notes && (
                    <p className="text-[10px] text-slate-400 truncate">
                      {att.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-500">Belum ada siswa yang discan di loket TU hari ini.</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Petugas Loket: <strong className="text-slate-700">{currentUser.name}</strong>
        </div>
      </div>
    </div>
  );
}
