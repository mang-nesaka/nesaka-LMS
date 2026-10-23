"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Users, FileText, Settings, 
  LogOut, Menu, FileSpreadsheet, Laptop, GraduationCap, 
  IdCard, ChevronRight, FileUp, FileCheck
} from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/app/actions/auth';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
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
        { name: 'Kelola Kelas', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Tugas & Penilaian', href: '/dashboard/assignments', icon: FileText },
        { name: 'Ujian CBT', href: '/dashboard/exams', icon: Laptop },
        { name: 'Data Siswa', href: '/dashboard/students', icon: Users },
        { name: 'Profil & Kartu Guru', href: '/dashboard/profile', icon: IdCard },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'TU') {
      return [
        { name: 'Dashboard TU', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Data Seluruh Siswa', href: '/dashboard/students', icon: Users },
        { name: 'Verifikasi Dokumen Siswa', href: '/dashboard/documents', icon: FileCheck },
        { name: 'Rekap Dapodik (F-PD)', href: '/dashboard/dapodik', icon: FileSpreadsheet },
        { name: 'Profil Saya', href: '/dashboard/profile', icon: IdCard },
        { name: 'Pengaturan Akun', href: '/dashboard/settings', icon: Settings },
      ];
    }

    // Default untuk ADMIN
    return [
      { name: 'Dashboard Utama', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Semua Kelas', href: '/dashboard/courses', icon: BookOpen },
      { name: 'Tugas Harian', href: '/dashboard/assignments', icon: FileText },
      { name: 'Ujian CBT', href: '/dashboard/exams', icon: Laptop },
      { name: 'Manajemen Siswa', href: '/dashboard/students', icon: Users },
      { name: 'Verifikasi Dokumen Siswa', href: '/dashboard/documents', icon: FileCheck },
      { name: 'Rekap Dapodik', href: '/dashboard/dapodik', icon: FileSpreadsheet },
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
      case 'TU':
        return {
          portalTitle: 'Portal Tata Usaha (TU)',
          badgeText: 'Staf TU',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          avatarGrad: 'from-emerald-500 to-teal-600',
        };
      case 'ADMIN':
      default:
        return {
          portalTitle: 'Portal Administrator',
          badgeText: 'Admin',
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
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
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
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
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
