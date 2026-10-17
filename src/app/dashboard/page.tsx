export const instant = false;

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Users, CheckCircle, Clock, Laptop, 
  FileText, Plus, ChevronRight, AlertCircle, FileSpreadsheet,
  Award, Play, ArrowRight, ShieldCheck, Download, Sparkles, ExternalLink
} from 'lucide-react';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!currentUser) {
    redirect('/login');
  }

  // ==========================================
  // TAMPILAN DASHBOARD SISWA
  // ==========================================
  if (currentUser.role === 'STUDENT') {
    const [dapodikData, enrolledCourses, assignments, exams] = await Promise.all([
      prisma.dapodikForm.findUnique({ where: { studentId: currentUser.id } }),
      prisma.course.findMany({
        where: { enrollments: { some: { studentId: currentUser.id } } },
        include: {
          teacher: { select: { name: true } },
          _count: { select: { lessons: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.assignment.findMany({
        where: {
          lesson: {
            course: { enrollments: { some: { studentId: currentUser.id } } },
          },
        },
        include: {
          lesson: { include: { course: { select: { title: true } } } },
          submissions: { where: { studentId: currentUser.id } },
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      prisma.exam.findMany({
        where: {
          course: { enrollments: { some: { studentId: currentUser.id } } },
        },
        include: {
          course: { select: { title: true } },
          questions: { select: { id: true } },
          results: { where: { studentId: currentUser.id } },
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
    ]);

    const pendingAssignments = assignments.filter((a) => a.submissions.length === 0).length;
    const readyExams = exams.filter((e) => e.results.length === 0).length;
    const completedTasks = assignments.filter((a) => a.submissions.length > 0).length;

    return (
      <div className="space-y-7">
        {/* Banner Sambutan Siswa */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
              Portal Belajar Siswa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {currentUser.name}! 👋
            </h2>
            <p className="text-blue-100 text-sm sm:text-base mt-2">
              Selamat datang di ruang pembelajaran mandiri. Tetap fokus belajar, selesaikan tugas harian, dan bersiap untuk Ujian CBT berikutnya.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
            <BookOpen className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Notifikasi Formulir Dapodik jika belum diisi */}
        {!dapodikData && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Formulir Dapodik Siswa Baru Belum Diisi</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Sebagai siswa kelas 10, Anda diwajibkan melengkapi data pokok pendidikan (F-PD) untuk sinkronisasi data sekolah resmi.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/dapodik"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs whitespace-nowrap transition-colors shadow-sm"
            >
              Lengkapi Formulir Sekarang →
            </Link>
          </div>
        )}

        {/* Kartu Statistik Siswa */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Kelas Diikuti</p>
                <p className="text-2xl font-black text-slate-800">{enrolledCourses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Tugas Belum Selesai</p>
                <p className="text-2xl font-black text-slate-800">{pendingAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Ujian CBT Tersedia</p>
                <p className="text-2xl font-black text-slate-800">{readyExams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Tugas Terkumpul</p>
                <p className="text-2xl font-black text-slate-800">{completedTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Konten Utama Siswa: Kelas Saya & Jadwal CBT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kelas Pembelajaran Siswa */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Kelas Pembelajaran Saya</h3>
                <p className="text-xs text-slate-400">Buka modul belajar dari guru pengajar Anda</p>
              </div>
              <Link
                href="/dashboard/courses"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Lihat Semua ({enrolledCourses.length})
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Belum Mengikuti Kelas</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Minta tautan bergabung dari guru Anda untuk mulai mengakses materi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrolledCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/80 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{c.title}</h4>
                        <p className="text-xs text-slate-400">Guru: {c.teacher.name} • {c._count.lessons} Pertemuan</p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/courses`}
                      className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Buka Kelas
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ujian CBT Siap Dikerjakan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Ujian CBT</h3>
                <p className="text-xs text-slate-400">Ujian berbasis komputer online</p>
              </div>
              <Link href="/dashboard/exams" className="text-xs font-bold text-indigo-600">
                Semua Ujian
              </Link>
            </div>

            {exams.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl">
                <Laptop className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Tidak ada jadwal ujian CBT saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exams.map((ex) => {
                  const hasTaken = ex.results.length > 0;
                  return (
                    <div
                      key={ex.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-semibold text-indigo-600 uppercase">
                          {ex.course.title}
                        </span>
                        <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{ex.title}</h5>
                        <span className="text-[11px] text-slate-400">
                          {ex.questions.length} Soal • {ex.durationMinutes} Menit
                        </span>
                      </div>
                      {hasTaken ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg">
                          Nilai: {ex.results[0].score}
                        </span>
                      ) : (
                        <Link
                          href={`/dashboard/exams/${ex.id}`}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Mulai
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN DASHBOARD GURU
  // ==========================================
  if (currentUser.role === 'TEACHER') {
    const [teacherCourses, teacherExams, pendingSubmissions] = await Promise.all([
      prisma.course.findMany({
        where: { teacherId: currentUser.id },
        include: {
          _count: { select: { enrollments: true, lessons: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.exam.findMany({
        where: { course: { teacherId: currentUser.id } },
        include: {
          course: { select: { title: true } },
          questions: { select: { id: true } },
          results: { select: { id: true, score: true, violationsCount: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      prisma.submission.findMany({
        where: {
          grade: null,
          assignment: {
            lesson: {
              course: { teacherId: currentUser.id },
            },
          },
        },
        include: {
          student: { select: { name: true } },
          assignment: { select: { title: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 4,
      }),
    ]);

    const totalStudents = teacherCourses.reduce((acc, c) => acc + c._count.enrollments, 0);

    return (
      <div className="space-y-7">
        {/* Banner Sambutan Guru */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
              Portal Guru & Pengajar
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, Bapak/Ibu {currentUser.name}! 👨‍🏫
            </h2>
            <p className="text-purple-100 text-sm sm:text-base mt-2">
              Kelola kelas mengajar Anda, berikan materi dan tugas harian, serta buat ujian CBT langsung dengan mengunggah template Excel.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
            <Laptop className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Kartu Statistik Guru */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Kelas Mengajar</p>
                <p className="text-2xl font-black text-slate-800">{teacherCourses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Total Siswa Bimbingan</p>
                <p className="text-2xl font-black text-slate-800">{totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Perlu Dinilai</p>
                <p className="text-2xl font-black text-slate-800">{pendingSubmissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Ujian CBT Aktif</p>
                <p className="text-2xl font-black text-slate-800">{teacherExams.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Aksi Cepat Guru */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            Aksi Cepat Pengajar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/dashboard/courses"
              className="p-4 bg-purple-50/70 hover:bg-purple-100 border border-purple-100 rounded-2xl flex items-center gap-3 transition-colors group"
            >
              <div className="p-2.5 bg-purple-600 text-white rounded-xl group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-purple-950 text-sm">Buat Kelas Baru</h4>
                <p className="text-xs text-purple-700">Tambah rombel & bagikan link</p>
              </div>
            </Link>

            <Link
              href="/dashboard/assignments"
              className="p-4 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-100 rounded-2xl flex items-center gap-3 transition-colors group"
            >
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-950 text-sm">Beri Tugas Harian</h4>
                <p className="text-xs text-indigo-700">Tentukan batas waktu tugas</p>
              </div>
            </Link>

            <Link
              href="/dashboard/exams"
              className="p-4 bg-blue-50/70 hover:bg-blue-100 border border-blue-100 rounded-2xl flex items-center gap-3 transition-colors group"
            >
              <div className="p-2.5 bg-blue-600 text-white rounded-xl group-hover:scale-105 transition-transform">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-blue-950 text-sm">Buat Ujian CBT</h4>
                <p className="text-xs text-blue-700">Upload soal via Excel</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Konten Utama Guru: Kelas Mengajar & Ujian Terkini */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daftar Kelas Mengajar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Kelas Mengajar</h3>
              <Link href="/dashboard/courses" className="text-xs font-bold text-purple-600">
                Kelola Semua
              </Link>
            </div>

            {teacherCourses.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-400">Belum ada kelas yang Anda buat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teacherCourses.slice(0, 4).map((c) => (
                  <div key={c.id} className="p-3.5 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{c.title}</h4>
                      <p className="text-xs text-slate-400">{c._count.enrollments} Siswa Terdaftar • {c._count.lessons} Materi</p>
                    </div>
                    <Link
                      href="/dashboard/courses"
                      className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Detail
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ujian CBT & Pantauan Kejujuran */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Ujian CBT & Rekap Kejujuran</h3>
              <Link href="/dashboard/exams" className="text-xs font-bold text-purple-600">
                Lihat Rekap
              </Link>
            </div>

            {teacherExams.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-400">Belum ada ujian CBT yang dibuat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teacherExams.map((ex) => (
                  <div key={ex.id} className="p-3.5 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{ex.title}</h4>
                      <p className="text-xs text-slate-400">
                        {ex.course.title} • {ex.results.length} Siswa Mengerjakan
                      </p>
                    </div>
                    <Link
                      href="/dashboard/exams"
                      className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
                    >
                      Pantau
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN DASHBOARD TATA USAHA (TU) & ADMIN
  // ==========================================
  const [totalStudents, totalCourses, dapodikCount, totalExams] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.course.count(),
    prisma.dapodikForm.count(),
    prisma.exam.count(),
  ]);

  return (
    <div className="space-y-7">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
          {currentUser.role === 'TU' ? 'Portal Tata Usaha' : 'Portal Administrator'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Panel Administrasi Sekolah
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mt-2">
          Kelola data pokok pendidikan (Dapodik F-PD), manajemen akun siswa dan guru, serta ekspor format Excel resmi.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Siswa Terdaftar</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{totalStudents}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Dapodik F-PD Terisi</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{dapodikCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Kelas Aktif</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalCourses}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Ujian CBT</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{totalExams}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Ekspor Data Dapodik Siswa Baru (Kelas 10)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Unduh seluruh formulir F-PD siswa kelas 10 dalam format spreadsheet resmi Dapodik Kemdikbud lengkap dengan border dan warna cell.
            </p>
          </div>
          <a
            href="/api/dapodik/export"
            download
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            Unduh Spreadsheet Dapodik (.xlsx)
          </a>
        </div>
      </div>
    </div>
  );
}
