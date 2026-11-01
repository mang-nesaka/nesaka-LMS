"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Users, FileText, Settings, 
  LogOut, Menu, FileSpreadsheet, Laptop, GraduationCap, 
  IdCard, ChevronRight, FileUp, FileCheck, Camera, QrCode, 
  School, BarChart3, Radio, FileSignature, AlertCircle, MapPin, Clock
} from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/app/actions/auth';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  hasAvatar: boolean;
}

interface DashboardShellProps {
  user: UserInfo;
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Konfigurasi Menu Berdasarkan Role Pengguna
  const getSidebarMenus = () => {
    if (user.role === 'STUDENT') {
      return [
        { name: 'Dashboard Siswa', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Presensi GPS & Selfie', href: '/dashboard/attendance', icon: Camera },
        { name: 'Kelas Pembelajaran', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Tugas Saya', href: '/dashboard/assignments', icon: FileText },
        { name: 'Ujian CBT', href: '/dashboard/exams', icon: Laptop },
        { name: 'Profil & Kartu Siswa', href: '/dashboard/profile', icon: IdCard },
        { name: 'Upload Berkas (Kelas 10)', href: '/dashboard/documents', icon: FileUp },
        { name: 'Formulir Dapodik', href: '/dashboard/dapodik', icon: FileSpreadsheet },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'TEACHER') {
      return [
        { name: 'Dashboard Guru', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Scan Kelas', href: '/dashboard/teacher-agenda', icon: QrCode },
        { name: 'Kelola Kelas', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Tugas & Penilaian', href: '/dashboard/assignments', icon: FileText },
        { name: 'Ujian CBT', href: '/dashboard/exams', icon: Laptop },
        { name: 'Barcode Ruang Kelas', href: '/dashboard/classrooms', icon: School },
        { name: 'Profil & Kartu Guru', href: '/dashboard/profile', icon: IdCard },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'WALI_KELAS') {
      return [
        { name: 'Dashboard Wali Kelas', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Rekap Kehadiran Siswa', href: '/dashboard/walikelas', icon: BarChart3 },
        { name: 'Kelas Pembelajaran', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Tugas & Penilaian', href: '/dashboard/assignments', icon: FileText },
        { name: 'Ujian CBT', href: '/dashboard/exams', icon: Laptop },
        { name: 'Barcode Ruang Kelas', href: '/dashboard/classrooms', icon: School },
        { name: 'Profil Saya', href: '/dashboard/profile', icon: IdCard },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'TU') {
      return [
        { name: 'Dashboard TU', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Manajemen', href: '/dashboard/management', icon: Users },
        { name: 'Verifikasi Dokumen Siswa', href: '/dashboard/documents', icon: FileCheck },
        { name: 'Rekap Dapodik (F-PD)', href: '/dashboard/dapodik', icon: FileSpreadsheet },
        { name: 'Koreksi Data Diri Siswa', href: '/dashboard/tu/corrections', icon: AlertCircle },
        { name: 'Cetak Barcode Ruang Kelas', href: '/dashboard/classrooms', icon: QrCode },
        { name: 'Jadwal Mengajar', href: '/dashboard/classrooms/schedules', icon: Clock },
        { name: 'Pengaturan GPS & Jam Sekolah', href: '/dashboard/settings/school', icon: MapPin },
        { name: 'Profil Saya', href: '/dashboard/profile', icon: IdCard },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'WAKA_KURIKULUM') {
      return [
        { name: 'Dashboard Kurikulum', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Monitoring Guru Real-Time', href: '/dashboard/monitoring', icon: Radio },
        { name: 'Rekap Kehadiran Siswa', href: '/dashboard/walikelas', icon: BarChart3 },
        { name: 'Rekap Nilai Ujian CBT', href: '/dashboard/exams/recap', icon: Laptop },
        { name: 'Berita Acara Kurikulum', href: '/dashboard/berita-acara?role=WAKA_KURIKULUM', icon: FileSignature },
        { name: 'Barcode Ruang Kelas', href: '/dashboard/classrooms', icon: QrCode },
        { name: 'Profil Saya', href: '/dashboard/profile', icon: IdCard },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'WAKA_KESISWAAN') {
      return [
        { name: 'Dashboard Kesiswaan', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Rekap Kehadiran Seluruh Siswa', href: '/dashboard/walikelas', icon: BarChart3 },
        { name: 'Berita Acara Kesiswaan', href: '/dashboard/berita-acara?role=WAKA_KESISWAAN', icon: FileSignature },
        { name: 'Profil Saya', href: '/dashboard/profile', icon: IdCard },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'WAKA_SARPRAS') {
      return [
        { name: 'Dashboard Sarpras', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Barcode Ruang Kelas', href: '/dashboard/classrooms', icon: QrCode },
        { name: 'Berita Acara Sarpras', href: '/dashboard/berita-acara?role=WAKA_SARPRAS', icon: FileSignature },
        { name: 'Profil Saya', href: '/dashboard/profile', icon: IdCard },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'WAKA_HUBDIN') {
      return [
        { name: 'Dashboard Hubdin', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Berita Acara Hubungan Industri', href: '/dashboard/berita-acara?role=WAKA_HUBDIN', icon: FileSignature },
        { name: 'Profil Saya', href: '/dashboard/profile', icon: IdCard },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'KEPSEK') {
      return [
        { name: 'Dashboard Kepala Sekolah', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Monitoring Guru Real-Time', href: '/dashboard/monitoring', icon: Radio },
        { name: 'Rekap Presensi Siswa', href: '/dashboard/walikelas', icon: BarChart3 },
        { name: 'Rekap Nilai Ujian CBT', href: '/dashboard/exams/recap', icon: Laptop },
        { name: 'Berita Acara Seluruh Waka', href: '/dashboard/berita-acara', icon: FileSignature },
        { name: 'Barcode Ruang Kelas', href: '/dashboard/classrooms', icon: QrCode },
        { name: 'Profil Pengawas', href: '/dashboard/profile', icon: IdCard },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    // Default untuk ADMIN (Super Administrator)
    return [
      { name: 'Dashboard Utama', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Monitoring Guru Real-Time', href: '/dashboard/monitoring', icon: Radio },
      { name: 'Presensi GPS Siswa', href: '/dashboard/attendance', icon: Camera },
      { name: 'Rekap Presensi Siswa', href: '/dashboard/walikelas', icon: BarChart3 },
      { name: 'Semua Kelas', href: '/dashboard/courses', icon: BookOpen },
      { name: 'Tugas Harian', href: '/dashboard/assignments', icon: FileText },
      { name: 'Ujian CBT', href: '/dashboard/exams', icon: Laptop },
      { name: 'Rekap Nilai CBT', href: '/dashboard/exams/recap', icon: Laptop },
      { name: 'Berita Acara Kegiatan', href: '/dashboard/berita-acara', icon: FileSignature },
      { name: 'Barcode Ruang Kelas', href: '/dashboard/classrooms', icon: QrCode },
      { name: 'Jadwal Mengajar', href: '/dashboard/classrooms/schedules', icon: Clock },
      { name: 'Manajemen', href: '/dashboard/management', icon: Users },
      { name: 'Verifikasi Dokumen (TU)', href: '/dashboard/documents', icon: FileCheck },
      { name: 'Koreksi Data Diri (TU)', href: '/dashboard/tu/corrections', icon: AlertCircle },
      { name: 'Rekap Dapodik (TU)', href: '/dashboard/dapodik', icon: FileSpreadsheet },
      { name: 'Pengaturan GPS Sekolah (TU)', href: '/dashboard/settings/school', icon: MapPin },
      { name: 'Profil Pengguna', href: '/dashboard/profile', icon: IdCard },
      { name: 'Pengaturan Sistem', href: '/dashboard/settings', icon: Settings },
    ];
  };

  const sidebarMenus = getSidebarMenus();

  // Konfigurasi Badge & Portal Name
  const getRoleDetails = () => {
    switch (user.role) {
      case 'STUDENT':
        return {
          portalTitle: 'Portal Siswa',
          badgeText: 'Siswa',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          avatarGrad: 'from-blue-500 to-indigo-600',
        };
      case 'TEACHER':
        return {
          portalTitle: 'Portal Guru & Pengajar',
          badgeText: 'Guru Pengajar',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          avatarGrad: 'from-purple-500 to-indigo-600',
        };
      case 'WALI_KELAS':
        return {
          portalTitle: 'Portal Wali Kelas',
          badgeText: 'Wali Kelas',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          avatarGrad: 'from-blue-600 to-cyan-600',
        };
      case 'TU':
        return {
          portalTitle: 'Portal Tata Usaha (TU)',
          badgeText: 'Staf TU',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          avatarGrad: 'from-emerald-500 to-teal-600',
        };
      case 'WAKA_KURIKULUM':
        return {
          portalTitle: 'Portal Waka Kurikulum',
          badgeText: 'Waka Kurikulum',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          avatarGrad: 'from-indigo-600 to-blue-700',
        };
      case 'WAKA_KESISWAAN':
        return {
          portalTitle: 'Portal Waka Kesiswaan',
          badgeText: 'Waka Kesiswaan',
          badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
          avatarGrad: 'from-teal-600 to-emerald-700',
        };
      case 'WAKA_SARPRAS':
        return {
          portalTitle: 'Portal Waka Sarana & Prasarana',
          badgeText: 'Waka Sarpras',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          avatarGrad: 'from-amber-600 to-orange-700',
        };
      case 'WAKA_HUBDIN':
        return {
          portalTitle: 'Portal Waka Hubungan Industri',
          badgeText: 'Waka Hubdin',
          badgeClass: 'bg-violet-50 text-violet-800 border-violet-200',
          avatarGrad: 'from-violet-600 to-purple-700',
        };
      case 'KEPSEK':
        return {
          portalTitle: 'Portal Pengawasan Kepala Sekolah',
          badgeText: 'Kepala Sekolah',
          badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
          avatarGrad: 'from-sky-700 to-blue-900',
        };
      case 'ADMIN':
      default:
        return {
          portalTitle: 'Portal Administrator',
          badgeText: 'Super Admin',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          avatarGrad: 'from-rose-500 to-pink-600',
        };
    }
  };

  const roleDetails = getRoleDetails();
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : 0 }}
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* Header Logo & Portal Subtitle */}
            <div className="h-20 flex flex-col justify-center px-6 border-b border-slate-100">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
                <span>LMS</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  EduSpace
                </span>
              </h1>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                {roleDetails.portalTitle}
              </div>
            </div>

            {/* Profile Brief in Sidebar (Clickable Link to Profile) */}
            <Link
              href="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className="px-4 py-3 mx-3 my-3 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-100 flex items-center gap-3 transition-colors group"
              title="Buka Profil & Kartu Siswa"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${roleDetails.avatarGrad} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 overflow-hidden group-hover:scale-105 transition-transform`}>
                {user.hasAvatar ? (
                  <img src="/api/profile/photo" alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                  {user.name}
                </p>
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md border mt-0.5 ${roleDetails.badgeClass}`}>
                  {roleDetails.badgeText}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Navigasi Menu Sesuai Role */}
            <nav className="px-3 py-2 space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)]">
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Menu Utama
              </div>
              {sidebarMenus.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Tombol Logout */}
          <div className="p-4 border-t border-slate-100">
            <form action={logout}>
              <button 
                type="submit"
                className="w-full flex items-center px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-sm font-semibold text-left"
              >
                <LogOut className="w-4 h-4 mr-3 text-rose-500" />
                Keluar Akun
              </button>
            </form>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shadow-sm sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              title="Buka Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Portal LMS
              </span>
              <span className="text-sm font-bold text-slate-800">
                {roleDetails.portalTitle}
              </span>
            </div>
          </div>
          
          <Link 
            href="/dashboard/profile"
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
            title="Lihat Profil & Kartu Digital"
          >
            <div className="text-right hidden sm:block">
              <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors block leading-tight">
                {user.name}
              </span>
              <span className="text-xs text-slate-400">{user.email}</span>
            </div>
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-tr ${roleDetails.avatarGrad} flex items-center justify-center text-white font-bold shadow-sm overflow-hidden group-hover:scale-105 transition-transform`}>
              {user.hasAvatar ? (
                <img src="/api/profile/photo" alt={user.name} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
