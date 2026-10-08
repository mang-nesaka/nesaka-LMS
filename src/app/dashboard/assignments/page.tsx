import { PrismaClient } from '@prisma/client';
import { createAssignment, deleteAssignment } from '@/app/actions/assignment';
import { FileText, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export default async function AssignmentsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  // Cek role user saat ini
  const currentUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';

  // Ambil list course untuk dropdown saat membuat tugas (Hanya untuk Guru/Admin)
  let myCourses: any[] = [];
  if (isTeacherOrAdmin && userId) {
    myCourses = await prisma.course.findMany({
      where: currentUser?.role === 'ADMIN' ? {} : { teacherId: userId }
    });
  }

  // Ambil semua assignment (beserta nama Course dan Teacher)
  const assignments = await prisma.assignment.findMany({
    include: {
      lesson: {
        include: {
          course: {
            include: {
              teacher: { select: { name: true } }
            }
          }
        }
      },
      _count: { select: { submissions: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tugas & Ujian</h2>
          <p className="text-slate-500 mt-1">Kelola dan pantau semua tugas pembelajaran siswa.</p>
        </div>
      </div>

      {/* Form Tambah Tugas (Hanya Guru/Admin) */}
      {isTeacherOrAdmin && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-indigo-600" />
            Buat Tugas Baru
          </h3>
          <form action={createAssignment} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                name="courseId" 
                required
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 bg-slate-50 focus:bg-white"
              >
                <option value="">-- Pilih Kelas --</option>
                {myCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <input 
                type="text" 
                name="title" 
                placeholder="Judul Tugas (Contoh: Makalah Sejarah)" 
                required
                className="flex-[2] px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white"
              />
              <input 
                type="datetime-local" 
                name="dueDate" 
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <textarea 
                name="description" 
                placeholder="Deskripsi tugas atau instruksi pengerjaan..." 
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white min-h-[60px]"
              />
              <button 
                type="submit" 
                className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-indigo-700 transition-colors h-fit self-end"
              >
                Simpan Tugas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Tugas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            Belum ada tugas yang diberikan.
          </div>
        ) : (
          assignments.map(assignment => (
            <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  {isTeacherOrAdmin && (
                    <form action={deleteAssignment}>
                      <input type="hidden" name="id" value={assignment.id} />
                      <button type="submit" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
                
                <h4 className="text-xl font-bold text-slate-800 mb-1">{assignment.title}</h4>
                <p className="text-sm font-medium text-indigo-600 mb-3">{assignment.lesson.course.title}</p>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  {assignment.description || "Tidak ada instruksi khusus."}
                </p>

                <div className="space-y-2 mt-auto">
                  {assignment.dueDate && (
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      Tenggat: {assignment.dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-slate-500">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    Diberikan oleh: {assignment.lesson.course.teacher.name}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  {assignment._count.submissions} Siswa Mengumpulkan
                </span>
                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  {isTeacherOrAdmin ? "Lihat Nilai" : "Kumpulkan Tugas"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
