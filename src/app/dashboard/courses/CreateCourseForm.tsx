"use client";

import { useState } from 'react';
import { createCourse } from '@/app/actions/course';
import { Plus, BookOpen, GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';

const COMMON_SUBJECTS = [
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Teknik Otomotif (TKRO)',
  'Broadcasting & Perfilman',
  'Rekayasa Perangkat Lunak (RPL)',
  'Teknik Komputer & Jaringan (TKJ)',
  'Pendidikan Agama Islam',
  'Pendidikan Jasmani (PJOK)',
  'Sejarah Indonesia',
  'Kewirausahaan (PKWU)',
];

const COMMON_CLASSES = [
  'Kelas X - A',
  'Kelas X - B',
  'Kelas X - TKRO 1',
  'Kelas X - TKRO 2',
  'Kelas X - BCF 1',
  'Kelas X - RPL',
  'Kelas XI - TKRO 1',
  'Kelas XI - TKRO 2',
  'Kelas XI - RPL',
  'Kelas XI - BCF',
  'Kelas XII - TKRO 1',
  'Kelas XII - TKRO 2',
  'Kelas XII - RPL',
];

export default function CreateCourseForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [customClass, setCustomClass] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeSubject = subject === 'CUSTOM' ? customSubject : subject;
  const activeClass = targetClass === 'CUSTOM' ? customClass : targetClass;

  const previewTitle = activeSubject && activeClass 
    ? `${activeSubject} (${activeClass})`
    : activeSubject || 'Judul Kelas Akan Muncul di Sini';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('subject', activeSubject);
    formData.append('targetClass', activeClass);
    formData.append('title', previewTitle);
    formData.append('description', description);

    try {
      await createCourse(formData);
      setIsOpen(false);
      setSubject('');
      setTargetClass('');
      setDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat kelas.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg"
      >
        <Plus className="w-5 h-5" />
        Buat Kelas Baru
      </button>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-indigo-100 mb-8 transition-all">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Buat Kelas Baru & Atur Target Siswa
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih mata pelajaran dan rombongan belajar (rombel) yang Anda ajar. Link undangan akan otomatis dibuat.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-100"
        >
          Batal
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Pilih Mata Pelajaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              1. Mata Pelajaran yang Diajar <span className="text-red-500">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
            >
              <option value="">-- Pilih Mata Pelajaran --</option>
              {COMMON_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="CUSTOM">+ Tulis Mata Pelajaran Lainnya...</option>
            </select>

            {subject === 'CUSTOM' && (
              <input
                type="text"
                placeholder="Ketik nama mata pelajaran..."
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                required
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-indigo-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              />
            )}
          </div>

          {/* 2. Pilih Kelas / Rombel */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              2. Target Kelas / Rombel Siswa <span className="text-red-500">*</span>
            </label>
            <select
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
            >
              <option value="">-- Pilih Kelas yang Diajar --</option>
              {COMMON_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="CUSTOM">+ Tulis Kelas / Rombel Lainnya...</option>
            </select>

            {targetClass === 'CUSTOM' && (
              <input
                type="text"
                placeholder="Contoh: Kelas X - TKRO 3..."
                value={customClass}
                onChange={(e) => setCustomClass(e.target.value)}
                required
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-indigo-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              />
            )}
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
            Deskripsi / Catatan Kelas (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: Pembelajaran semester ganjil, materi dasar kelistrikan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Preview Nama Kelas Otomatis */}
        <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-indigo-500 font-medium">Pratinjau Judul Kelas:</p>
              <p className="text-sm font-bold text-indigo-900">{previewTitle}</p>
            </div>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
            Otomatis
          </span>
        </div>

        {/* Tombol Simpan */}
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
            disabled={loading || !activeSubject || !activeClass}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Buat Kelas & Generate Link Undangan'}
          </button>
        </div>
      </form>
    </div>
  );
}
