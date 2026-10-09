"use client";

import { motion } from 'framer-motion';
import { BookOpen, Users, CheckCircle, Clock } from 'lucide-react';

const stats = [
  { name: 'Total Kelas', value: '12', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { name: 'Total Siswa', value: '148', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Tugas Selesai', value: '85%', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { name: 'Menunggu Penilaian', value: '24', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Ringkasan Aktivitas</h2>
        <p className="text-slate-500 mt-1">Pantau perkembangan kelas dan tugas terbaru Anda di sini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${item.bg}`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500">{item.name}</p>
                  <p className="text-2xl font-semibold text-slate-800">{item.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Area: Recent Courses & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Courses) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Kelas Aktif Anda</h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Lihat Semua</button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-base font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Matematika Dasar {i+1}</h4>
                  <p className="text-sm text-slate-500">Pertemuan ke-{3 + i} • 32 Siswa</p>
                </div>
                <div className="w-24 bg-slate-200 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(i+1)*25}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column (Announcements/Tasks) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tugas Mendatang</h3>
          <div className="space-y-5">
            {[1, 2].map((_, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-amber-400">
                <p className="text-sm font-semibold text-slate-800">Kumpulkan Makalah Biologi</p>
                <p className="text-xs text-slate-500 mt-1">Tenggat: Besok, 23:59</p>
              </div>
            ))}
            <div className="relative pl-4 border-l-2 border-emerald-400">
                <p className="text-sm font-semibold text-slate-800">Kuis Sejarah Selesai</p>
                <p className="text-xs text-slate-500 mt-1">Nilai: 90/100</p>
            </div>
          </div>
          <button className="w-full mt-6 py-2 px-4 bg-indigo-50 text-indigo-600 font-medium rounded-xl hover:bg-indigo-100 transition-colors">
            Lihat Kalender
          </button>
        </motion.div>

      </div>
    </div>
  );
}


