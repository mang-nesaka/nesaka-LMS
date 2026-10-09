"use client";

import { useState } from 'react';
import { importStudentsCSV } from '@/app/actions/import';
import { Upload, FileDown, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ImportForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error'|'success', text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    try {
      await importStudentsCSV(formData);
      setMessage({ type: 'success', text: 'Data siswa berhasil diimpor!' });
      // Reset form
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat impor.' });
    }
    
    setLoading(false);
  }

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,email,password\nBudi Santoso,budi@sekolah.com,password123\nSiti Aminah,siti@sekolah.com,password123";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-indigo-600" />
          Import Data Siswa (CSV)
        </h3>
        <button 
          onClick={downloadTemplate}
          className="text-sm flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <FileDown className="w-4 h-4 mr-1" />
          Download Template CSV
        </button>
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

      {message && (
        <div className={`mt-4 p-4 rounded-xl flex items-center text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
          {message.text}
        </div>
      )}
    </div>
  );
}
