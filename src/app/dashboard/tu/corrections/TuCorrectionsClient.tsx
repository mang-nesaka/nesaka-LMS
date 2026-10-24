"use client";

import { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, MessageSquare, Send, User, ChevronRight } from 'lucide-react';
import { processCorrectionRequest } from '@/app/actions/correction';

export default function TuCorrectionsClient({ requests }: { requests: any[] }) {
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleProcess = async (status: 'PROCESSED' | 'REJECTED') => {
    if (!selectedRequest) return;
    setIsPending(true);
    await processCorrectionRequest(selectedRequest.id, adminResponse, status);
    setIsPending(false);
    setSelectedRequest(null);
    setAdminResponse('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kolom Daftar Aduan (2 Kolom) */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-600" />
          <span>Daftar Pengaduan Siswa ({requests.length})</span>
        </h2>

        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedRequest(r);
                  setAdminResponse(r.adminResponse || '');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  selectedRequest?.id === r.id
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{r.student?.name}</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md">
                      {r.student?.studentClass || 'Siswa'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.status === 'PROCESSED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {r.status === 'PROCESSED' ? 'SELESAI DIPROSES' : r.status === 'REJECTED' ? 'DITOLAK' : 'MENUNGGU TU'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-2 bg-white p-2.5 rounded-xl border border-slate-200/60 font-medium">
                    &ldquo;{r.notes}&rdquo;
                  </p>

                  <span className="text-[10px] text-slate-400 block">
                    Dikirim pada: {new Date(r.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-500">Tidak ada pengaduan koreksi data diri saat ini. Semua data siswa sesuai!</p>
          </div>
        )}
      </div>

      {/* Kolom Detail & Tindakan TU (1 Kolom) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Tindak Lanjut & Verifikasi TU</span>
        </h3>

        {selectedRequest ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Data Siswa Terkait:</span>
              <p className="text-xs font-bold text-slate-800">{selectedRequest.student?.name}</p>
              <p className="text-[11px] text-slate-600">NIS/NISN: {selectedRequest.student?.nipOrNis || '-'}</p>
              <p className="text-[11px] text-slate-600">Kelas: {selectedRequest.student?.studentClass || '-'}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Catatan Aduan Siswa:</span>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900 font-medium">
                {selectedRequest.notes}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggapan / Catatan TU untuk Siswa
              </label>
              <textarea
                rows={3}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Contoh: Data NISN telah diperbarui di sistem Dapodik sekolah sesuai ijazah SMP..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleProcess('PROCESSED')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isPending ? 'Menyimpan...' : 'Tandai Selesai'}</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleProcess('REJECTED')}
                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
              >
                Tolak
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Pilih salah satu aduan siswa di sebelah kiri untuk menindaklanjuti.</p>
          </div>
        )}
      </div>
    </div>
  );
}
