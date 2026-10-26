"use client";

import { useState } from 'react';
import { createExamFromExcel } from '@/app/actions/exam';
import { Plus, Download, Upload, FileSpreadsheet, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';

interface CourseOption {
  id: string;
  title: string;
}

export default function CreateExamModal({ courses }: { courses: CourseOption[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    try {
      await createExamFromExcel(formData);
      setIsOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah soal ujian.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/api/exams/template"
          download
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm text-sm"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          Download Template Soal Excel
        </a>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md text-sm"
        >
          <Plus className="w-5 h-5" />
          Buat Ujian CBT Baru
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-indigo-100 mb-8 transition-all">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Upload Soal & Jadwalkan Ujian CBT
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Buat ujian online berbasis CBT dengan sistem keamanan anti-kecurangan (Anti-Keluar Layar).
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-100"
        >
          Tutup
        </button>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Petunjuk Format Soal */}
      <div className="mb-6 p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-slate-700 space-y-2">
        <p className="font-bold text-indigo-900 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          Format Soal Excel Mendukung:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
          <li><strong>Rumus Matematika / Sains:</strong> Tulis rumus di dalam tanda dollar, contoh: <code>{'$f(x) = \\frac{-b \\pm \\sqrt{D}}{2a}$'}</code> atau <code>{'$x^2 + 5x = 0$'}</code>.</li>
          <li><strong>Bahasa Arab:</strong> Langsung ketik atau tempel huruf Arab berharakat, contoh: <code>مَنْ جَدَّ وَجَدَ</code>.</li>
          <li><strong>Gambar Soal:</strong> Cantumkan tautan/URL gambar di kolom C pada Excel jika soal memerlukan diagram, grafik, atau gambar mesin.</li>
        </ul>
        <div className="pt-1">
          <a
            href="/api/exams/template"
            download
            className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-900 font-bold underline"
          >
            <Download className="w-3.5 h-3.5" />
            Download File Contoh Template Soal (.xlsx)
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Judul Ujian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Contoh: Penilaian Akhir Semester - Matematika Wajib"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Target Kelas <span className="text-red-500">*</span>
            </label>
            <select
              name="courseId"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="">-- Pilih Kelas --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Durasi Ujian (Menit) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="durationMinutes"
              defaultValue={60}
              min={10}
              max={300}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              File Soal Excel (.xlsx) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="file"
              accept=".xlsx,.xls"
              required
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 p-1.5 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
            Instruksi / Tata Tertib Ujian
          </label>
          <input
            type="text"
            name="description"
            placeholder="Contoh: Jangan berpindah aplikasi. Dua pelanggaran akan mengumpulkan jawaban otomatis."
            defaultValue="Jangan berpindah aplikasi atau tab. Dua pelanggaran akan mengumpulkan jawaban otomatis."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Mengunggah & Memvalidasi Soal...' : 'Simpan & Publikasikan Ujian'}
          </button>
        </div>
      </form>
    </div>
  );
}
