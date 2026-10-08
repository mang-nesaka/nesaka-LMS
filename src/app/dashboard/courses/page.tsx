import { PrismaClient } from '@prisma/client';
import { createCourse, deleteCourse } from '@/app/actions/course';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export default async function CoursesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  // Cek role user saat ini
  const currentUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';

  // Ambil data semua kelas beserta nama gurunya
  const courses = await prisma.course.findMany({
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Kelas</h2>
          <p className="text-slate-500 mt-1">Jelajahi dan kelola kelas-kelas pembelajaran.</p>
        </div>
      </div>

      {/* Form Tambah Kelas (Hanya untuk Guru/Admin) */}
      {isTeacherOrAdmin && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-indigo-600" />
            Buat Kelas Baru
          </h3>
          <form action={createCourse} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              name="title" 
              placeholder="Nama Kelas (Contoh: Biologi Kelas 10)" 
              required
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white"
            />
            <input 
              type="text" 
              name="description" 
              placeholder="Deskripsi singkat..." 
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white"
            />
            <button 
              type="submit" 
              className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Simpan
            </button>
          </form>
        </div>
      )}

      {/* Grid Daftar Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            Belum ada kelas yang dibuat.
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
              <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 flex flex-col justify-end relative">
                <h4 className="text-xl font-bold text-white z-10">{course.title}</h4>
                <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
                  {course.description || "Tidak ada deskripsi."}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-slate-400 text-xs">Pengajar</p>
                    <p className="font-medium text-slate-800">{course.teacher.name}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-400 text-xs">Siswa / Materi</p>
                    <p className="font-medium text-indigo-600">
                      {course._count.enrollments} / {course._count.lessons}
                    </p>
                  </div>
                </div>

                {isTeacherOrAdmin && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <form action={deleteCourse}>
                      <input type="hidden" name="id" value={course.id} />
                      <button type="submit" className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium">
                        <Trash2 className="w-4 h-4 mr-1" /> Hapus
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
