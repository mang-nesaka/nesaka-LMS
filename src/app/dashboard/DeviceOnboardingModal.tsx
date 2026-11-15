"use client";

import { useEffect, useState } from 'react';
import { 
  Bell, 
  MapPin, 
  Camera, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  X, 
  ShieldCheck,
  ChevronRight,
  Smartphone
} from 'lucide-react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function decodeApplicationServerKey(value: string) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export default function DeviceOnboardingModal({ userRole }: { userRole?: string }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  // Status perizinan
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [geoGranted, setGeoGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);

  // Status loading/proses
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Cek apakah user sudah pernah menyelesaikan atau menutup onboarding di browser ini
    const dismissed = localStorage.getItem('nesaka_device_onboarded');
    
    // Cek mode standalone (apakah PWA sudah terinstall)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) setPwaInstalled(true);

    // Cek izin notifikasi saat ini
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') setNotifGranted(true);
    }

    // Tangkap event install PWA
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Periksa status izin navigator.permissions jika didukung
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((res) => {
        if (res.state === 'granted') setGeoGranted(true);
      }).catch(() => {});

      navigator.permissions.query({ name: 'camera' as PermissionName }).then((res) => {
        if (res.state === 'granted') setCameraGranted(true);
      }).catch(() => {});
    }

    // Jika belum pernah diselesaikan dan setidaknya ada izin yang belum aktif, tampilkan modal
    if (!dismissed) {
      // Delay sedikit agar halaman dashboard selesai render
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!mounted || !isOpen) return null;

  const totalSteps = 4;
  const completedSteps = [pwaInstalled, notifGranted, geoGranted, cameraGranted].filter(Boolean).length;

  function closeModal() {
    localStorage.setItem('nesaka_device_onboarded', 'true');
    setIsOpen(false);
  }

  // 1. Aktivasi PWA Install
  async function handleInstallPwa() {
    setBusyAction('pwa');
    setStatusMessage(null);
    try {
      if (!installPrompt) {
        setStatusMessage('Gunakan menu browser (titik tiga) lalu pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama".');
        return;
      }
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setPwaInstalled(true);
        setStatusMessage('Aplikasi berhasil dipasang di layar utama!');
      }
    } catch {
      setStatusMessage('Pemasangan aplikasi dibatalkan.');
    } finally {
      setBusyAction(null);
    }
  }

  // 2. Aktivasi Notifikasi
  async function handleActivateNotification() {
    setBusyAction('notif');
    setStatusMessage(null);
    try {
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        throw new Error('Notifikasi tidak didukung di browser ini.');
      }

      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission;
      
      if (permission !== 'granted') {
        throw new Error('Izin notifikasi tidak diberikan atau diblokir.');
      }

      // Ambil public key
      const keyResponse = await fetch('/api/push-subscriptions');
      const keyData = await keyResponse.json();
      if (!keyResponse.ok) throw new Error(keyData.error || 'Konfigurasi VAPID belum tersedia.');

      // Pastikan Service Worker ready
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      const reg = await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeApplicationServerKey(keyData.publicKey),
        });
      }

      // Simpan subscription ke server
      await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      setNotifGranted(true);
      setStatusMessage('Notifikasi berhasil diaktifkan di perangkat ini.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Gagal mengaktifkan notifikasi.');
    } finally {
      setBusyAction(null);
    }
  }

  // 3. Aktivasi Lokasi GPS
  async function handleActivateLocation() {
    setBusyAction('geo');
    setStatusMessage(null);
    try {
      if (!('geolocation' in navigator)) {
        throw new Error('GPS/Lokasi tidak didukung pada browser ini.');
      }

      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      setGeoGranted(true);
      setStatusMessage('Izin lokasi berhasil diaktifkan untuk presensi.');
    } catch {
      setStatusMessage('Izin lokasi belum diberikan. Pastikan GPS HP aktif.');
    } finally {
      setBusyAction(null);
    }
  }

  // 4. Aktivasi Kamera
  async function handleActivateCamera() {
    setBusyAction('camera');
    setStatusMessage(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Kamera tidak didukung pada browser ini.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });

      // Segera matikan stream setelah izin didapatkan
      stream.getTracks().forEach((track) => track.stop());

      setCameraGranted(true);
      setStatusMessage('Izin kamera berhasil diaktifkan untuk presensi & scan QR.');
    } catch {
      setStatusMessage('Izin kamera belum diberikan.');
    } finally {
      setBusyAction(null);
    }
  }

  // Aktifkan Semua Berurutan
  async function handleActivateAll() {
    setStatusMessage('Memulai aktivasi seluruh izin perangkat...');
    if (!notifGranted) await handleActivateNotification();
    if (!geoGranted) await handleActivateLocation();
    if (!cameraGranted) await handleActivateCamera();
    if (!pwaInstalled && installPrompt) await handleInstallPwa();
    setStatusMessage('Proses penyiapan perangkat selesai.');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header Modal */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white shrink-0">
          <button
            type="button"
            onClick={closeModal}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            title="Tutup & Lewati"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Persiapan Perangkat {userRole === 'STUDENT' ? 'Siswa' : ''}
            </span>
          </div>
          <h2 id="onboarding-title" className="text-xl sm:text-2xl font-black tracking-tight">
            Aktifkan Izin Aplikasi LMS Nesaka
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Aktifkan fitur-fitur di bawah ini agar presensi GPS, foto selfie, notifikasi pengumuman, dan aplikasi berjalan lancar di HP Anda.
          </p>

          {/* Progress Bar */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="font-medium text-indigo-100">
              Kesiapan: {completedSteps} dari {totalSteps} fitur aktif
            </span>
            <span className="font-bold">
              {Math.round((completedSteps / totalSteps) * 100)}%
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/20">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content List of Permissions */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5">
          {statusMessage && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs text-indigo-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* 1. Pasang Aplikasi PWA */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-3.5 transition-colors hover:bg-slate-50/80">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2.5 ${pwaInstalled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Pasang Aplikasi ke Layar Utama (PWA)</h3>
                <p className="text-xs text-slate-500">Buka LMS Nesaka langsung dari icon aplikasi di HP tanpa lewat browser</p>
              </div>
            </div>
            <div>
              {pwaInstalled ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Aktif
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  disabled={busyAction !== null}
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Pasang
                </button>
              )}
            </div>
          </div>

          {/* 2. Izin Notifikasi */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-3.5 transition-colors hover:bg-slate-50/80">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2.5 ${notifGranted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Notifikasi Pengumuman & Tugas</h3>
                <p className="text-xs text-slate-500">Menerima broadcast kesiswaan & pemberitahuan tugas sekolah di HP</p>
              </div>
            </div>
            <div>
              {notifGranted ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Aktif
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleActivateNotification}
                  disabled={busyAction !== null}
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Izinkan
                </button>
              )}
            </div>
          </div>

          {/* 3. Izin Lokasi GPS */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-3.5 transition-colors hover:bg-slate-50/80">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2.5 ${geoGranted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Akses Lokasi (GPS Presensi)</h3>
                <p className="text-xs text-slate-500">Memvalidasi kehadiran saat berada di lingkungan sekolah</p>
              </div>
            </div>
            <div>
              {geoGranted ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Aktif
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleActivateLocation}
                  disabled={busyAction !== null}
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Izinkan
                </button>
              )}
            </div>
          </div>

          {/* 4. Izin Kamera */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-3.5 transition-colors hover:bg-slate-50/80">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2.5 ${cameraGranted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Akses Kamera (Selfie & Scan QR)</h3>
                <p className="text-xs text-slate-500">Dibutuhkan untuk foto selfie absensi dan scan barcode kelas</p>
              </div>
            </div>
            <div>
              {cameraGranted ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Aktif
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleActivateCamera}
                  disabled={busyAction !== null}
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Izinkan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={closeModal}
            className="w-full sm:w-auto text-xs font-semibold text-slate-500 hover:text-slate-800 py-2 px-3 rounded-lg transition-colors order-2 sm:order-1"
          >
            {completedSteps === totalSteps ? 'Selesai & Masuk Dashboard' : 'Lewati untuk Sekarang'}
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2 order-1 sm:order-2">
            {completedSteps < totalSteps && (
              <button
                type="button"
                onClick={handleActivateAll}
                disabled={busyAction !== null}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                Aktifkan Semua Sekaligus
              </button>
            )}
            {completedSteps === totalSteps && (
              <button
                type="button"
                onClick={closeModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Perangkat Siap Digunakan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
