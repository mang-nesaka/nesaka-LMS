"use client";

import { useState } from 'react';
import { Download, FileUp, ShieldCheck } from 'lucide-react';
import { importDemoSchoolData } from '@/app/actions/demo-data';

interface ImportResult {
  classroomsCreated: number;
  teachersCreated: number;
  studentsCreated: number;
  schedulesCreated: number;
  credentialsCount: number;
  credentialsCsv: string;
}

export default function DemoDataImportForm() {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  return (
    <section className="mb-8 rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <ShieldCheck className="h-5 w-5 text-teal-700" />
            Data Demo Sekolah
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">
            Template berisi 30 kelas, 50 guru, 1.080 siswa, dan jadwal Senin–Jumat. Import hanya menambah data yang belum ada.
          </p>
        </div>
        <a
          href="/api/demo-data/template"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-teal-700 px-3.5 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50"
        >
          <Download className="h-4 w-4" />
          Unduh Template Excel
        </a>
      </div>

      <form
        action={async (formData) => {
          setIsPending(true);
          setMessage(null);
          try {
            const result = await importDemoSchoolData(formData) as ImportResult;
            if (result.credentialsCount > 0) {
              const file = new Blob([`\uFEFF${result.credentialsCsv}`], { type: 'text/csv;charset=utf-8' });
              const url = URL.createObjectURL(file);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'kredensial-demo-nesaka.csv';
              link.click();
              URL.revokeObjectURL(url);
            }
            setMessage({
              type: 'success',
              text: `Import selesai: ${result.classroomsCreated} kelas, ${result.teachersCreated} guru, ${result.studentsCreated} siswa, ${result.schedulesCreated} jadwal baru.${result.credentialsCount ? ' File kredensial baru diunduh.' : ' Semua akun demo sudah ada; tidak ada password yang diubah.'}`,
            });
            const input = document.getElementById('demo-data-file') as HTMLInputElement | null;
            if (input) input.value = '';
          } catch (error) {
            setMessage({
              type: 'error',
              text: error instanceof Error ? error.message : 'Import data demo gagal.',
            });
          } finally {
            setIsPending(false);
          }
        }}
        className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center"
      >
        <input
          id="demo-data-file"
          type="file"
          name="file"
          accept=".xlsx"
          required
          className="block w-full min-w-0 flex-1 text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-teal-800"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          <FileUp className="h-4 w-4" />
          {isPending ? 'Mengimpor...' : 'Unggah & Buat Data Demo'}
        </button>
      </form>

      {message && (
        <p role="status" className={`mt-3 text-xs ${message.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
          {message.text}
        </p>
      )}
      <p className="mt-2 text-[11px] text-slate-500">
        Simpan file kredensial dengan aman. Password hanya ditampilkan satu kali dan tidak ikut template.
      </p>
    </section>
  );
}
