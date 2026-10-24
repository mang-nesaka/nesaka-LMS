"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Calendar, MapPin, Users, Printer, CheckCircle, ChevronRight, X } from 'lucide-react';
import { createActivityReport } from '@/app/actions/activity';

interface Props {
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  reports: ActivityReportItem[];
  initialRoleFilter: string;
}

interface ActivityReportItem {
  id: string;
  roleSource: string;
  date: string | Date;
  title: string;
  description: string;
  location: string | null;
  participants: string | null;
  documentationUrl: string | null;
  author: { name: string } | null;
}

export default function BeritaAcaraClient({ user, reports, initialRoleFilter }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ActivityReportItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const defaultRoleSource = user.role.startsWith('WAKA_') ? user.role : 'WAKA_KURIKULUM';
  const [roleSource, setRoleSource] = useState(defaultRoleSource);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState('');
  const [description, setDescription] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');

  const canCreate = [
    'ADMIN',
    'KEPSEK',
    'WAKA_KURIKULUM',
    'WAKA_KESISWAAN',
    'WAKA_SARPRAS',
    'WAKA_HUBDIN',
  ].includes(user.role);

  const roleLabels: Record<string, string> = {
    WAKA_KURIKULUM: 'Waka Kurikulum',
    WAKA_KESISWAAN: 'Waka Kesiswaan',
    WAKA_SARPRAS: 'Waka Sarpras',
    WAKA_HUBDIN: 'Waka Hubdin',
  };

  const roleBadges: Record<string, string> = {
    WAKA_KURIKULUM: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    WAKA_KESISWAAN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    WAKA_SARPRAS: 'bg-amber-50 text-amber-700 border-amber-200',
    WAKA_HUBDIN: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createActivityReport({
        roleSource,
        title,
        date,
        location,
        participants,
        description,
        documentationUrl,
      });
      setShowModal(false);
      setTitle('');
      setLocation('');
      setParticipants('');
      setDescription('');
      setDocumentationUrl('');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
      alert(`Gagal menyimpan berita acara: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Add Button */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Filter Bidang Waka */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => router.push('/dashboard/berita-acara?role=ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              initialRoleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua Bidang
          </button>
          {Object.entries(roleLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => router.push(`/dashboard/berita-acara?role=${key}`)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                initialRoleFilter === key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Berita Acara Baru</span>
          </button>
        )}
      </div>

      {/* Grid Daftar Berita Acara */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => setSelectedReport(report)}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${roleBadges[report.roleSource] || 'bg-slate-100 text-slate-600'}`}>
                  {roleLabels[report.roleSource] || report.roleSource}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <h3 className="text-sm font-black text-slate-900 line-clamp-2">{report.title}</h3>

              <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {report.description}
              </p>

              {report.location && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{report.location}</span>
                </div>
              )}
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Oleh: <strong className="text-slate-700">{report.author?.name}</strong></span>
              <span className="font-bold text-orange-600 flex items-center gap-1">
                Buka <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail Berita Acara & Print */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${roleBadges[selectedReport.roleSource]}`}>
                  {roleLabels[selectedReport.roleSource] || selectedReport.roleSource}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">{selectedReport.title}</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tanggal Kegiatan:</span>
                <span className="font-bold text-slate-800">{new Date(selectedReport.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lokasi:</span>
                <span className="font-bold text-slate-800">{selectedReport.location || 'Lingkungan Sekolah'}</span>
              </div>
              {selectedReport.participants && (
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pihak yang Terlibat / Hadir:</span>
                  <span className="text-slate-700">{selectedReport.participants}</span>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Uraian / Notulensi Kegiatan:</h4>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedReport.description}
              </div>
            </div>

            {selectedReport.documentationUrl && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Dokumentasi Foto / Lampiran:</h4>
                <img src={selectedReport.documentationUrl} alt="Dokumentasi Kegiatan" className="w-full max-h-72 object-cover rounded-2xl border border-slate-200" />
              </div>
            )}

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Berita Acara</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Berita Acara Baru */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">Buat Berita Acara Kegiatan</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bidang Waka</label>
              <select
                value={roleSource}
                onChange={(e) => setRoleSource(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="WAKA_KURIKULUM">Waka Kurikulum</option>
                <option value="WAKA_KESISWAAN">Waka Kesiswaan</option>
                <option value="WAKA_SARPRAS">Waka Sarana & Prasarana</option>
                <option value="WAKA_HUBDIN">Waka Hubungan Industri (Hubdin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kegiatan / Rapat</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Rapat Koordinasi Kurikulum & Jadwal Pembelajaran Genap"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tempat / Lokasi</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Ruang Rapat Guru"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pihak yang Hadir / Terlibat</label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="Contoh: Seluruh Guru Mapel Produktif, Kepala Sekolah, Waka Kurikulum"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Uraian Hasil / Notulensi Kegiatan</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan jalannya kegiatan, keputusan rapat, atau hal-hal penting yang disepakati..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Link URL Foto Dokumentasi (Opsional)</label>
              <input
                type="text"
                value={documentationUrl}
                onChange={(e) => setDocumentationUrl(e.target.value)}
                placeholder="https://... atau data image"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Berita Acara'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
