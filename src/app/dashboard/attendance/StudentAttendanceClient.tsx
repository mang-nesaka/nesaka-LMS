"use client";

import { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, CheckCircle, AlertTriangle, Clock, RefreshCw, UserCheck, ShieldAlert } from 'lucide-react';
import { submitStudentAttendance } from '@/app/actions/attendance';

interface Props {
  student: {
    id: string;
    name: string;
    email: string;
    studentClass?: string | null;
  };
  attendance: {
    checkInTime: Date | null;
    checkInStatus: string | null;
    checkInLateMinutes: number;
    checkOutTime: Date | null;
    checkOutStatus: string | null;
  } | null;
  setting: {
    schoolName: string;
    schoolLat: number;
    schoolLng: number;
    radiusMeters: number;
    checkInStartTime: string;
    checkInLateTime: string;
    checkOutStartTime: string;
  };
  today: string;
}

export default function StudentAttendanceClient({ student, attendance, setting, today }: Props) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate distance in meters
  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Geolocation watcher
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLocation({ lat: userLat, lng: userLng });
        const d = calcDistance(userLat, userLng, setting.schoolLat, setting.schoolLng);
        setDistance(d);
        setLocationError(null);
      },
      (err) => {
        setLocationError(`Gagal membaca GPS: ${err.message}. Mohon izinkan akses lokasi di browser Anda.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [setting]);

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'izin kamera belum diberikan';
      alert(`Gagal mengakses kamera: ${message}. Pastikan izin kamera telah diberikan.`);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  // Take Snapshot
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  // Retake Photo
  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  // Submit Attendance (IN or OUT)
  const handleSubmit = async (type: 'IN' | 'OUT') => {
    if (!photo) {
      alert('Harap ambil foto selfie kehadiran Anda terlebih dahulu!');
      return;
    }
    if (!location) {
      alert(navigator.geolocation
        ? 'Lokasi GPS belum terdeteksi. Pastikan GPS aktif dan izin lokasi telah disetujui.'
        : 'Perangkat Anda tidak mendukung fitur GPS Geolocation.');
      return;
    }

    if (distance !== null && distance > setting.radiusMeters) {
      alert(`Presensi Ditolak! Anda berada di luar jangkauan radius sekolah (${distance}m dari maksimal ${setting.radiusMeters}m).`);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await submitStudentAttendance({
        type,
        lat: location.lat,
        lng: location.lng,
        photoBase64: photo,
      });

      if (res.error) {
        setSubmitMessage({ type: 'error', text: res.error });
      } else {
        setSubmitMessage({ type: 'success', text: res.message || 'Presensi berhasil dicatat!' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan presensi.';
      setSubmitMessage({ type: 'error', text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isWithinRadius = distance !== null && distance <= setting.radiusMeters;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Kolom Kiri: Kamera & Pengambilan Foto */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            <span>Foto Kehadiran Wajah</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Ambil foto selfie jelas menghadap kamera di lingkungan sekolah saat jam presensi.
          </p>

          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
            {photo ? (
              <img src={photo} alt="Selfie Kehadiran" className="w-full h-full object-cover" />
            ) : isCameraActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Kamera belum diaktifkan</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Action Buttons Kamera */}
          <div className="mt-4 flex gap-3">
            {!photo && !isCameraActive && (
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Buka Kamera Selfie</span>
              </button>
            )}

            {!photo && isCameraActive && (
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Ambil Foto Sekarang</span>
              </button>
            )}

            {photo && (
              <button
                type="button"
                onClick={retakePhoto}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Foto Ulang</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Lokasi GPS */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Status Jarak GPS Sekolah</span>
            </span>
            {distance !== null ? (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isWithinRadius
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {isWithinRadius ? '✓ DALAM RADIUS' : '✗ DI LUAR RADIUS'}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">Mencari sinyal GPS...</span>
            )}
          </div>

          {locationError ? (
            <div className="text-xs text-rose-600 flex items-start gap-1.5 mt-1 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{locationError}</span>
            </div>
          ) : distance !== null ? (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Jarak ke Gerbang Sekolah:</span>
                <span className="font-bold text-slate-900">{distance} meter</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Batas Radius Maksimal:</span>
                <span>{setting.radiusMeters} meter</span>
              </div>
              {!isWithinRadius && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-medium mt-2 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>
                    Anda berada {distance - setting.radiusMeters}m di luar jangkauan sekolah. Anda tidak dapat melakukan presensi sebelum berada di dalam lingkungan sekolah.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Sedang mengukur jarak lokasi koordinat Anda...</p>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Tombol Presensi & Riwayat Hari Ini */}
      <div className="space-y-6">
        {/* Tombol Aksi Presensi */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>Kirim Presensi ({today})</span>
          </h2>

          {submitMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold border flex items-start gap-2.5 ${
                submitMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {submitMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{submitMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Tombol Presensi Masuk */}
            <button
              type="button"
              disabled={isSubmitting || !photo || !isWithinRadius}
              onClick={() => handleSubmit('IN')}
              className={`py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
                isSubmitting || !photo || !isWithinRadius
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-md hover:scale-[1.02]'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>PRESENSI MASUK</span>
              <span className="text-[10px] font-normal opacity-80">(Mulai 06:30 | &gt;= 07:00 Terlambat)</span>
            </button>

            {/* Tombol Presensi Pulang */}
            <button
              type="button"
              disabled={isSubmitting || !photo || !isWithinRadius}
              onClick={() => handleSubmit('OUT')}
              className={`py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
                isSubmitting || !photo || !isWithinRadius
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:shadow-md hover:scale-[1.02]'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>PRESENSI PULANG</span>
              <span className="text-[10px] font-normal opacity-80">(Mulai 15:00 | &lt; 15:00 Bolos)</span>
            </button>
          </div>

          {(!photo || !isWithinRadius) && (
            <p className="text-[11px] text-slate-400 text-center italic">
              * Tombol presensi aktif setelah mengambil foto selfie dan GPS berada dalam radius 200m sekolah.
            </p>
          )}
        </div>

        {/* Kartu Status Presensi Hari Ini */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-600" />
            <span>Catatan Presensi Hari Ini</span>
          </h3>

          {attendance ? (
            <div className="space-y-3">
              {/* Presensi Masuk */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Jam Masuk</span>
                  <span className="text-sm font-black text-slate-800">
                    {attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString('id-ID') : '-'}
                  </span>
                  {attendance.checkInLateMinutes > 0 && (
                    <span className="text-[11px] text-rose-600 font-semibold block">
                      Terlambat {attendance.checkInLateMinutes} menit
                    </span>
                  )}
                </div>
                <div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      attendance.checkInStatus === 'HADIR'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : attendance.checkInStatus === 'TERLAMBAT'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {attendance.checkInStatus || 'BELUM ABSEN'}
                  </span>
                </div>
              </div>

              {/* Presensi Pulang */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Jam Pulang</span>
                  <span className="text-sm font-black text-slate-800">
                    {attendance.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString('id-ID') : '-'}
                  </span>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      attendance.checkOutStatus === 'PULANG'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : attendance.checkOutStatus === 'BOLOS'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {attendance.checkOutStatus || 'BELUM ABSEN'}
                  </span>
                </div>
              </div>

              {attendance.checkInTime && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Foto Presensi Tersimpan:</span>
                  <img
                    src={`/api/attendance/${encodeURIComponent(student.id)}/${today}/photo`}
                    alt="Foto Presensi"
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Anda belum melakukan presensi hari ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
