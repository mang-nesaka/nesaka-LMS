"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Mail, Lock, ArrowLeft, LogIn, AlertCircle, 
  Users, BookOpen, School 
} from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { login } from '../actions/auth';

type PortalType = 'siswa' | 'guru' | 'admin';

function LoginForm() {
  const searchParams = useSearchParams();
  const initialPortal = (searchParams.get('portal') as PortalType) || 'siswa';

  const [activePortal, setActivePortal] = useState<PortalType>('siswa');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPortal === 'guru' || initialPortal === 'admin' || initialPortal === 'siswa') {
      setActivePortal(initialPortal);
    }
  }, [initialPortal]);

  const selectPortal = (portal: PortalType) => {
    setActivePortal(portal);
    setError(null);
    setEmail('');
    setPassword('');
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  // Portal configs
  const portalConfig = {
    siswa: {
      title: 'Portal Siswa',
      badge: 'Akses Belajar Mandiri',
      desc: 'Masuk untuk mengakses materi kelas, tugas harian, dan ujian CBT.',
      themeColor: 'from-blue-600 to-indigo-600',
      activeTab: 'bg-indigo-600 text-white shadow-md shadow-indigo-200',
    },
    guru: {
      title: 'Portal Guru & Pengajar',
      badge: 'Akses Manajemen Kelas',
      desc: 'Masuk untuk membuat kelas, membagikan link rombel, dan upload soal CBT.',
      themeColor: 'from-purple-600 to-indigo-600',
      activeTab: 'bg-purple-600 text-white shadow-md shadow-purple-200',
    },
    admin: {
      title: 'Portal TU & Admin',
      badge: 'Akses Administrasi',
      desc: 'Masuk untuk rekapitulasi data Dapodik dan manajemen sistem sekolah.',
      themeColor: 'from-slate-700 to-slate-900',
      activeTab: 'bg-slate-800 text-white shadow-md',
    },
  }[activePortal];

  return (
    <div className="w-full max-w-lg z-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/40"
      >
        {/* Tab Pilihan Portal */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => selectPortal('siswa')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activePortal === 'siswa' 
                ? portalConfig.activeTab 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => selectPortal('guru')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activePortal === 'guru' 
                ? portalConfig.activeTab 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Guru</span>
          </button>

          <button
            type="button"
            onClick={() => selectPortal('admin')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activePortal === 'admin' 
                ? portalConfig.activeTab 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <School className="w-4 h-4" />
            <span>TU / Admin</span>
          </button>
        </div>

        {/* Header Portal Info */}
        <div className="text-center mb-7">
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full mb-2 border border-slate-200">
            {portalConfig.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {portalConfig.title}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {portalConfig.desc}
          </p>
        </div>

        {/* Form Login */}
        <form className="space-y-4" action={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white"
                placeholder="nama@sekolah.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r ${portalConfig.themeColor} hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-70`}
            >
              {loading ? (
                <span className="flex items-center">Memverifikasi Akun...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Masuk ke {portalConfig.title}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-3xl z-0" />

      <Suspense fallback={<div className="text-slate-400 text-sm">Memuat halaman masuk...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
