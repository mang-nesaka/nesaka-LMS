export const instant = false;
import { PrismaClient } from '@prisma/client';
import { Search, UserPlus, MoreVertical, GraduationCap, Mail } from 'lucide-react';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export default async function StudentsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  const currentUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  const isAdmin = currentUser?.role === 'ADMIN';
  const isTeacher = currentUser?.role === 'TEACHER';

  // Jika bukan Guru atau Admin, larang akses (atau tampilkan pesan kosong)
  if (!isAdmin && !isTeacher) {
    return (
      <div className="text-center py-20 text-slate-500">
        Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  // Ambil data semua siswa
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      _count: { select: { enrollments: true, submissions: true } }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Siswa</h2>
          <p className="text-slate-500 mt-1">Kelola data siswa, pantau keaktifan, dan pencapaian akademik.</p>
        </div>
        
        {isAdmin && (
          <button className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-indigo-700 transition-colors">
            <UserPlus className="w-5 h-5 mr-2" />
            Tambah Siswa
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau email siswa..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Informasi Siswa</th>
                <th className="px-6 py-4 text-center">Kelas Diikuti</th>
                <th className="px-6 py-4 text-center">Tugas Dikumpulkan</th>
                <th className="px-6 py-4">Tanggal Bergabung</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Belum ada siswa yang terdaftar.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-slate-900 flex items-center">
                            {student.name}
                          </div>
                          <div className="text-slate-500 flex items-center mt-0.5 text-xs">
                            <Mail className="w-3 h-3 mr-1" />
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {student._count.enrollments} Kelas
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        {student._count.submissions} Tugas
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


