"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Users, ArrowRight, GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 rounded-b-[4rem] shadow-2xl z-0" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden z-10 border border-white/20"
      >
        <div className="p-12 text-center relative overflow-hidden">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200"
          >
            <GraduationCap className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
            LMS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">EduSpace</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
            Platform pembelajaran digital interaktif yang dirancang untuk masa depan pendidikan yang lebih baik.
          </p>
        </div>
        
        <div className="p-8 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Siswa Card */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Portal Siswa</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Akses semua materi pembelajaran, kumpulkan tugas tepat waktu, dan pantau perkembangan nilai Anda.
              </p>
              <Link 
                href="/login" 
                className="flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-600 font-semibold py-3 px-6 rounded-xl w-full group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300"
              >
                <span>Masuk sebagai Siswa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Guru Card */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                <BookOpen className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Portal Guru</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Kelola kelas dengan mudah, bagikan materi interaktif, dan berikan evaluasi belajar untuk siswa.
              </p>
              <Link 
                href="/login" 
                className="flex items-center justify-center space-x-2 bg-purple-50 text-purple-600 font-semibold py-3 px-6 rounded-xl w-full group-hover:bg-purple-600 group-hover:text-white transition-all duration-300"
              >
                <span>Masuk sebagai Guru</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
