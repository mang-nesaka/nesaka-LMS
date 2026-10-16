export const instant = false;

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import CbtExamScreen from './CbtExamScreen';
import { CheckCircle2, AlertTriangle, ArrowLeft, Award, Clock } from 'lucide-react';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });

  if (!user) {
    redirect('/login');
  }

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      course: {
        select: { title: true, teacherId: true },
      },
      questions: {
        orderBy: { questionNumber: 'asc' },
        select: {
          id: true,
          questionNumber: true,
          questionText: true,
          imageUrl: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
          optionE: true,
        },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  // Cek apakah siswa sudah pernah mengerjakan ujian ini
  const existingResult = await prisma.examResult.findUnique({
    where: {
      examId_studentId: {
        examId: id,
        studentId: userId,
      },
    },
  });

  // Jika siswa sudah submit, tampilkan kartu hasil nilai (tidak bisa mengulang)
  if (existingResult && user.role === 'STUDENT') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 mb-2">
              Ujian CBT Selesai
            </span>
            <h1 className="text-2xl font-bold text-slate-800">{exam.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{exam.course.title}</p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Nilai Akhir Anda</div>
            <div className="text-5xl font-extrabold text-blue-600">
              {existingResult.score}
              <span className="text-xl text-slate-400 font-normal"> / 100</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 text-sm">
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">Jawaban Benar</span>
                <span className="font-bold text-slate-700 text-base">
                  {existingResult.totalCorrect} / {existingResult.totalQuestions} Soal
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">Pelanggaran Terdeteksi</span>
                <span className={`font-bold text-base ${existingResult.violationsCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {existingResult.violationsCount}x Pelanggaran
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Diserahkan pada:{' '}
            {new Date(existingResult.submittedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })} WIB
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/exams"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar Ujian
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan layar CBT
  return (
    <div>
      {user.role !== 'STUDENT' && (
        <div className="bg-amber-500/10 border-b border-amber-200 text-amber-900 px-6 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Mode Pratinjau Guru / Admin:</strong> Anda sedang meninjau tampilan CBT untuk soal ujian ini.
            </span>
          </div>
          <Link
            href="/dashboard/exams"
            className="font-medium underline hover:text-amber-700 text-xs"
          >
            Keluar dari Pratinjau
          </Link>
        </div>
      )}

      <CbtExamScreen
        exam={{
          id: exam.id,
          title: exam.title,
          description: exam.description,
          durationMinutes: exam.durationMinutes,
          course: { title: exam.course.title },
        }}
        questions={exam.questions}
        studentName={user.name}
      />
    </div>
  );
}
