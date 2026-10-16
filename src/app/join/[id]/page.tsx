export const instant = false;

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import Link from 'next/link';
import JoinButton from './JoinButton';
import { BookOpen, User, Users, GraduationCap, ArrowLeft, School } from 'lucide-react';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JoinPage({ params }: PageProps) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      teacher: { select: { name: true, email: true } },
      _count: { select: { enrollments: true, lessons: true } }
    }
  });

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Kelas Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500">
            Tautan undangan kelas yang Anda tuju mungkin sudah kedaluwarsa atau kelas telah dihapus oleh pengajar.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  let currentUser = null;
  let isEnrolled = false;

  if (userId) {
    currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    if (currentUser) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: currentUser.id,
            courseId: course.id,
          }
        }
      });
      isEnrolled = !!enrollment;
    }
  }

  const isLoggedIn = !!currentUser;
  const isStudent = currentUser?.role === 'STUDENT';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header Kecil */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-800">
          <School className="w-5 h-5 text-indigo-600" />
          <span>LMS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">EduSpace</span></span>
        </Link>
        {currentUser && (
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
            Halo, {currentUser.name}
          </span>
        )}
      </div>

      {/* Kartu Undangan Kelas */}
      <div className="max-w-xl mx-auto w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden my-auto">
        {/* Cover Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
            Undangan Bergabung Kelas
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            {course.title}
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1">
            {course.description || "Kelas pembelajaran resmi di LMS EduSpace."}
          </p>
        </div>

        {/* Informasi Pengajar & Peserta */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Guru Pengajar</p>
                <p className="text-sm font-bold text-slate-800">{course.teacher.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Siswa Terdaftar</p>
                <p className="text-sm font-bold text-slate-800">{course._count.enrollments} Siswa</p>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Gabung */}
          <JoinButton
            courseId={course.id}
            isEnrolled={isEnrolled}
            isLoggedIn={isLoggedIn}
            isStudent={isStudent}
          />
        </div>
      </div>

      {/* Footer Bawah */}
      <div className="text-center text-xs text-slate-400 pt-6">
        © 2026 LMS EduSpace. Platform Pembelajaran Daring Sekolah.
      </div>
    </div>
  );
}
