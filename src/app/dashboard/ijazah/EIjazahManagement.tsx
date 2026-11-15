"use client";

import { useState } from 'react';
import { Download, FileUp, Loader2, Search } from 'lucide-react';
import { uploadEIjazahAction } from '@/app/actions/document';

interface EIjazahStudent {
  id: string;
  name: string;
  email: string;
  className: string;
  fileName: string | null;
  fileSize: number | null;
  updatedAt: string | null;
}

export default function EIjazahManagement({ students }: { students: EIjazahStudent[] }) {
  const [query, setQuery] = useState('');
  const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ studentId: string; text: string; error: boolean } | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredStudents = normalizedQuery
    ? students.filter((student) =>
      `${student.name} ${student.email} ${student.className}`.toLowerCase().includes(normalizedQuery),
    )
    : students;

  async function handleUpload(studentId: string, file: File | undefined, input: HTMLInputElement) {
    if (!file) return;
    setBusyStudentId(studentId);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadEIjazahAction(studentId, formData);
      setMessage({ studentId, text: 'E-Ijazah berhasil diunggah.', error: false });
    } catch (error) {
      setMessage({
        studentId,
        text: error instanceof Error ? error.message : 'Gagal mengunggah E-Ijazah.',
        error: true,
      });
    } finally {
      setBusyStudentId(null);
      input.value = '';
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold text-emerald-700">Tata Usaha · Administrator</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Kelola E-Ijazah Kelas XII</h1>
        <p className="mt-2 text-sm text-slate-600">Unggah PDF E-Ijazah per siswa. Berkas yang sudah tersedia dapat diunduh kembali untuk pemeriksaan.</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{students.length} siswa kelas XII</p>
        <label className="relative block w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, email, atau kelas"
            className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          />
        </label>
      </div>

      <div className="overflow-x-auto border-y border-slate-200">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Siswa</th>
              <th className="px-4 py-3">Kelas</th>
              <th className="px-4 py-3">Status E-Ijazah</th>
              <th className="px-4 py-3 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredStudents.map((student) => {
              const isBusy = busyStudentId === student.id;
              const feedback = message?.studentId === student.id ? message : null;
              return (
                <tr key={student.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{student.name}</div>
                    <div className="text-xs text-slate-500">{student.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{student.className}</td>
                  <td className="px-4 py-3">
                    <span className={student.fileName ? 'font-medium text-emerald-700' : 'text-slate-500'}>
                      {student.fileName ?? 'Belum diunggah'}
                    </span>
                    {feedback && <p className={`mt-1 text-xs ${feedback.error ? 'text-red-700' : 'text-emerald-700'}`}>{feedback.text}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {student.fileName && (
                        <a
                          href={`/api/e-ijazah/${student.id}`}
                          aria-label={`Unduh E-Ijazah ${student.name}`}
                          title="Unduh E-Ijazah"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      <label className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-semibold text-white ${isBusy ? 'bg-slate-400' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                        {student.fileName ? 'Ganti PDF' : 'Upload PDF'}
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          disabled={isBusy}
                          className="sr-only"
                          onChange={(event) => handleUpload(student.id, event.target.files?.[0], event.currentTarget)}
                        />
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredStudents.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">Tidak ada siswa yang cocok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">Format PDF, maksimal 4 MB per siswa. Mengunggah ulang akan menggantikan berkas sebelumnya.</p>
    </main>
  );
}