"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { importStudentsCSVBatch, type StudentImportRow, type StudentImportResult } from '@/app/actions/import';
import { Upload, FileDown, AlertCircle, CheckCircle2 } from 'lucide-react';

const BATCH_SIZE = 25;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index++;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error('Format CSV tidak valid: ada tanda kutip yang belum ditutup.');
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    if (row.some((cell) => cell.trim())) rows.push(row);
  }
  return rows;
}

export default function ImportForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'error'|'success', text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setProgress(null);
    setMessage(null);
    let completedBatches = 0;
    let totalBatches = 0;
    const result: StudentImportResult = { createdCount: 0, updatedCount: 0, skippedCount: 0 };

    try {
      const file = formData.get('file');
      if (!(file instanceof File) || !file.name) throw new Error('Pilih file CSV terlebih dahulu.');
      if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran CSV maksimal 5MB.');

      const parsedRows = parseCsv(await file.text());
      if (!parsedRows.length) throw new Error('File CSV kosong.');
      const headers = parsedRows[0].map((header) => header.replace(/^\uFEFF/, '').trim().toLowerCase());
      const nameIndex = headers.indexOf('name');
      const emailIndex = headers.indexOf('email');
      const passwordIndex = headers.indexOf('password');
      const classroomIndex = headers.indexOf('nama_kelas');
      if (nameIndex < 0 || emailIndex < 0 || passwordIndex < 0) {
        throw new Error('Header CSV harus memuat kolom name, email, dan password.');
      }

      const rows: StudentImportRow[] = parsedRows.slice(1).map((cells) => ({
        name: cells[nameIndex] ?? '',
        email: cells[emailIndex] ?? '',
        password: cells[passwordIndex] ?? '',
        classroomName: classroomIndex >= 0 ? cells[classroomIndex] ?? '' : '',
      }));
      if (!rows.length) throw new Error('Tidak ada baris data siswa setelah header.');

      totalBatches = Math.ceil(rows.length / BATCH_SIZE);
      for (let start = 0; start < rows.length; start += BATCH_SIZE) {
        const batchResult = await importStudentsCSVBatch(
          rows.slice(start, start + BATCH_SIZE),
          start + BATCH_SIZE >= rows.length,
        );
        result.createdCount += batchResult.createdCount;
        result.updatedCount += batchResult.updatedCount;
        result.skippedCount += batchResult.skippedCount;
        completedBatches++;
        setProgress(`Memproses bagian ${completedBatches} dari ${totalBatches}...`);
      }

      setMessage({
        type: 'success',
        text: `Impor selesai: ${result.createdCount} siswa baru, ${result.updatedCount} akun diperbarui, ${result.skippedCount} baris dilewati.`,
      });
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      router.refresh();
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Terjadi kesalahan saat impor.';
      const partialResult = result.createdCount + result.updatedCount + result.skippedCount;
      setMessage({
        type: 'error',
        text: completedBatches
          ? `Impor terhenti setelah ${completedBatches} dari ${totalBatches} bagian. ${partialResult} baris sudah diproses; unggah ulang file untuk melanjutkan. Detail: ${detail}`
          : detail,
      });
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-indigo-600" />
          Import Data Siswa (CSV)
        </h3>
        <a
          href="/api/students/template"
          className="text-sm flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <FileDown className="w-4 h-4 mr-1" />
          Download Template CSV
        </a>
      </div>

      <form action={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input 
          id="file-upload"
          type="file" 
          name="file" 
          accept=".csv"
          required
          className="flex-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 p-2 rounded-xl"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 whitespace-nowrap"
        >
          {loading ? 'Memproses...' : 'Mulai Import'}
        </button>
      </form>

      {progress && <p role="status" className="mt-3 text-sm text-slate-500">{progress}</p>}
      {message && (
        <div className={`mt-4 p-4 rounded-xl flex items-center text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
          {message.text}
        </div>
      )}
    </div>
  );
}
