"use client";

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Users, Smartphone, PhoneOff, Search, School, 
  Printer, CheckCircle2, Clock, AlertCircle, QrCode, X, RefreshCw
} from 'lucide-react';
import { toggleStudentSmartphoneStatus } from '@/app/actions/tuAttendance';

interface StudentItem {
  id: string;
  name: string;
  email: string;
  studentClass: string | null;
  nipOrNis: string | null;
  hasSmartphone: boolean;
  avatarUrl: string | null;
  dapodikForm: {
    nisn: string | null;
    nis: string | null;
  } | null;
  attendances: any[];
}

interface Props {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  initialStudents: StudentItem[];
  classrooms: Array<{ id: string; name: string }>;
  today: string;
}

export default function NonSmartphoneManagementClient({
  currentUser,
  initialStudents,
  classrooms,
  today,
}: Props) {
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [smartphoneFilter, setSmartphoneFilter] = useState<'ALL' | 'NO_PHONE' | 'HAS_PHONE'>('NO_PHONE');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modal Cetak Kartu Barcode Siswa
  const [cardModalStudent, setCardModalStudent] = useState<StudentItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (cardModalStudent) {
      const barcodeToken = cardModalStudent.dapodikForm?.nisn || cardModalStudent.nipOrNis || cardModalStudent.id;
      const verifyUrl = `https://nesaka-lms.sch.id/verify/student/${cardModalStudent.id}?nisn=${cardModalStudent.dapodikForm?.nisn || ''}&valid=true`;
      QRCode.toDataURL(verifyUrl, { width: 250, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } }, (err, url) => {
        if (!err) setQrDataUrl(url);
      });
    }
  }, [cardModalStudent]);

  // Toggle status smartphone
  const handleToggleSmartphone = async (student: StudentItem) => {
    setUpdatingId(student.id);
    setActionMessage(null);
    try {
      const nextStatus = !student.hasSmartphone;
      const res = await toggleStudentSmartphoneStatus({
        studentId: student.id,
        hasSmartphone: nextStatus,
      });
      if (res.success) {
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, hasSmartphone: nextStatus } : s))
        );
        setActionMessage(res.message);
      }
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    // Smartphone filter
    if (smartphoneFilter === 'NO_PHONE' && s.hasSmartphone) return false;
    if (smartphoneFilter === 'HAS_PHONE' && !s.hasSmartphone) return false;

    // Class filter
    if (selectedClass !== 'ALL' && s.studentClass !== selectedClass) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = s.name.toLowerCase().includes(q);
      const nisnMatch = s.dapodikForm?.nisn?.toLowerCase().includes(q);
      const nisMatch = s.nipOrNis?.toLowerCase().includes(q);
      const classMatch = s.studentClass?.toLowerCase().includes(q);
      return nameMatch || nisnMatch || nisMatch || classMatch;
    }

    return true;
  });

  // Statistik Cepat
  const totalStudents = students.length;
  const nonSmartphoneCount = students.filter((s) => !s.hasSmartphone).length;
  const nonSmartphoneAttendedToday = students.filter((s) => {
    if (s.hasSmartphone) return false;
    const att = s.attendances?.[0];
    return att && (att.checkInStatus === 'HADIR' || att.checkInStatus === 'TERLAMBAT');
  }).length;
  const nonSmartphoneAbsentToday = nonSmartphoneCount - nonSmartphoneAttendedToday;

  return (
    <div className="space-y-6">
      {/* 4 Kartu Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Siswa
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {totalStudents} Siswa
          </span>
          <span className="text-[11px] text-slate-500">Terdaftar di Sekolah</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Siswa Non-Smartphone
          </span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">
            {nonSmartphoneCount} Siswa
          </span>
          <span className="text-[11px] text-amber-700 font-semibold">Wajib Scan di Loket TU</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Presensi di TU Hari Ini
          </span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">
            {nonSmartphoneAttendedToday} Siswa
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold">Tercatat Hadir / Terlambat</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-gradient-to-br from-white to-rose-50/40">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
            Belum Absen Hari Ini
          </span>
          <span className="text-2xl font-black text-rose-800 mt-1 block">
            {nonSmartphoneAbsentToday} Siswa
          </span>
          <span className="text-[11px] text-rose-600 font-semibold">Belum Datang ke Loket TU</span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Bar Filter & Pencarian */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Tab Status Smartphone */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setSmartphoneFilter('NO_PHONE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              smartphoneFilter === 'NO_PHONE'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Hanya Non-Smartphone ({nonSmartphoneCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSmartphoneFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              smartphoneFilter === 'ALL'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Siswa ({totalStudents})
          </button>
          <button
            type="button"
            onClick={() => setSmartphoneFilter('HAS_PHONE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              smartphoneFilter === 'HAS_PHONE'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Punya Smartphone</span>
          </button>
        </div>

        {/* Filter Kelas & Search Box */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <School className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            >
              <option value="ALL">Semua Kelas</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NISN, NIS..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tabel Data Siswa */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Daftar Siswa ({filteredStudents.length} siswa ditampilkan)</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Tanggal: {today}</span>
        </div>

        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-3">NISN / NIS</th>
                  <th className="py-3.5 px-3">Kelas</th>
                  <th className="py-3.5 px-3">Status Gawai</th>
                  <th className="py-3.5 px-3">Kehadiran Hari Ini</th>
                  <th className="py-3.5 px-3">Waktu Presensi TU</th>
                  <th className="py-3.5 px-4 text-center">Aksi / Cetak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.map((student) => {
                  const todayAtt = student.attendances?.[0];
                  const isUpdating = updatingId === student.id;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{student.name}</span>
                        <span className="text-[10px] text-slate-400">{student.email}</span>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600">
                        {student.dapodikForm?.nisn || student.nipOrNis || '-'}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[11px]">
                          {student.studentClass || '-'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleSmartphone(student)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                            student.hasSmartphone
                              ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                          }`}
                          title="Klik untuk mengubah status kepemilikan smartphone"
                        >
                          {student.hasSmartphone ? (
                            <>
                              <Smartphone className="w-3 h-3 text-slate-400" />
                              <span>Punya Smartphone</span>
                            </>
                          ) : (
                            <>
                              <PhoneOff className="w-3 h-3 text-amber-600" />
                              <span>Non-Smartphone (Loket TU)</span>
                            </>
                          )}
                          {isUpdating && <RefreshCw className="w-3 h-3 animate-spin" />}
                        </button>
                      </td>

                      <td className="py-3 px-3">
                        {todayAtt?.checkInStatus ? (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              todayAtt.checkInStatus === 'HADIR'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : todayAtt.checkInStatus === 'TERLAMBAT'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {todayAtt.checkInStatus}
                            {todayAtt.checkInLateMinutes > 0 ? ` (+${todayAtt.checkInLateMinutes}m)` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum Presensi</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        {todayAtt?.checkInTime ? (
                          <span>{new Date(todayAtt.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                        {todayAtt?.checkOutTime && (
                          <span className="text-slate-500 block text-[10px]">
                            Pulang: {new Date(todayAtt.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setCardModalStudent(student)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Kartu Barcode</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">Tidak ada data siswa yang cocok</h3>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan filter kelas, pencarian nama, atau filter status gawai.</p>
          </div>
        )}
      </div>

      {/* Modal Cetak Kartu Barcode Siswa Non-Smartphone */}
      {cardModalStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Kartu Barcode Presensi Loket TU
              </h3>
              <button
                type="button"
                onClick={() => setCardModalStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Desain Kartu Fisik Presensi */}
            <div
              id="printable-barcode-card"
              className="border-2 border-indigo-200 rounded-2xl p-5 bg-gradient-to-b from-white to-slate-50 shadow-sm flex flex-col items-center text-center space-y-2.5"
            >
              <div className="border-b border-indigo-100 pb-2 w-full">
                <span className="text-[10px] font-black tracking-widest text-indigo-700 uppercase block">
                  SMKN 1 KANDANGHAUR
                </span>
                <span className="text-[9px] font-bold text-slate-500 block uppercase">
                  KARTU PRESENSI SISWA NON-SMARTPHONE
                </span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-slate-200 overflow-hidden border border-slate-300 shadow-sm flex items-center justify-center">
                {cardModalStudent.avatarUrl ? (
                  <img
                    src={cardModalStudent.avatarUrl}
                    alt={cardModalStudent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-7 h-7 text-slate-400" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 leading-tight">
                  {cardModalStudent.name}
                </h4>
                <p className="text-[11px] font-semibold text-indigo-700 mt-0.5">
                  Kelas: {cardModalStudent.studentClass || '-'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  NISN: {cardModalStudent.dapodikForm?.nisn || cardModalStudent.nipOrNis || '-'}
                </p>
              </div>

              {qrDataUrl && (
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-inner">
                  <img src={qrDataUrl} alt="QR Presensi" className="w-44 h-44 object-contain mx-auto" />
                </div>
              )}

              <div className="font-mono text-[10px] font-bold text-slate-600 tracking-wider bg-slate-100 px-3 py-1 rounded-md w-full">
                {cardModalStudent.dapodikForm?.nisn || cardModalStudent.nipOrNis || cardModalStudent.id}
              </div>

              <p className="text-[9px] text-slate-400 leading-tight">
                Tunjukkan kartu ini kepada Petugas Tata Usaha (TU) saat datang dan pulang sekolah untuk dipindai.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Kartu Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => setCardModalStudent(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
