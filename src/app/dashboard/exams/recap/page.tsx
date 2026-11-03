import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ExamGradesClient from './ExamGradesClient';


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

  const teacherOnly = currentUser.role === 'TEACHER';
  const ownedExamFilter = teacherOnly ? { course: { teacherId: currentUser.id } } : {};
  const [exams, examResults] = await Promise.all([
    prisma.exam.findMany({
      where: ownedExamFilter,
      select: {
        id: true,
        title: true,
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.examResult.findMany({
      where: teacherOnly ? { exam: ownedExamFilter } : {},
      select: {
        id: true,
        score: true,
        totalCorrect: true,
        totalQuestions: true,
        violationsCount: true,
        submittedAt: true,
        student: {
          select: {
            id: true,
            name: true,
            studentClass: true,
            nipOrNis: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            course: { select: { title: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-800 via-blue-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-200 border border-white/20">
          {teacherOnly ? 'Ruang Kerja Guru' : 'Monitoring Akademik'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black mt-3">
          {teacherOnly ? 'Pengolahan Nilai Ujian CBT' : 'Rekapitulasi Nilai Ujian CBT'}
        </h1>
        <p className="text-indigo-100 text-sm mt-2 max-w-2xl">
          {teacherOnly
            ? 'Tinjau hasil per siswa, periksa jawaban, dan unduh rekap nilai dari ujian yang Anda kelola.'
            : 'Pantau skor ujian siswa, rata-rata nilai, dan rekaman pelanggaran CBT.'}
        </p>
      </div>

      <ExamGradesClient exams={exams} results={examResults} />
    </div>
  );
}
