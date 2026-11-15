import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { isGradeTwelve } from '@/lib/eIjazah';
import EIjazahManagement from './EIjazahManagement';
import EIjazahStudentView from './EIjazahStudentView';

export default async function EIjazahPage() {
  const currentUser = await requireRole('STUDENT', 'TU', 'ADMIN');

  if (currentUser.role === 'STUDENT') {
    const student = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        name: true,
        studentClass: true,
        graduationYear: true,
        classroom: { select: { name: true, level: true } },
        documents: {
          where: { docType: 'E_IJAZAH' },
          select: { fileName: true, fileSize: true, updatedAt: true },
          take: 1,
        },
      },
    });

    if (!student) redirect('/dashboard');

    const isEligible = isGradeTwelve(
      student.studentClass,
      student.classroom?.level,
      student.classroom?.name,
    );
    const document = student.documents[0] ?? null;

    return (
      <main className="mx-auto max-w-4xl space-y-6">
        <header className="border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold text-emerald-700">Layanan Kelulusan</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">E-Ijazah</h1>
          <p className="mt-2 text-sm text-slate-600">
            {student.name} · {student.graduationYear ? `Alumni ${student.graduationYear}` : student.classroom?.name ?? student.studentClass ?? 'Kelas belum terdata'}
          </p>
        </header>

        {!isEligible && !student.graduationYear ? (
          <p className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-700">
            E-Ijazah tersedia untuk siswa kelas XII.
          </p>
        ) : document ? (
          <EIjazahStudentView
            studentId={currentUser.id}
            fileName={document.fileName}
            fileSize={document.fileSize}
            updatedAt={document.updatedAt ? document.updatedAt.toISOString() : null}
          />
        ) : (
          <p className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-700">
            {student.graduationYear
              ? `E-Ijazah belum tersedia untuk Alumni ${student.graduationYear}.`
              : 'E-Ijazah Anda belum diunggah oleh TU/admin.'}
          </p>
        )}
      </main>
    );
  }

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      name: true,
      email: true,
      studentClass: true,
      classroom: { select: { name: true, level: true } },
      documents: {
        where: { docType: 'E_IJAZAH' },
        select: { fileName: true, fileSize: true, updatedAt: true },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  });

  const gradeTwelveStudents = students
    .filter((student) => isGradeTwelve(
      student.studentClass,
      student.classroom?.level,
      student.classroom?.name,
    ))
    .map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      className: student.classroom?.name ?? student.studentClass ?? 'Kelas XII',
      fileName: student.documents[0]?.fileName ?? null,
      fileSize: student.documents[0]?.fileSize ?? null,
      updatedAt: student.documents[0]?.updatedAt.toISOString() ?? null,
    }));

  return <EIjazahManagement students={gradeTwelveStudents} />;
}