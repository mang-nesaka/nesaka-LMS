"use client";

import { useState } from 'react';
import { 
  FileCheck, Search, Eye, CheckCircle2, Clock, AlertCircle, 
  ExternalLink, X, Check, XCircle, Loader2, Users, School, Filter
} from 'lucide-react';
import { verifyDocumentAction } from '@/app/actions/document';

interface DocumentRecord {
  id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  status: string;
  feedback: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

interface StudentRow {
  id: string;
  name: string;
  email: string;
  dapodik: {
    nisn: string;
    sekolahAsal: string | null;
  } | null;
  documents: DocumentRecord[];
}

export default function TuDocumentsVerification({ students }: { students: StudentRow[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETE'>('ALL');
  const [activeModalDoc, setActiveModalDoc] = useState<{
    doc: DocumentRecord;
    studentName: string;
  } | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter siswa
  const filteredStudents = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                        s.email.toLowerCase().includes(search.toLowerCase());

    const hasPending = s.documents.some((d) => d.status === 'PENDING');
    const isComplete = s.documents.filter((d) => d.status === 'VERIFIED').length === 3;

    if (filter === 'PENDING') return matchSearch && hasPending;
    if (filter === 'COMPLETE') return matchSearch && isComplete;
    return matchSearch;
  });

  // Action Verifikasi atau Tolak
  const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!activeModalDoc) return;
    setIsProcessing(true);

    try {
      await verifyDocumentAction(activeModalDoc.doc.id, status, feedbackInput);
      setActiveModalDoc(null);
      setFeedbackInput('');
    } catch (err: any) {
      alert(err.message || 'Gagal memproses verifikasi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDoc = (docs: DocumentRecord[], type: string) => docs.find((d) => d.docType === type);

  const renderBadge = (doc: DocumentRecord | undefined, studentName: string) => {
    if (!doc) {
      return (
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-400">
          Belum Diunggah
        </span>
      );
    }

    if (doc.status === 'VERIFIED') {
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Sah
          </span>
          <button
            onClick={() => setActiveModalDoc({ doc, studentName })}
            className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
            title="Lihat Berkas"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    if (doc.status === 'REJECTED') {
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            Ditolak
          </span>
          <button
            onClick={() => setActiveModalDoc({ doc, studentName })}
            className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
            title="Lihat Berkas"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
          <Clock className="w-3 h-3" />
          Verifikasi
        </span>
        <button
          onClick={() => setActiveModalDoc({ doc, studentName })}
          className="p-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
          title="Buka untuk Verifikasi"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileCheck className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-slate-800">
              Verifikasi Dokumen Siswa Kelas 10
            </h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Validasi berkas persyaratan resmi: Akte Kelahiran, Kartu Keluarga, dan Ijazah SMP untuk siswa baru.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau email siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56 sm:w-64"
            />
          </div>

          <div className="flex p-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}
            >
              Semua ({students.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'PENDING' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}
            >
              Perlu Verifikasi
            </button>
            <button
              onClick={() => setFilter('COMPLETE')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'COMPLETE' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}
            >
              Lengkap Sah (3/3)
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Siswa & Status Dokumen */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Nama Siswa</th>
                <th className="py-3.5 px-4">Akte Kelahiran</th>
                <th className="py-3.5 px-4">Kartu Keluarga</th>
                <th className="py-3.5 px-4">Ijazah SMP / SKL</th>
                <th className="py-3.5 px-6 text-right">Status Keseluruhan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const akte = getDoc(s.documents, 'AKTE_KELAHIRAN');
                  const kk = getDoc(s.documents, 'KARTU_KELUARGA');
                  const ijazah = getDoc(s.documents, 'IJAZAH_SMP');

                  const verifiedCount = [akte, kk, ijazah].filter((d) => d?.status === 'VERIFIED').length;
                  const totalUploaded = s.documents.length;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6">
                        <span className="font-bold text-slate-800 block">{s.name}</span>
                        <span className="text-[11px] text-slate-400 block">{s.email}</span>
                        {s.dapodik?.nisn && (
                          <span className="text-[10px] text-indigo-600 font-mono">NISN: {s.dapodik.nisn}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {renderBadge(akte, s.name)}
                      </td>
                      <td className="py-3.5 px-4">
                        {renderBadge(kk, s.name)}
                      </td>
                      <td className="py-3.5 px-4">
                        {renderBadge(ijazah, s.name)}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {verifiedCount === 3 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Lengkap Terverifikasi
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">
                            {verifiedCount}/3 Sah • {totalUploaded}/3 Diunggah
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pemeriksaan & Verifikasi Dokumen */}
      {activeModalDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
                  Verifikasi Berkas Siswa
                </span>
                <h3 className="font-bold text-slate-800 text-base">
                  {activeModalDoc.studentName} — {activeModalDoc.doc.fileName}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalDoc(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Preview */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-100/50 flex items-center justify-center min-h-[350px]">
              {activeModalDoc.doc.fileType === 'application/pdf' ? (
                <iframe
                  src={activeModalDoc.doc.fileUrl}
                  className="w-full h-[450px] rounded-xl border border-slate-200 shadow-inner"
                  title="Pratinjau PDF"
                />
              ) : (
                <img
                  src={activeModalDoc.doc.fileUrl}
                  alt={activeModalDoc.doc.fileName}
                  className="max-h-[450px] w-auto object-contain rounded-xl shadow-md border border-slate-200"
                />
              )}
            </div>

            {/* Form Catatan & Tombol Keputusan TU */}
            <div className="p-6 border-t border-slate-100 bg-white space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan untuk Siswa (Wajib jika menolak dokumen):
                </label>
                <input
                  type="text"
                  placeholder="Misal: Foto KK buram dan terpotong, harap unggah scan penuh yang jelas..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={activeModalDoc.doc.fileUrl}
                  download={activeModalDoc.doc.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka File Asli
                </a>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVerify('REJECTED')}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors border border-rose-200 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak / Minta Upload Ulang
                  </button>

                  <button
                    onClick={() => handleVerify('VERIFIED')}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Sahkan & Verifikasi Dokumen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
