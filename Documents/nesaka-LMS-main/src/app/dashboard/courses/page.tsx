export const instant = false;

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import CreateCourseForm from './CreateCourseForm';
import CourseCard from './CourseCard';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

const prisma = new PrismaClient();

export default async function CoursesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  // Cek user saat ini
  const currentUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';
  const isStudent = currentUser?.role === 'STUDENT';

  // Ambil data semua kelas
  const courses = await prisma.course.findMany({
    where: isTeacherOrAdmin && currentUser?.role !== 'ADMIN' 
      ? { teacherId: userId } // Guru hanya melihat kelas yang dia ajar
      : isStudent 
      ? { enrollments: { some: { studentId: userId } } } // Siswa melihat kelas yang diikutinya
      : {}, // Admin melihat semua
    include: {
      teacher: {
        select: { name: true }
      },
      _count: {
        select: { enrollments: true, lessons: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isTeacherOrAdmin ? 'Manajemen Kelas Mengajar' : 'Kelas Pembelajaran Saya'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isTeacherOrAdmin 
              ? 'Kelola mata pelajaran, rombel yang diajar, dan bagikan tautan kelas ke siswa.'
              : 'Daftar kelas aktif yang Anda ikuti untuk melihat materi dan tugas.'}
          </p>
        </div>

        {isTeacherOrAdmin && <CreateCourseForm />}
      </div>

      {/* Grid Daftar Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {isTeacherOrAdmin ? 'Belum Ada Kelas yang Dibuat' : 'Belum Bergabung dengan Kelas Apapun'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {isTeacherOrAdmin 
                ? 'Klik tombol "Buat Kelas Baru" di atas untuk menentukan mata pelajaran dan kelas yang Anda ajar.'
                : 'Minta tautan undangan kelas kepada guru Anda untuk bergabung ke dalam kelas pembelajaran.'}
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              isTeacherOrAdmin={isTeacherOrAdmin} 
            />
          ))
        )}
      </div>
    </div>
  );
}
