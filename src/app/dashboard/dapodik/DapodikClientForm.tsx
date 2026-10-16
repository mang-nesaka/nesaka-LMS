"use client";

import { useState } from 'react';
import { saveDapodikForm } from '@/app/actions/dapodik';
import { 
  User, CheckCircle2, AlertCircle, FileCheck, 
  MapPin, HeartHandshake, Award, ShieldAlert, Send
} from 'lucide-react';

interface Props {
  existingData: any;
  defaultStudentName: string;
}

export default function DapodikClientForm({ existingData, defaultStudentName }: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Jika siswa sudah pernah mengisi form
  if (existingData || success) {
    const data = existingData || {};
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <FileCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                Sudah Terisi
              </span>
              <h3 className="text-xl font-bold text-slate-900">Formulir Dapodik Berhasil Disimpan</h3>
            </div>
            <p className="text-slate-600 text-sm mt-2">
              Data Anda telah tersimpan secara resmi di sistem pangkalan data sekolah (Dapodik). 
              Sesuai ketentuan, formulir ini hanya dapat diisi satu kali oleh siswa.
            </p>
            <p className="text-xs text-slate-500 mt-2 italic">
              *Jika ada kesalahan data atau perubahan informasi penting, silakan hubungi petugas Tata Usaha (TU) sekolah.
            </p>
          </div>
        </div>

        {/* Ringkasan Singkat Data */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h4 className="text-md font-bold text-slate-800 border-b pb-2">Ringkasan Data Tersimpan</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Nama Lengkap</p>
              <p className="font-semibold text-slate-800">{data.namaLengkap || defaultStudentName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">NISN</p>
              <p className="font-semibold text-slate-800">{data.nisn || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">NIK Siswa</p>
              <p className="font-semibold text-slate-800">{data.nik || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Tempat, Tanggal Lahir</p>
              <p className="font-semibold text-slate-800">{data.tempatLahir}, {data.tanggalLahir}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Nama Ayah</p>
              <p className="font-semibold text-slate-800">{data.namaAyah || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Nama Ibu</p>
              <p className="font-semibold text-slate-800">{data.namaIbu || '-'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-slate-400 text-xs">Alamat Domisili</p>
              <p className="font-semibold text-slate-800">{data.alamat || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Nomor WhatsApp / HP</p>
              <p className="font-semibold text-slate-800">{data.noHp || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      await saveDapodikForm(formData);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan formulir. Mohon periksa kembali.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-semibold">Perhatian Pengisian Formulir Dapodik:</p>
          <p className="mt-1 text-amber-800">
            Formulir ini hanya dapat diisi <strong>satu kali</strong>. Pastikan seluruh data (NISN, NIK, Nama Orang Tua, dll) diisi dengan teliti dan sesuai dengan dokumen resmi (Kartu Keluarga / Ijazah).
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* BAGIAN 1: IDENTITAS PESERTA DIDIK */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-indigo-50/70 p-5 sm:p-6 border-b border-indigo-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">1. Identitas Peserta Didik (Wajib Diisi)</h3>
              <p className="text-xs text-slate-500">Data pribadi siswa baru kelas 10</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nama Lengkap Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="namaLengkap"
                defaultValue={defaultStudentName}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                name="jenisKelamin"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                NISN (Nomor Induk Siswa Nasional) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nisn"
                placeholder="Contoh: 0093988153"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                NIS (Nomor Induk Sekolah - Jika Ada)
              </label>
              <input
                type="text"
                name="nis"
                placeholder="Contoh: 252610202"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                NIK (Nomor Induk Kependudukan / No KTP/KK) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nik"
                placeholder="16 Digit NIK di Kartu Keluarga"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                No. Seri Ijazah SMP/MTs
              </label>
              <input
                type="text"
                name="noIjazah"
                placeholder="Nomor Ijazah Jenjang Sebelumnya"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                No. Ujian Sekolah SMP
              </label>
              <input
                type="text"
                name="noUjian"
                placeholder="Nomor Peserta Ujian Jenjang Sebelumnya"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nama Sekolah Asal (SMP/MTs)
              </label>
              <input
                type="text"
                name="sekolahAsal"
                placeholder="Contoh: SMPN 1 Kandanghaur"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                NPSN Sekolah Asal
              </label>
              <input
                type="text"
                name="npsnAsal"
                placeholder="8 Digit NPSN Sekolah Asal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tempat Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tempatLahir"
                placeholder="Kota / Kabupaten Lahir"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggalLahir"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Agama <span className="text-red-500">*</span>
              </label>
              <select
                name="agama"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen Protestan">Kristen Protestan</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Kebutuhan Khusus
              </label>
              <input
                type="text"
                name="berkebutuhanKhusus"
                placeholder="Isi 'Tidak ada' jika tidak ada"
                defaultValue="Tidak ada"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Alat Transportasi ke Sekolah
              </label>
              <input
                type="text"
                name="transportasi"
                placeholder="Contoh: Sepeda motor, Jalan kaki, Angkutan umum"
                defaultValue="Sepeda motor"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Jenis Tinggal
              </label>
              <select
                name="jenisTinggal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="Bersama orang tua">Bersama orang tua</option>
                <option value="Wali">Wali</option>
                <option value="Kos">Kos</option>
                <option value="Asrama">Asrama</option>
                <option value="Panti Asuhan">Panti Asuhan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                No. Handphone / WhatsApp Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="noHp"
                placeholder="Contoh: 081234567890"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Email Pribadi
              </label>
              <input
                type="email"
                name="emailPribadi"
                placeholder="email@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                No. Registrasi Akta Lahir
              </label>
              <input
                type="text"
                name="noAktaLahir"
                placeholder="Nomor Akta Kelahiran"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Alamat Detail */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Detail Alamat Tempat Tinggal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Alamat Jalan / Blok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="alamat"
                    placeholder="Contoh: Blok Kebon RT 02 / RW 01"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">RT / RW</label>
                  <input
                    type="text"
                    name="rtRw"
                    placeholder="002 / 001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Dusun / Kampung</label>
                  <input
                    type="text"
                    name="dusun"
                    placeholder="Nama Dusun"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kelurahan / Desa</label>
                  <input
                    type="text"
                    name="kelurahan"
                    placeholder="Contoh: Sidamulya"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    name="kecamatan"
                    placeholder="Contoh: Bongas"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    name="kabupaten"
                    placeholder="Contoh: Kab. Indramayu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Provinsi</label>
                  <input
                    type="text"
                    name="propinsi"
                    placeholder="Contoh: Jawa Barat"
                    defaultValue="Jawa Barat"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    name="kodePos"
                    placeholder="Contoh: 45255"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Bantuan KIP / PIP */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Bantuan Pendidikan (KIP / PKH / PIP)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Penerima KPS / PKH?</label>
                  <select
                    name="penerimaKps"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Penerima KIP?</label>
                  <select
                    name="penerimaKip"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor KIP (Jika Ada)</label>
                  <input
                    type="text"
                    name="noKip"
                    placeholder="Nomor Kartu Indonesia Pintar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: DATA ORANG TUA (AYAH & IBU) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-purple-50/70 p-5 sm:p-6 border-b border-purple-100 flex items-center gap-3">
            <div className="p-2 bg-purple-600 text-white rounded-lg">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">2. Data Orang Tua Kandung (Wajib Diisi)</h3>
              <p className="text-xs text-slate-500">Informasi Ayah dan Ibu sesuai Kartu Keluarga</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Ayah */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 text-indigo-700 mb-3 flex items-center">
                Data Ayah Kandung
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Ayah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="namaAyah"
                    required
                    placeholder="Nama Lengkap Ayah"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun Lahir Ayah</label>
                  <input
                    type="number"
                    name="tahunLahirAyah"
                    placeholder="Contoh: 1978"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pendidikan Ayah</label>
                  <select
                    name="pendidikanAyah"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="Tidak Sekolah">Tidak Sekolah</option>
                    <option value="SD / Sederajat">SD / Sederajat</option>
                    <option value="SMP / Sederajat">SMP / Sederajat</option>
                    <option value="SMA / Sederajat">SMA / Sederajat</option>
                    <option value="D1/D2/D3">D1/D2/D3</option>
                    <option value="S1">S1</option>
                    <option value="S2/S3">S2/S3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pekerjaan Ayah</label>
                  <input
                    type="text"
                    name="pekerjaanAyah"
                    placeholder="Contoh: Buruh, Petani, Wiraswasta, PNS"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Penghasilan Bulanan Ayah</label>
                  <select
                    name="penghasilanAyah"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="Kurang dari Rp. 500,000">Kurang dari Rp. 500,000</option>
                    <option value="Rp. 500,000 - Rp. 999,999">Rp. 500,000 - Rp. 999,999</option>
                    <option value="Rp. 1,000,000 - Rp. 1,999,999">Rp. 1,000,000 - Rp. 1,999,999</option>
                    <option value="Rp. 2,000,000 - Rp. 4,999,999">Rp. 2,000,000 - Rp. 4,999,999</option>
                    <option value="Lebih dari Rp. 5,000,000">Lebih dari Rp. 5,000,000</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ibu */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-bold text-slate-800 text-purple-700 mb-3 flex items-center">
                Data Ibu Kandung
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Ibu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="namaIbu"
                    required
                    placeholder="Nama Lengkap Ibu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun Lahir Ibu</label>
                  <input
                    type="number"
                    name="tahunLahirIbu"
                    placeholder="Contoh: 1982"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pendidikan Ibu</label>
                  <select
                    name="pendidikanIbu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="Tidak Sekolah">Tidak Sekolah</option>
                    <option value="SD / Sederajat">SD / Sederajat</option>
                    <option value="SMP / Sederajat">SMP / Sederajat</option>
                    <option value="SMA / Sederajat">SMA / Sederajat</option>
                    <option value="D1/D2/D3">D1/D2/D3</option>
                    <option value="S1">S1</option>
                    <option value="S2/S3">S2/S3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pekerjaan Ibu</label>
                  <input
                    type="text"
                    name="pekerjaanIbu"
                    placeholder="Contoh: Ibu Rumah Tangga, Pedagang, dsb"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Penghasilan Bulanan Ibu</label>
                  <select
                    name="penghasilanIbu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                    <option value="Kurang dari Rp. 500,000">Kurang dari Rp. 500,000</option>
                    <option value="Rp. 500,000 - Rp. 999,999">Rp. 500,000 - Rp. 999,999</option>
                    <option value="Rp. 1,000,000 - Rp. 1,999,999">Rp. 1,000,000 - Rp. 1,999,999</option>
                    <option value="Rp. 2,000,000 - Rp. 4,999,999">Rp. 2,000,000 - Rp. 4,999,999</option>
                    <option value="Lebih dari Rp. 5,000,000">Lebih dari Rp. 5,000,000</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: DATA PERIODIK */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-emerald-50/70 p-5 sm:p-6 border-b border-emerald-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">3. Data Periodik Siswa</h3>
              <p className="text-xs text-slate-500">Kondisi fisik, jarak tempuh, dan minat bakat</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tinggi Badan (cm)</label>
              <input
                type="number"
                name="tinggiBadan"
                placeholder="Contoh: 165"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Berat Badan (kg)</label>
              <input
                type="number"
                name="beratBadan"
                placeholder="Contoh: 50"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jarak Tempat Tinggal</label>
              <select
                name="jarakSekolah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="Kurang dari 1 km">Kurang dari 1 km</option>
                <option value="Lebih dari 1 km">Lebih dari 1 km</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Waktu Tempuh ke Sekolah</label>
              <input
                type="text"
                name="waktuTempuh"
                placeholder="Contoh: 15 Menit"
                defaultValue="15 Menit"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jumlah Saudara Kandung</label>
              <input
                type="number"
                name="jmlSaudara"
                placeholder="Contoh: 2"
                defaultValue="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Anak Ke-</label>
              <input
                type="number"
                name="anakKe"
                placeholder="Contoh: 1"
                defaultValue="1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Cita-cita</label>
              <input
                type="text"
                name="citaCita"
                placeholder="Contoh: Mekanik Ahli, Pengusaha"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Hobi</label>
              <input
                type="text"
                name="hobi"
                placeholder="Contoh: Otomotif, Futsal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pernah TK / PAUD?</label>
              <select
                name="asalTkPaud"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="Ya">Ya</option>
                <option value="Tidak">Tidak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pernyataan & Tombol Kirim */}
        <div className="bg-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
            <input type="checkbox" required className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span>
              Saya menyatakan dengan sesungguhnya bahwa seluruh data yang diisikan adalah benar dan dapat dipertanggungjawabkan secara hukum.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-70 whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Menyimpan Data...' : 'Kirim Formulir Dapodik'}
          </button>
        </div>
      </form>
    </div>
  );
}
