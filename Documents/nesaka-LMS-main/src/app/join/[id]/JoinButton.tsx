"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinCourseAction } from '@/app/actions/course';
import { LogIn, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  courseId: string;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  isStudent: boolean;
}

export default function JoinButton({ courseId, isEnrolled, isLoggedIn, isStudent }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  if (!isLoggedIn) {
    return (
      <a
        href={`/login?redirect=/join/${courseId}`}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all"
      >
        <LogIn className="w-5 h-5" />
        Masuk Akun Siswa untuk Bergabung
      </a>
    );
  }

  if (!isStudent) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
          Anda sedang login sebagai Guru / Staf. Hanya akun Siswa yang dapat mendaftar ke kelas ini.
        </p>
        <a
          href="/dashboard/courses"
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-2xl transition-all"
        >
          Buka Dashboard Kelas
        </a>
      </div>
    );
  }

  if (isEnrolled || joined) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Selamat! Anda sudah terdaftar di kelas ini.</span>
        </div>
        <button
          onClick={() => router.push('/dashboard/courses')}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all"
        >
          Buka Kelas Saya
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  async function handleJoin() {
    setLoading(true);
    setErrorMsg(null);
    try {
      await joinCourseAction(courseId);
      setJoined(true);
      setTimeout(() => {
        router.push('/dashboard/courses');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal bergabung ke kelas.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium text-center">
          {errorMsg}
        </div>
      )}
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Mendaftarkan ke Kelas...
          </>
        ) : (
          <>
            Gabung ke Kelas Sekarang
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
