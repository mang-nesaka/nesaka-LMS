"use client";

import { useState } from 'react';
import { BookOpen, Copy, Check, Trash2, Users, FileText, Share2 } from 'lucide-react';
import { deleteCourse } from '@/app/actions/course';

interface CourseProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    teacher: { name: string };
    _count: { enrollments: number; lessons: number };
  };
  isTeacherOrAdmin: boolean;
}

export default function CourseCard({ course, isTeacherOrAdmin }: CourseProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/join/${course.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Banner Kartu */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 flex flex-col justify-end relative">
          <h4 className="text-xl font-bold text-white z-10 line-clamp-1">{course.title}</h4>
          <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Informasi Kelas */}
        <div className="p-6 pb-2">
          <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
            {course.description || "Kelas pembelajaran daring."}
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm">
              <p className="text-slate-400 text-xs">Guru Pengajar</p>
              <p className="font-semibold text-slate-800">{course.teacher.name}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-slate-400 text-xs">Siswa Terdaftar</p>
              <p className="font-semibold text-indigo-600 flex items-center justify-end gap-1">
                <Users className="w-3.5 h-3.5" />
                {course._count.enrollments} Siswa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Aksi / Bagikan Link */}
      <div className="p-6 pt-2">
        {isTeacherOrAdmin ? (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={handleCopyLink}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
              title="Salin tautan untuk dibagikan ke siswa"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Link Berhasil Disalin!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Bagikan Link ke Siswa
                </>
              )}
            </button>

            <form action={deleteCourse}>
              <input type="hidden" name="id" value={course.id} />
              <button 
                type="submit" 
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Hapus Kelas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <a
              href="/dashboard/assignments"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Lihat Tugas & Materi
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
