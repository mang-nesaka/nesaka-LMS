"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, ArrowRight, GraduationCap, CheckCircle2, 
  Laptop, FileSpreadsheet, ShieldCheck, FileText, School
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 rounded-b-[4rem] shadow-2xl z-0" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-5xl w-full bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden z-10 border border-white/40 my-8"
      >
        <div className="p-8 sm:p-12 text-center relative overflow-hidden">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200"
          >
            <GraduationCap className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-3 tracking-tight">
            LMS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Nesaka</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Sistem Manajemen Pembelajaran Digital Terintegrasi dengan Fitur Ujian CBT Anti-Kecurangan, Dapodik Resmi, dan Manajemen Kelas Interaktif.
          </p>
        </div>
        
        <div className="p-6 sm:p-10 bg-slate-50/60 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* PORTAL SISWA */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }}
              className="bg-white border-2 border-indigo-100 rounded-3xl p-7 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-13 h-13 p-3 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                    Akses Pembelajaran
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">Portal Siswa</h2>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Ruang belajar daring bagi siswa untuk mengakses kelas, mengerjakan tugas harian, dan mengikuti ujian CBT.
                </p>

                {/* Fitur Khusus Siswa */}
                <div className="space-y-2.5 mb-8 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Kelas Pembelajaran:</strong> Ikuti kelas guru & akses materi</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Tugas Harian:</strong> Kumpulkan tugas & pantau umpan balik</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Ujian CBT Online:</strong> Kerjakan ujian dalam mode layar penuh</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Formulir Dapodik:</strong> Pengisian data pokok siswa kelas 10</span>
                  </div>
                </div>
              </div>

              <Link 
                href="/login" 
                className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl w-full transition-all duration-300 shadow-md shadow-indigo-200"
              >
                <span>Masuk sebagai Siswa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* PORTAL GURU */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }}
              className="bg-white border-2 border-purple-100 rounded-3xl p-7 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-13 h-13 p-3 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                    Akses Mengajar
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">Portal Guru</h2>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Pusat kendali pengajar untuk mengelola rombel, memberikan tugas harian, dan membuat ujian CBT.
                </p>

                {/* Fitur Khusus Guru */}
                <div className="space-y-2.5 mb-8 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Kelola Kelas & Bagikan Link:</strong> Undang siswa ke kelas</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Tugas & Penilaian:</strong> Beri tugas dan penilaian mudah</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Ujian CBT via Excel:</strong> Upload soal rumus KaTeX & Arab</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Pantau Kejujuran Siswa:</strong> Rekap pelanggaran & nilai otomatis</span>
                  </div>
                </div>
              </div>

              <Link 
                href="/login" 
                className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl w-full transition-all duration-300 shadow-md shadow-purple-200"
              >
                <span>Masuk sebagai Guru</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

          </div>

          {/* Footer Akses TU & Admin */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-slate-400" />
              <span>Untuk Staf Tata Usaha (TU) dan Administrator Sekolah:</span>
            </div>
            <Link 
              href="/login" 
              className="font-bold text-slate-700 hover:text-indigo-600 underline flex items-center gap-1"
            >
              Masuk ke Portal Staf TU / Admin
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
