"use client";

import { useState } from 'react';
import { 
  FileUp, CheckCircle2, Clock, AlertCircle, FileText, 
  Users, GraduationCap, Eye, Trash2, Upload, Loader2, 
  ExternalLink, X, ShieldAlert, Sparkles, FileCheck, Award
} from 'lucide-react';
import { uploadStudentDocument, deleteStudentDocument } from '@/app/actions/document';

interface DocumentItem {
  id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  status: string; // "PENDING", "VERIFIED", "REJECTED"
  feedback: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

interface StudentDocumentsClientProps {
  documents: DocumentItem[];
  studentName: string;
}

const DOCUMENT_SLOTS = [
  {
    type: 'AKTE_KELAHIRAN',
    title: 'Akte Kelahiran',
    desc: 'Scan atau foto asli Akta Kelahiran resmi dari Dinas Kependudukan dan Catatan Sipil (Disdukcapil).',
    icon: Award,
    color: 'from-blue-500 to-indigo-600',
    lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    type: 'KARTU_KELUARGA',
    title: 'Kartu Keluarga (KK)',
    desc: 'Scan atau foto asli Kartu Keluarga terbaru yang mencantumkan nama siswa dan orang tua.',
    icon: Users,
    color: 'from-purple-500 to-indigo-600',
    lightColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    type: 'IJAZAH_SMP',
    title: 'Ijazah SMP / MTs atau SKL',
    desc: 'Scan ijazah asli atau Surat Keterangan Lulus (SKL) resmi dari sekolah asal SMP/MTs.',
    icon: GraduationCap,
    color: 'from-emerald-500 to-teal-600',
    lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

export default function StudentDocumentsClient({ documents, studentName }: StudentDocumentsClientProps) {
  const [loadingDocType, setLoadingDocType] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Cari dokumen berdasarkan tipe
  const getDoc = (type: string) => documents.find((d) => d.docType === type);

  // Hitung progres kelengkapan
  const uploadedCount = DOCUMENT_SLOTS.filter((slot) => getDoc(slot.type)).length;
  const verifiedCount = DOCUMENT_SLOTS.filter((slot) => getDoc(slot.type)?.status === 'VERIFIED').length;
  const progressPercent = Math.round((uploadedCount / DOCUMENT_SLOTS.length) * 100);

  // Handler Upload Dokumen
  const handleUpload = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal adalah 5MB.');
      return;
    }

    setLoadingDocType(docType);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('docType', docType);
    formData.append('file', file);

    try {
      await uploadStudentDocument(formData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah dokumen.');
    } finally {
      setLoadingDocType(null);
      e.target.value = '';
    }
  };

  // Handler Hapus Dokumen
  const handleDelete = async (docType: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus berkas ini?')) return;
    setLoadingDocType(docType);
    try {
      await deleteStudentDocument(docType);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus dokumen.');
    } finally {
      setLoadingDocType(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <FileUp className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-slate-800">
              Upload Berkas Persyaratan (Kelas 10)
            </h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Wajib dilengkapi oleh seluruh siswa baru kelas 10 untuk arsip resmi buku induk sekolah dan verifikasi Dapodik.
          </p>
        </div>

        {/* Badge Progres */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm">
            {progressPercent}%
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Kelengkapan Berkas</div>
            <div className="text-sm font-bold text-slate-800">
              {uploadedCount} dari {DOCUMENT_SLOTS.length} Dokumen
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              {verifiedCount} Dokumen Terverifikasi Sah
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Visual */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Error Message Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="underline font-bold">
            Tutup
          </button>
        </div>
      )}

      {/* Grid 3 Kartu Unggah Dokumen Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DOCUMENT_SLOTS.map((slot) => {
          const doc = getDoc(slot.type);
          const Icon = slot.icon;
          const isLoading = loadingDocType === slot.type;

          return (
            <div
              key={slot.type}
              className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                doc?.status === 'VERIFIED'
                  ? 'border-emerald-200 ring-2 ring-emerald-500/10'
                  : doc?.status === 'REJECTED'
                  ? 'border-rose-200 ring-2 ring-rose-500/10'
                  : 'border-slate-100 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header Kartu Dokumen */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-tr ${slot.color} text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Status Badge */}
                  {doc ? (
                    doc.status === 'VERIFIED' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terverifikasi Sah
                      </span>
                    ) : doc.status === 'REJECTED' ? (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Perlu Perbaikan
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Menunggu TU
                      </span>
                    )
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">
                      Belum Diunggah
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-800">{slot.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {slot.desc}
                </p>

                {/* Catatan Perbaikan jika ditolak TU */}
                {doc?.status === 'REJECTED' && doc.feedback && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <span className="font-bold block mb-0.5">Catatan Tata Usaha (TU):</span>
                    {doc.feedback}
                  </div>
                )}

                {/* Informasi File yang Terunggah */}
                {doc && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 truncate max-w-[180px]">
                        {doc.fileName}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : ''}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Diunggah: {new Date(doc.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })} WIB
                    </span>
                  </div>
                )}
              </div>

              {/* Aksi Upload / Ganti / Lihat */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                {isLoading ? (
                  <div className="py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Memproses dokumen...</span>
                  </div>
                ) : doc ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Berkas
                    </button>

                    {/* Tombol Ganti File jika belum diverifikasi atau ditolak */}
                    {doc.status !== 'VERIFIED' && (
                      <label className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors" title="Ganti Berkas">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                          onChange={(e) => handleUpload(slot.type, e)}
                          className="hidden"
                        />
                      </label>
                    )}

                    {doc.status !== 'VERIFIED' && (
                      <button
                        onClick={() => handleDelete(slot.type)}
                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Hapus Berkas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Pilih & Upload {slot.title}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                      onChange={(e) => handleUpload(slot.type, e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Petunjuk Pengunggahan Berkas */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <h4 className="font-bold text-amber-950">Ketentuan Berkas Siswa Baru</h4>
            <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5">
              <li>Pastikan dokumen hasil scan atau foto terlihat jelas, tidak terpotong, dan dapat dibaca.</li>
              <li>Format yang didukung: <strong>PDF, JPG, JPEG, dan PNG</strong> dengan ukuran maksimal <strong>5 MB per file</strong>.</li>
              <li>Petugas Tata Usaha (TU) akan memverifikasi keabsahan dokumen dalam waktu 1x24 jam kerja.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Pratinjau Dokumen */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{previewDoc.fileName}</h3>
                <span className="text-xs text-slate-400">
                  {previewDoc.fileType} • {previewDoc.fileSize ? `${Math.round(previewDoc.fileSize / 1024)} KB` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.fileUrl}
                  download={previewDoc.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  title="Buka / Download di Tab Baru"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Preview */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-100/50 flex items-center justify-center min-h-[400px]">
              {previewDoc.fileType === 'application/pdf' ? (
                <iframe
                  src={previewDoc.fileUrl}
                  className="w-full h-[550px] rounded-xl border border-slate-200 shadow-inner"
                  title="Pratinjau PDF"
                />
              ) : (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[550px] w-auto object-contain rounded-xl shadow-md border border-slate-200"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
