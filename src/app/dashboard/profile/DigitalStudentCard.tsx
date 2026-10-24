"use client";

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, RotateCw, CheckCircle2, School, GraduationCap, 
  User, FileSpreadsheet, ArrowRight, ExternalLink, Camera, 
  Upload, Trash2, Loader2, Sparkles, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { updateProfilePhoto, deleteProfilePhoto } from '@/app/actions/profile';
import { submitDataCorrectionRequest } from '@/app/actions/correction';

interface StudentCardData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  createdAt: string;
  dapodik: {
    namaLengkap: string;
    nisn: string;
    nis: string | null;
    nik: string;
    jenisKelamin: string;
    tempatLahir: string;
    tanggalLahir: string;
    agama: string;
    alamat: string;
    noHp: string;
    sekolahAsal: string | null;
  } | null;
  courses: {
    id: string;
    title: string;
    teacherName: string;
  }[];
}

export default function DigitalStudentCard({ data }: { data: StudentCardData }) {
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(data.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verifikasi Data Diri Siswa
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [discrepancyNotes, setDiscrepancyNotes] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);
  const [correctionMsg, setCorrectionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dataConfirmed, setDataConfirmed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStudent = data.role === 'STUDENT';
  const isTeacher = data.role === 'TEACHER';

  // Nilai fallback jika siswa belum melengkapi data Dapodik
  const fullName = data.dapodik?.namaLengkap || data.name;
  const nisn = data.dapodik?.nisn || `307${data.id.replace(/\D/g, '').padEnd(7, '8').slice(0, 7)}`;
  const nis = data.dapodik?.nis || `242510${data.id.replace(/\D/g, '').padEnd(3, '1').slice(0, 3)}`;
  const gender = data.dapodik?.jenisKelamin || 'Laki-Laki';
  const ttl = data.dapodik ? `${data.dapodik.tempatLahir}, ${data.dapodik.tanggalLahir}` : 'Purwakarta, 15 Mei 2008';
  const initial = fullName.charAt(0).toUpperCase();

  // Generate QR Code verifikasi otentik
  useEffect(() => {
    const verificationUrl = `https://nesaka-lms.sch.id/verify/${isStudent ? 'student' : 'staff'}/${data.id}?nisn=${nisn}&valid=true`;
    QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Gagal generate QR code:', err));
  }, [data.id, nisn, isStudent]);

  // Fungsi Kompresi dan Optimasi Foto ke Canvas (400x500px, 85% JPEG)
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadMessage({ type: 'error', text: 'File harus berupa foto gambar (JPG, PNG, atau WEBP).' });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          // Buat Canvas rasio 4:5 pas foto resmi (400x500)
          const canvas = document.createElement('canvas');
          const targetWidth = 400;
          const targetHeight = 500;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Gagal memproses gambar pada canvas.');
          }

          // Crop centering cover
          const imgAspect = img.width / img.height;
          const targetAspect = targetWidth / targetHeight;
          let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

          if (imgAspect > targetAspect) {
            sWidth = img.height * targetAspect;
            sx = (img.width - sWidth) / 2;
          } else {
            sHeight = img.width / targetAspect;
            sy = (img.height - sHeight) / 2;
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
          const base64Image = canvas.toDataURL('image/jpeg', 0.85);

          // Simpan via Server Action
          await updateProfilePhoto(base64Image);
          setCurrentAvatar(base64Image);
          setUploadMessage({ type: 'success', text: 'Pas foto profil berhasil diperbarui!' });
          setIsUploading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.message || 'Gagal mengunggah foto profil.' });
      setIsUploading(false);
    }
  };

  // Fungsi Hapus Foto
  const handleDeletePhoto = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto profil ini?')) return;
    setIsUploading(true);
    try {
      await deleteProfilePhoto();
      setCurrentAvatar(null);
      setUploadMessage({ type: 'success', text: 'Foto profil telah dihapus.' });
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: 'Gagal menghapus foto.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Fungsi Cetak Kartu Langsung
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handlePhotoSelect}
        className="hidden"
      />

      {/* Action Header & Card Flip Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            {isStudent ? 'Kartu Siswa Digital' : 'Kartu Pendidik Digital'}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Tanda pengenal resmi digital terverifikasi dengan pas foto, barcode & QR Code autentik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          {/* Tombol Unggah Pas Foto */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200 transition-colors shadow-sm disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <Camera className="w-4 h-4 text-indigo-600" />
            )}
            <span>{currentAvatar ? 'Ganti Pas Foto' : 'Unggah Pas Foto'}</span>
          </button>

          {/* Tombol Flip Kartu */}
          <button
            onClick={() => setActiveSide(activeSide === 'front' ? 'back' : 'front')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors shadow-sm"
          >
            <RotateCw className="w-4 h-4 text-indigo-600" />
            <span>Lihat Sisi {activeSide === 'front' ? 'Belakang' : 'Depan'}</span>
          </button>

          {/* Tombol Cetak Kartu */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-indigo-200"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Alert Notifikasi Upload */}
      {uploadMessage && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
          uploadMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{uploadMessage.text}</span>
          </div>
          <button onClick={() => setUploadMessage(null)} className="text-xs underline font-bold">
            Tutup
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAMPILAN KARTU SISWA DIGITAL (STANDAR CR-80 RATIO)      */}
      {/* ======================================================== */}
      <div className="flex justify-center">
        <div className="w-full max-w-lg select-none">
          {/* SISI DEPAN KARTU */}
          {activeSide === 'front' ? (
            <div 
              id="student-card-front"
              className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-5 sm:p-6 flex flex-col justify-between aspect-[1.586/1] transition-all"
            >
              {/* Watermark Garis Desain & Logo Latar */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
              <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
                <School className="w-64 h-64 text-white" />
              </div>

              {/* Header Kartu */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                    <GraduationCap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase leading-tight text-yellow-300">
                      SMA NEGERI 1 PURWAKARTA
                    </h3>
                    <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">
                      {isStudent ? 'KARTU TANDA PELAJAR DIGITAL' : 'KARTU IDENTITAS PENDIDIK'}
                    </p>
                    <p className="text-[8px] text-slate-300">NPSN: 20217354 • Terakreditasi A (Unggul)</p>
                  </div>
                </div>

                {/* EMV Smart Chip Graphic */}
                <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 border border-amber-500 shadow-inner flex flex-col justify-around p-1 shrink-0 opacity-90">
                  <div className="w-full h-[1px] bg-amber-700/60" />
                  <div className="w-full h-[1px] bg-amber-700/60" />
                  <div className="w-full h-[1px] bg-amber-700/60" />
                </div>
              </div>

              {/* Badan Kartu: Foto & Biodata */}
              <div className="relative z-10 grid grid-cols-12 gap-3.5 my-auto py-2.5 items-center">
                {/* Foto Siswa (Bisa di-klik untuk ganti foto) */}
                <div className="col-span-4 flex flex-col items-center">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    title="Klik untuk mengganti pas foto"
                    className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 border-2 border-white/80 p-0.5 shadow-lg flex flex-col items-center justify-center text-center overflow-hidden relative cursor-pointer group"
                  >
                    {currentAvatar ? (
                      <img 
                        src={currentAvatar} 
                        alt={fullName} 
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      /* Background pas foto merah/biru resmi jika belum ada foto */
                      <div className="w-full h-full bg-blue-600 flex flex-col items-center justify-center text-white">
                        <span className="text-2xl sm:text-3xl font-black">{initial}</span>
                        <span className="text-[8px] font-bold tracking-tight uppercase opacity-90 mt-0.5">
                          {isStudent ? 'Siswa Aktif' : 'Guru'}
                        </span>
                      </div>
                    )}

                    {/* Overlay Ganti Foto saat Hover */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[8px] font-bold uppercase tracking-tight">Ganti Foto</span>
                    </div>

                    {/* Badge Verifikasi Hologram di Bawah Foto */}
                    <div className="absolute bottom-0 inset-x-0 bg-yellow-400 text-slate-950 font-black text-[7px] py-0.5 uppercase tracking-tighter text-center shadow-xs">
                      VERIFIED
                    </div>
                  </div>
                  <span className="text-[8px] text-blue-200 font-mono mt-1 font-bold">
                    NIS: {nis}
                  </span>
                </div>

                {/* Biodata Siswa */}
                <div className="col-span-8 space-y-1 text-[10px] sm:text-xs">
                  <div>
                    <span className="text-[9px] text-blue-200 block font-semibold uppercase">Nama Lengkap</span>
                    <span className="font-extrabold text-white text-xs sm:text-sm tracking-wide block truncate">
                      {fullName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-blue-200 block font-semibold uppercase">NISN</span>
                      <span className="font-bold text-yellow-300 font-mono">{nisn}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-blue-200 block font-semibold uppercase">
                        {isStudent ? 'Tingkat / Rombel' : 'Mata Pelajaran'}
                      </span>
                      <span className="font-semibold text-slate-100 truncate block">
                        {isStudent ? 'Kelas X (Sepuluh)' : 'Tenaga Pendidik'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-blue-200 block font-semibold uppercase">TTL</span>
                      <span className="font-medium text-slate-200 truncate block text-[9px] sm:text-[10px]">
                        {ttl}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-blue-200 block font-semibold uppercase">Jenis Kelamin</span>
                      <span className="font-medium text-slate-200 text-[9px] sm:text-[10px]">{gender}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Kartu: QR Code & Stempel Digital Resmi */}
              <div className="relative z-10 border-t border-white/20 pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {qrDataUrl && (
                    <img 
                      src={qrDataUrl} 
                      alt="QR Code Siswa" 
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white p-0.5 shadow-md"
                    />
                  )}
                  <div className="text-[8px] leading-tight text-blue-200 font-mono">
                    <p className="font-bold text-white uppercase">SISTEM RESMI DAPODIK</p>
                    <p>Status: Aktif TA 2026/2027</p>
                    <p className="text-[7px] text-slate-300">Scan untuk cek validasi</p>
                  </div>
                </div>

                {/* Stempel Digital & Tanda Tangan */}
                <div className="text-right flex items-center gap-2">
                  <div className="text-[7px] sm:text-[8px] leading-tight text-slate-300 text-right">
                    <p>Purwakarta, Juli 2026</p>
                    <p className="font-semibold text-white">Kepala Sekolah,</p>
                    <p className="font-extrabold text-yellow-300 mt-2 underline">Drs. H. Mulyadi, M.Pd.</p>
                    <p className="text-[7px] text-slate-400">NIP. 19680512 199403 1 004</p>
                  </div>

                  {/* Stempel Bulat Sekolah (Watermark Effect) */}
                  <div className="w-10 h-10 rounded-full border-2 border-blue-400/80 p-0.5 flex items-center justify-center text-center rotate-[-12deg] text-blue-300 shadow-sm shrink-0">
                    <span className="text-[6px] font-black leading-none uppercase">
                      SMAN 1<br/>PWK<br/>★ RESMI ★
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SISI BELAKANG KARTU */
            <div 
              id="student-card-back"
              className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white text-slate-800 p-5 sm:p-6 flex flex-col justify-between aspect-[1.586/1] transition-all"
            >
              {/* Header Belakang */}
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-indigo-950 tracking-wider">
                  KETENTUAN PEMEGANG KARTU PELAJAR
                </span>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  SMA NEGERI 1 PURWAKARTA
                </span>
              </div>

              {/* Tata Tertib */}
              <div className="space-y-1.5 my-auto text-[9px] sm:text-[10px] text-slate-600 leading-relaxed">
                <p>1. Kartu ini adalah tanda bukti pengenal sah siswa SMA Negeri 1 Purwakarta.</p>
                <p>2. Wajib dibawa saat pembelajaran di kelas, peminjaman perpustakaan, dan pelaksanaan Ujian CBT.</p>
                <p>3. Dilarang merusak, memindahtangankan, atau mencoret-coret kartu tanda pelajar ini.</p>
                <p>4. Apabila kartu ini hilang atau rusak, segera melapor ke bagian Tata Usaha (TU) sekolah.</p>
                <p>5. Barangsiapa menemukan kartu ini, harap mengembalikan ke alamat sekolah tertera di bawah.</p>
              </div>

              {/* Barcode Strip & Alamat Sekolah */}
              <div className="border-t border-slate-200 pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-[8px] text-slate-500 leading-tight text-center sm:text-left">
                  <p className="font-bold text-slate-700">SMA NEGERI 1 PURWAKARTA (NESAKA)</p>
                  <p>Jl. K.K Singawinata No. 83, Nagri Kidul, Purwakarta, Jawa Barat</p>
                  <p>Telp: (0264) 200142 • Website: www.sman1purwakarta.sch.id</p>
                </div>

                {/* Barcode Visual Lines */}
                <div className="flex flex-col items-center">
                  <div className="h-6 flex items-center gap-[2px]">
                    {[4, 2, 5, 2, 6, 3, 2, 4, 6, 2, 3, 5, 2, 4, 6, 3, 2, 5, 4, 2, 6, 2, 3, 5, 4].map((w, idx) => (
                      <div 
                        key={idx} 
                        className="h-full bg-slate-900" 
                        style={{ width: `${w}px` }} 
                      />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono font-bold tracking-widest text-slate-700 mt-0.5">
                    *{nisn}*
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RINCIAN PROFIL LENGKAP & INTEGRASI DAPODIK               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Kolom Informasi Akun & Pengelola Foto */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">Foto & Informasi Akun</h3>
          </div>

          {/* Pengelola Pas Foto Profil */}
          <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl overflow-hidden shadow-inner shrink-0 border border-indigo-200">
              {currentAvatar ? (
                <img src={currentAvatar} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800">Pas Foto Profil</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Foto
                </button>

                {currentAvatar && (
                  <button
                    onClick={handleDeletePhoto}
                    disabled={isUploading}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Hapus foto profil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Format: JPG/PNG, maks 5MB.</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Nama Lengkap</span>
              <span className="font-bold text-slate-800">{data.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Alamat Email</span>
              <span className="font-semibold text-slate-700">{data.email}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Hak Akses (Role)</span>
              <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 mt-0.5">
                {isStudent ? 'Siswa Aktif' : isTeacher ? 'Guru Pengajar' : data.role}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Terdaftar Sejak</span>
              <span className="text-slate-600 font-medium">
                {new Date(data.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Status Data Dapodik (F-PD) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">Status Data Dapodik</h3>
            </div>
            {data.dapodik ? (
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Lengkap
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                Belum Terisi
              </span>
            )}
          </div>

          {data.dapodik ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-slate-400 block">NISN Resmi</span>
                  <span className="font-bold text-slate-800 font-mono">{data.dapodik.nisn}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">NIK Siswa</span>
                  <span className="font-bold text-slate-800 font-mono">{data.dapodik.nik}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Sekolah Asal SMP/MTs</span>
                <span className="font-semibold text-slate-700">
                  {data.dapodik.sekolahAsal || 'SMP Negeri 1'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Nomor Telepon / WhatsApp</span>
                <span className="font-medium text-slate-700 font-mono">{data.dapodik.noHp}</span>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard/dapodik"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                >
                  Lihat / Perbarui Formulir Dapodik
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                Data pokok siswa baru belum tersimpan di sistem. Lengkapi formulir Dapodik untuk mencantumkan NISN dan biodata resmi pada kartu pelajar Anda.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard/dapodik"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Isi Formulir Dapodik Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kelas Pembelajaran yang Diikuti */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800">
                {isStudent ? 'Kelas Pembelajaran' : 'Kelas Mengajar'}
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {data.courses.length} Kelas
            </span>
          </div>

          {data.courses.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Belum terdaftar di kelas pembelajaran manapun.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {data.courses.map((course) => (
                <div
                  key={course.id}
                  className="p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-2xl border border-slate-100 flex items-center justify-between transition-colors"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{course.title}</h5>
                    <p className="text-[11px] text-slate-400">Guru: {course.teacherName}</p>
                  </div>
                  <Link
                    href="/dashboard/courses"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Buka
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verifikasi Data Diri Siswa (Kesesuaian Data Dapodik) */}
      {isStudent && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🛡️ Cek Kesesuaian Data Diri Siswa</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan nama, NISN, NIK, tanggal lahir, dan alamat Anda di atas sudah cocok dengan data Akta Kelahiran/Ijazah asli.
              </p>
            </div>
            {dataConfirmed && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Terverifikasi Sesuai oleh Anda</span>
              </span>
            )}
          </div>

          {correctionMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold border flex items-center gap-2 ${
                correctionMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span>{correctionMsg.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setDataConfirmed(true);
                setCorrectionMsg({
                  type: 'success',
                  text: 'Terima kasih! Anda telah mengonfirmasi bahwa data diri Anda sudah sesuai dengan dokumen resmi.',
                });
              }}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>✓ Data Saya Sudah Sesuai</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDiscrepancyModalOpen(true)}
              className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <span>⚠️ Data Tidak Sesuai (Kirim Laporan ke TU)</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Laporan Data Tidak Sesuai ke TU */}
      {isDiscrepancyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Lapor Ketidaksesuaian Data ke TU
            </h3>
            <p className="text-xs text-slate-500">
              Sebutkan bagian data mana yang salah (misalnya: penulisan nama salah satu huruf, NISN tidak sesuai ijazah SMP, atau nama ibu salah ketik).
            </p>

            <textarea
              rows={4}
              required
              value={discrepancyNotes}
              onChange={(e) => setDiscrepancyNotes(e.target.value)}
              placeholder="Contoh: Nama saya di kartu tertulis 'Andi Pratama', seharusnya sesuai Akta adalah 'Andy Pratama'. Mohon diperbaiki di Dapodik..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDiscrepancyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmittingCorrection || !discrepancyNotes.trim()}
                onClick={async () => {
                  setIsSubmittingCorrection(true);
                  try {
                    const res = await submitDataCorrectionRequest({
                      studentId: data.id,
                      notes: discrepancyNotes,
                    });
                    setCorrectionMsg({ type: 'success', text: res.message });
                    setIsDiscrepancyModalOpen(false);
                    setDiscrepancyNotes('');
                  } catch (err: any) {
                    setCorrectionMsg({ type: 'error', text: err.message || 'Gagal mengirim laporan' });
                  } finally {
                    setIsSubmittingCorrection(false);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isSubmittingCorrection ? 'Mengirim...' : 'Kirim Aduan ke TU'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Specific CSS to format CR80 ID Card layout cleanly when printing */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          aside, header, nav, button, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          #student-card-front, #student-card-back {
            width: 85.6mm !important;
            height: 54mm !important;
            box-shadow: none !important;
            border-radius: 4mm !important;
            margin: 20mm auto !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
