import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Laptop, Award, AlertTriangle, Users, BookOpen, CheckCircle } from 'lucide-react';


export default async function ExamRecapPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });

  if (!currentUser || !['KEPSEK', 'ADMIN', 'WAKA_KURIKULUM', 'TEACHER'].includes(currentUser.role)) {
    redirect('/dashboard');
  }

  // Guru hanya boleh melihat hasil ujian dari kursus yang dia kelola.
  // Admin, kepala sekolah, dan waka kurikulum tetap dapat melihat seluruh hasil.
  const examResults = await prisma.examResult.findMany({
    where: currentUser.role === 'TEACHER'
      ? { exam: { is: { course: { is: { teacherId: currentUser.id } } } } }
      : {},
    include: {
      student: {
        select: {
          id: true,
          name: true,
          studentClass: true,
          nipOrNis: true,
        },
      },
      exam: {
        include: {
          course: {
            select: {
              title: true,
              teacher: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
  });

  // Hitung rata-rata dan statistik
  const totalSubmissions = examResults.length;
  const avgScore = totalSubmissions > 0
    ? Math.round(examResults.reduce((acc, curr) => acc + curr.score, 0) / totalSubmissions)
    : 0;
  const totalViolations = examResults.reduce((acc, curr) => acc + curr.violationsCount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-800 via-blue-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-200 border border-white/20">
            Monitoring Nilai & Anti-Kecurangan CBT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-2">
            <span>📊 Rekapitulasi Nilai Ujian CBT Siswa</span>
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Pantau skor ujian seluruh siswa, tingkat ketuntasan nilai, serta rekaman pelanggaran keluar tab/layar ujian saat tes CBT berlangsung.
          </p>
        </div>
      </div>

      {/* Ringkasan Cepat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Ujian Dikerjakan</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{totalSubmissions} Kali</span>
          <span className="text-[11px] text-indigo-600 font-semibold">Tersimpan di Sistem LMS</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Rata-Rata Nilai Siswa</span>
          <span className="text-3xl font-black text-emerald-700 mt-1 block">{avgScore} / 100</span>
          <span className="text-[11px] text-emerald-600 font-semibold">Seluruh Mata Pelajaran</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Pelanggaran Terdeteksi</span>
          <span className="text-3xl font-black text-amber-700 mt-1 block">{totalViolations} Kali</span>
          <span className="text-[11px] text-amber-600 font-semibold">Sistem Anti-Kecurangan CBT</span>
        </div>
      </div>

      {/* Tabel Nilai Ujian */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Hasil Pengerjaan Ujian CBT Siswa</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Terbaru</span>
        </div>

        {examResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-3">Kelas</th>
                  <th className="py-3.5 px-3">Judul Ujian CBT</th>
                  <th className="py-3.5 px-3">Kursus / Mapel</th>
                  <th className="py-3.5 px-3 text-center">Skor Nilai</th>
                  <th className="py-3.5 px-3 text-center">Benar / Total</th>
                  <th className="py-3.5 px-3 text-center">Pelanggaran Tab</th>
                  <th className="py-3.5 px-4 text-right">Waktu Submit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {examResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{res.student?.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{res.student?.nipOrNis || '-'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[11px]">
                        {res.student?.studentClass || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{res.exam?.title}</td>
                    <td className="py-3 px-3 text-slate-600">{res.exam?.course?.title}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-black text-xs ${
                          res.score >= 75
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {res.score}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {res.totalCorrect} / {res.totalQuestions}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {res.violationsCount > 0 ? (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-md border border-rose-200 text-[10px]">
                          {res.violationsCount}x Keluar Tab
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-[11px]">Bersih</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-[11px] text-slate-400">
                      {new Date(res.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Laptop className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs text-slate-500">Belum ada siswa yang menyelesaikan ujian CBT.</p>
          </div>
        )}
      </div>
    </div>
  );
}
