export const instant = false;

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';

export default async function KurikulumPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/login');
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || !['WAKA_KURIKULUM', 'KEPSEK', 'ADMIN'].includes(user.role)) redirect('/dashboard');

  const [courses, assignmentCount, submissionCount, recentSubmissions] = await Promise.all([
    prisma.course.findMany({
      select: {
        id: true,
        title: true,
        teacher: { select: { name: true } },
        _count: { select: { lessons: true, exams: true, enrollments: true } },
        exams: {
          select: { id: true, title: true, _count: { select: { questions: true } } },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.assignment.count(),
    prisma.submission.count(),
    prisma.submission.findMany({
      select: {
        id: true,
        submittedAt: true,
        student: { select: { name: true } },
        assignment: { select: { title: true, lesson: { select: { course: { select: { title: true } } } } } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 8,
    }),
  ]);

  const exams = courses.flatMap((course) => course.exams.map((exam) => ({
    ...exam,
    courseTitle: course.title,
    teacherName: course.teacher.name,
  })));
  const teachersWithExams = new Set(exams.map((exam) => exam.teacherName)).size;
  const examCount = courses.reduce((total, course) => total + course._count.exams, 0);
  const lessonCount = courses.reduce((total, course) => total + course._count.lessons, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">Wakil Kepala Sekolah</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Monitoring Kurikulum</h1>
          <p className="mt-1 text-sm text-slate-600">Pantau ujian, penyusunan soal CBT, dan aktivitas pembelajaran jarak jauh.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/exams/recap" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Rekap nilai CBT</Link>
          <Link href="/dashboard/monitoring" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Agenda guru</Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan kurikulum">
        {[
          ['Guru menyusun CBT', teachersWithExams],
          ['Ujian CBT', examCount],
          ['Materi pembelajaran', lessonCount],
          ['Pengumpulan tugas', submissionCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Kelas dan soal CBT</h2>
            <p className="text-xs text-slate-500">Jumlah ujian yang dibuat tiap guru per kelas.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {courses.length ? courses.map((course) => (
              <article key={course.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-slate-900">{course.title}</h3>
                    <p className="text-xs text-slate-500">{course.teacher.name} · {course._count.enrollments} siswa</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{course._count.exams} ujian · {course._count.lessons} materi</p>
                </div>
                {course.exams.length > 0 && (
                  <ul className="mt-3 space-y-1 border-l-2 border-teal-200 pl-3">
                    {course.exams.map((exam) => <li key={exam.id} className="text-xs text-slate-600">{exam.title} <span className="text-slate-400">· {exam._count.questions} soal</span></li>)}
                  </ul>
                )}
              </article>
            )) : <p className="p-6 text-sm text-slate-500">Belum ada kelas pembelajaran.</p>}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Aktivitas pembelajaran jarak jauh</h2>
            <p className="text-xs text-slate-500">{assignmentCount} tugas tercatat di LMS.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {recentSubmissions.length ? recentSubmissions.map((submission) => (
              <article key={submission.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-800">{submission.assignment.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{submission.student.name} · {submission.assignment.lesson.course.title}</p>
                <time className="mt-1 block text-[11px] text-slate-400" dateTime={submission.submittedAt.toISOString()}>
                  {submission.submittedAt.toLocaleString('id-ID')}
                </time>
              </article>
            )) : <p className="p-6 text-sm text-slate-500">Belum ada pengumpulan tugas yang tercatat.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}