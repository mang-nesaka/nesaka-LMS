"use client";

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Plus, Printer, CheckCircle, School } from 'lucide-react';
import { createClassroom } from '@/app/actions/agenda';

interface Classroom {
  id: string;
  name: string;
  code: string;
  level: string;
}

export default function ClassroomListClient({ classrooms, canCreate }: { classrooms: Classroom[]; canCreate: boolean }) {
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (selectedClassroom) {
      QRCode.toDataURL(selectedClassroom.code, { width: 300, margin: 2 }, (err, url) => {
        if (!err) setQrDataUrl(url);
      });
    }
  }, [selectedClassroom]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-slate-600">
          Total {classrooms.length} Ruang Kelas Terdaftar
        </p>
        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ruang Kelas</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {classrooms.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md border border-indigo-100">
                  Tingkat Kelas {c.level}
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-400">{c.code}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600" />
                <span>{c.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Kode Token Barcode: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-bold">{c.code}</code>
              </p>
            </div>

            <button
              onClick={() => setSelectedClassroom(c)}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Lihat & Cetak Barcode</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal Cetak Barcode */}
      {selectedClassroom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
            <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 bg-slate-50 mb-4 flex flex-col items-center">
              <span className="text-xs font-black tracking-widest text-indigo-600 uppercase mb-1">
                SMK NESAKA
              </span>
              <h2 className="text-2xl font-black text-slate-900 mb-3">{selectedClassroom.name}</h2>
              {qrDataUrl && (
                <img src={qrDataUrl} alt={selectedClassroom.code} className="w-56 h-56 rounded-xl border border-white shadow-sm" />
              )}
              <div className="mt-3 font-mono font-bold text-sm tracking-wider bg-white px-3 py-1 rounded-lg border border-slate-200 text-slate-800">
                {selectedClassroom.code}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Guru Mapel wajib menscan kode ini saat memulai kegiatan belajar mengajar di kelas.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Print</span>
              </button>
              <button
                onClick={() => setSelectedClassroom(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Kelas */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            action={async (formData) => {
              setIsPending(true);
              await createClassroom(formData);
              setIsPending(false);
              setShowAddModal(false);
            }}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900">Tambah Ruang Kelas Baru</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ruang Kelas</label>
              <input
                name="name"
                required
                placeholder="Contoh: X TKR 1, XI TKJ 2"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kelas</label>
              <select
                name="level"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="10">Kelas 10</option>
                <option value="11">Kelas 11</option>
                <option value="12">Kelas 12</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                {isPending ? 'Menyimpan...' : 'Simpan Kelas'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
