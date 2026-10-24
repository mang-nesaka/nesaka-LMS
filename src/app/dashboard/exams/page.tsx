export const instant = false;

import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import Link from 'next/link';
import { deleteExam } from '@/app/actions/exam';
import CreateExamModal from './CreateExamModal';
import { 
  Laptop, Clock, FileQuestion, Users, AlertTriangle, 
  CheckCircle2, Play, Trash2, ExternalLink, ShieldAlert, Award, ChevronRight
} from 'lucide-react';


export default async function ExamsPage() {
  const userId = await getSessionUserId();

  const currentUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';
  const isStudent = currentUser?.role === 'STUDENT';

  // Guru/Admin Courses
  let myCourses: { id: string; title: string }[] = [];
  if (isTeacherOrAdmin && userId) {
    myCourses = await prisma.course.findMany({
      where: currentUser?.role === 'ADMIN' ? {} : { teacherId: userId },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });
  }

  // Jika Guru/Admin: Ambil seluruh ujian yang diajar beserta hasil submission siswa
  let teacherExams: any[] = [];
  if (isTeacherOrAdmin && userId) {
    teacherExams = await prisma.exam.findMany({
      where: currentUser?.role === 'ADMIN' ? {} : {
        course: { teacherId: userId }
      },
      include: {
        course: { select: { title: true } },
        questions: { select: { id: true } },
        results: {
          include: {
            student: { select: { name: true, email: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Jika Siswa: Ambil ujian dari kelas yang diikutinya
  let studentExams: any[] = [];
  if (isStudent && userId) {
    studentExams = await prisma.exam.findMany({
      where: {
        course: {
          enrollments: {
            some: { studentId: userId },
          },
        },
      },
      include: {
        course: { select: { title: true } },
        questions: { select: { id: true } },
        results: {
          where: { studentId: userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Laptop className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-slate-800">
              {isTeacherOrAdmin ? 'Ujian CBT (Computer Based Test)' : 'Ujian CBT Saya'}
            </h2>
          </div>
          <p className="text-slate-500 mt-1">
            {isTeacherOrAdmin 
              ? 'Kelola ujian daring berbasis komputer, unggah soal via Excel, dan pantau kejujuran siswa.'
              : 'Daftar ujian CBT daring terjadwal untuk kelas yang Anda ikuti.'}
          </p>
        </div>

        {/* Modal Buat Ujian hanya untuk Guru/Admin */}
        {isTeacherOrAdmin && (
          <CreateExamModal courses={myCourses} />
        )}
      </div>

      {/* TAMPILAN SISWA */}
      {isStudent && (
        <div className="space-y-6">
          {/* Petunjuk & Peraturan CBT */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-sm">
                <h4 className="font-bold text-amber-950">Aturan Keamanan Sistem CBT (Anti-Kecurangan)</h4>
                <ul className="list-disc list-inside text-xs sm:text-sm text-amber-800 space-y-1">
                  <li>Ujian wajib dijalankan dalam mode <strong>Layar Penuh (Fullscreen)</strong>.</li>
                  <li>Siswa dilarang berpindah tab browser, membuka aplikasi lain, atau meminimalkan jendela ujian.</li>
                  <li>Sistem mencatat setiap indikasi keluar layar (Alt+Tab, Windows Key, F11, F12, dsb).</li>
                  <li>Jika terdeteksi melakukan pelanggaran sebanyak <strong>3 kali</strong>, lembar ujian otomatis diserahkan dan dihitung nilainya.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* List Ujian Siswa */}
          {studentExams.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
              <Laptop className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">Belum Ada Ujian CBT</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Saat ini belum ada jadwal ujian CBT aktif untuk mata pelajaran yang Anda ikuti.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {studentExams.map((exam) => {
                const result = exam.results?.[0];
                const hasTaken = Boolean(result);

                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                          {exam.course.title}
                        </span>
                        {hasTaken ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Selesai
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                            Siap Dikerjakan
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{exam.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {exam.description || 'Ujian CBT pilihan ganda'}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mt-4 py-3 border-y border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{exam.durationMinutes} Menit</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileQuestion className="w-4 h-4 text-slate-400" />
                          <span>{exam.questions.length} Butir Soal</span>
                        </div>
                      </div>

                      {hasTaken && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400 block">Nilai Anda:</span>
                            <span className="text-2xl font-black text-blue-600">{result.score}</span>
                            <span className="text-xs text-slate-400 ml-1">/ 100</span>
                          </div>
                          <div className="text-right text-xs">
                            <span className="text-slate-500 block">
                              Benar: <strong>{result.totalCorrect}</strong> / {result.totalQuestions}
                            </span>
                            <span className={result.violationsCount > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600'}>
                              {result.violationsCount}x Pelanggaran
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3">
                      {hasTaken ? (
                        <Link
                          href={`/dashboard/exams/${exam.id}`}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                        >
                          Lihat Rincian Nilai
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <Link
                          href={`/dashboard/exams/${exam.id}`}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Mulai Ujian CBT
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAMPILAN GURU / ADMIN */}
      {isTeacherOrAdmin && (
        <div className="space-y-6">
          {teacherExams.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-xl mx-auto">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Laptop className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Belum Ada Ujian CBT</h3>
              <p className="text-sm text-slate-500 mt-2">
                Buat ujian CBT pertama Anda dengan mengunduh template Excel, mengisi butir soal (bisa rumus matematika KaTeX, bahasa Arab, dan link gambar), lalu unggah file tersebut.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href="/api/exams/template"
                  download
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Unduh Template Excel
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {teacherExams.map((exam) => {
                const totalStudentsTaken = exam.results.length;

                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-3 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                            {exam.course.title}
                          </span>
                          <span className="text-xs text-slate-400">
                            Dibuat:{' '}
                            {new Date(exam.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{exam.title}</h3>
                        {exam.description && (
                          <p className="text-sm text-slate-500 mt-0.5">{exam.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/exams/${exam.id}`}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Pratinjau CBT
                        </Link>
                        <form action={deleteExam}>
                          <input type="hidden" name="id" value={exam.id} />
                          <button
                            type="submit"
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Hapus Ujian CBT"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Stats Ringkasan Ujian */}
                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span className="text-slate-400 block text-xs">Durasi</span>
                          <span className="font-bold text-slate-700">{exam.durationMinutes} Menit</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileQuestion className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <span className="text-slate-400 block text-xs">Jumlah Soal</span>
                          <span className="font-bold text-slate-700">{exam.questions.length} Butir</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500 shrink-0" />
                        <div>
                          <span className="text-slate-400 block text-xs">Selesai Mengerjakan</span>
                          <span className="font-bold text-slate-700">{totalStudentsTaken} Siswa</span>
                        </div>
                      </div>
                    </div>

                    {/* Tabel Rekap Nilai & Pelanggaran Siswa */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Rekap Nilai & Pantauan Kejujuran Siswa
                      </h4>
                      {totalStudentsTaken === 0 ? (
                        <div className="text-xs text-slate-400 italic py-2">
                          Belum ada siswa yang menyelesaikan ujian ini.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                                <th className="pb-2">Nama Siswa</th>
                                <th className="pb-2">Nilai Akhir</th>
                                <th className="pb-2">Jawaban Benar</th>
                                <th className="pb-2">Pelanggaran CBT</th>
                                <th className="pb-2 text-right">Waktu Submit</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {exam.results.map((res: any) => (
                                <tr key={res.id} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 font-semibold text-slate-800">
                                    {res.student.name}
                                    <span className="block text-[11px] font-normal text-slate-400">
                                      {res.student.email}
                                    </span>
                                  </td>
                                  <td className="py-2.5">
                                    <span className="font-bold text-blue-600 text-base">{res.score}</span>
                                    <span className="text-slate-400 text-xs"> / 100</span>
                                  </td>
                                  <td className="py-2.5 text-slate-600">
                                    {res.totalCorrect} dari {res.totalQuestions} soal
                                  </td>
                                  <td className="py-2.5">
                                    {res.violationsCount === 0 ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3" />
                                        0 Pelanggaran (Jujur)
                                      </span>
                                    ) : res.violationsCount >= 3 ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                        <AlertTriangle className="w-3 h-3" />
                                        {res.violationsCount}x (Auto-Submit)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                        <AlertTriangle className="w-3 h-3" />
                                        {res.violationsCount}x Pelanggaran
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 text-right text-slate-400 text-xs">
                                    {new Date(res.submittedAt).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })} WIB
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
