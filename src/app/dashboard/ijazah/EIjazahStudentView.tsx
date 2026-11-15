"use client";

import { useState } from 'react';
import { Download, ExternalLink, FileText, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface EIjazahStudentViewProps {
  studentId: string;
  fileName: string;
  fileSize?: number | null;
  updatedAt?: string | null;
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function EIjazahStudentView({ studentId, fileName, fileSize, updatedAt }: EIjazahStudentViewProps) {
  const [showPreview, setShowPreview] = useState(true);
  const previewUrl = `/api/e-ijazah/${studentId}?preview=true`;
  const downloadUrl = `/api/e-ijazah/${studentId}`;

  return (
    <div className="space-y-6">
      {/* Banner Status & Aksi Utama */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Ijazah Digital Anda Tersedia
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Terverifikasi
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 break-all">
                {fileName} {fileSize ? `(${formatBytes(fileSize)})` : ''}
              </p>
              {updatedAt && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Diperbarui: {new Date(updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              title={showPreview ? "Sembunyikan tampilan preview" : "Tampilkan lembar dokumen"}
            >
              {showPreview ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-emerald-600" />}
              <span>{showPreview ? 'Tutup Preview' : 'Tampilkan Preview'}</span>
            </button>

            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              title="Buka dokumen di tab baru atau aplikasi PDF layar penuh"
            >
              <ExternalLink className="h-4 w-4 text-slate-500" />
              <span className="hidden xs:inline">Layar Penuh</span>
            </a>

            <a
              href={downloadUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Unduh PDF</span>
            </a>
          </div>
        </div>
      </section>

      {/* Area Preview Dokumen */}
      {showPreview && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Preview Dokumen E-Ijazah Resmi
            </span>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
            >
              Buka di Tab Baru <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="relative w-full bg-slate-100 flex flex-col items-center justify-center">
            <iframe
              src={previewUrl}
              className="w-full h-[650px] sm:h-[800px] border-0 bg-white"
              title={`Preview E-Ijazah ${fileName}`}
            />
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
            Jika dokumen tidak muncul di browser HP Anda, klik tombol <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 underline">Layar Penuh</a> atau <a href={downloadUrl} className="font-semibold text-emerald-700 underline">Unduh PDF</a>.
          </div>
        </section>
      )}
    </div>
  );
}
