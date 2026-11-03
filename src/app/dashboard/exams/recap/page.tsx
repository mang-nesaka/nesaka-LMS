import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import ExamGradesClient from './ExamGradesClient';


export default async function ExamRecapPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, homeroomClassId: true },
  });

  if (!currentUser || !['KEPSEK', 'ADMIN', 'WAKA_KURIKULUM', 'TEACHER', 'WALI_KELAS'].includes(currentUser.role)) {
    redirect('/dashboard');
  }

  const teacherOnly = currentUser.role === 'TEACHER';
  const waliKelasOnly = currentUser.role === 'WALI_KELAS';
  const examFilter: Prisma.ExamWhereInput = {};
  const resultFilter: Prisma.ExamResultWhereInput = {};
  if (teacherOnly) {
    examFilter.course = { teacherId: currentUser.id };
    resultFilter.exam = { course: { teacherId: currentUser.id } };
  } else if (waliKelasOnly) {
    if (currentUser.homeroomClassId) {
      examFilter.results = { some: { student: { classroomId: currentUser.homeroomClassId } } };
      resultFilter.student = { classroomId: currentUser.homeroomClassId };
    } else {
      examFilter.id = '__no_assigned_class__';
      resultFilter.id = '__no_assigned_class__';
    }
  }

  const [exams, examResults] = await Promise.all([
    prisma.exam.findMany({
      where: examFilter,
      select: {
        id: true,
        title: true,
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.examResult.findMany({
      where: resultFilter,
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
          {teacherOnly
            ? 'Pengolahan Nilai Ujian CBT'
            : waliKelasOnly
              ? 'Nilai CBT Kelas'
              : 'Rekapitulasi Nilai Ujian CBT'}
        </h1>
        <p className="text-indigo-100 text-sm mt-2 max-w-2xl">
          {teacherOnly
            ? 'Tinjau hasil per siswa, unduh template, sesuaikan nilai, dan unggah kembali.'
            : waliKelasOnly
              ? 'Pantau nilai CBT siswa yang terhubung ke kelas binaan Anda.'
              : 'Pantau skor ujian siswa, rata-rata nilai, dan rekaman pelanggaran CBT.'}
        </p>
      </div>

      {!currentUser.homeroomClassId && waliKelasOnly && (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Kelas binaan belum diatur pada akun wali kelas ini.
        </p>
      )}
      <ExamGradesClient
        exams={exams}
        results={examResults}
        canManageGrades={teacherOnly || currentUser.role === 'ADMIN'}
        canReviewAnswers={!waliKelasOnly}
      />
    </div>
  );
}
