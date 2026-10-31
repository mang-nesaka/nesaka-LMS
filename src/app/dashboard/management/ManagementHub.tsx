"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ShieldCheck, Trash2, Users, QrCode, PhoneOff } from 'lucide-react';
import { createTeacherAccount, clearDemoAccounts } from '@/app/actions/management';
import ImportForm from '@/app/dashboard/students/ImportForm';
import DemoDataImportForm from '@/app/dashboard/students/DemoDataImportForm';

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  studentClass: string | null;
  createdAt: string;
  enrollments: number;
  submissions: number;
  hasDapodik: boolean;
}

interface TeacherRecord {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  courses: number;
  schedules: number;
}

interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Props {
  students: StudentRecord[];
  teachers: TeacherRecord[];
  demoAccounts: DemoAccount[];
  demoStudentCount: number;
  demoTeacherCount: number;
}

type Tab = 'students' | 'teachers' | 'demo';

export default function ManagementHub({
  students,
  teachers,
  demoAccounts,
  demoStudentCount,
  demoTeacherCount,
}: Props) {
  const router = useRouter();
  const teacherFormRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [query, setQuery] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleStudents = students.filter((student) =>
    `${student.name} ${student.email} ${student.studentClass ?? ''}`.toLowerCase().includes(normalizedQuery),
  );
  const visibleTeachers = teachers.filter((teacher) =>
    `${teacher.name} ${teacher.email}`.toLowerCase().includes(normalizedQuery),
  );
  const visibleDemoAccounts = demoAccounts.filter((account) =>
    `${account.name} ${account.email} ${account.role}`.toLowerCase().includes(normalizedQuery),
  );
  const demoAccountCount = demoStudentCount + demoTeacherCount;

  async function handleCreateTeacher(formData: FormData) {
    setIsPending(true);
    setNotice(null);
    try {
      await createTeacherAccount(formData);
      teacherFormRef.current?.reset();
      setNotice({ type: 'success', text: 'Akun guru berhasil dibuat.' });
      router.refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Gagal membuat akun guru.' });
    } finally {
      setIsPending(false);
    }
  }

  async function handleClearDemoAccounts() {
    setIsPending(true);
    setNotice(null);
    try {
      const result = await clearDemoAccounts();
      setConfirmClear(false);
      setNotice({ type: 'success', text: `${result.deletedCount} akun demo berhasil dihapus beserta data siswa terkait.` });
      router.refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Gagal menghapus akun demo.' });
    } finally {
      setIsPending(false);
    }
  }

  const tabs: Array<{ id: Tab; label: string; count: number; icon: typeof Users }> = [
    { id: 'students', label: 'Siswa', count: students.length, icon: Users },
    { id: 'teachers', label: 'Guru', count: teachers.length, icon: GraduationCap },
    { id: 'demo', label: 'Akun Demo', count: demoAccountCount, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen</h1>
          <p className="text-sm text-slate-500">Kelola data siswa, akun guru, dan data demo sekolah.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/tu/attendance-scan"
            className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Scan Presensi TU</span>
          </Link>
          <Link
            href="/dashboard/tu/non-smartphone"
            className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
          >
            <PhoneOff className="w-4 h-4 text-amber-600" />
            <span>Siswa Non-Smartphone</span>
          </Link>
        </div>
      </header>

      <div role="tablist" aria-label="Bagian manajemen" className="flex overflow-x-auto border-b border-slate-200">
        {tabs.map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            id={`management-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`management-panel-${id}`}
            onClick={() => { setActiveTab(id); setQuery(''); setNotice(null); }}
            className={`flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors ${activeTab === id ? 'border-teal-700 text-teal-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{count}</span>
          </button>
        ))}
      </div>

      {notice && (
        <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {notice.text}
        </p>
      )}

      {activeTab === 'students' && (
        <section id="management-panel-students" role="tabpanel" aria-labelledby="management-tab-students" className="space-y-5">
          <ImportForm />
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Data siswa</h2>
                <p className="text-xs text-slate-500">{students.length} akun siswa terdaftar</p>
              </div>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama, email, atau kelas"
                aria-label="Cari siswa"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:max-w-xs"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="px-4 py-3">Siswa</th><th className="px-4 py-3">Kelas</th><th className="px-4 py-3">Dapodik</th><th className="px-4 py-3">Aktivitas</th><th className="px-4 py-3">Terdaftar</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleStudents.length ? visibleStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3"><p className="font-medium text-slate-900">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></td>
                      <td className="px-4 py-3 text-slate-600">{student.studentClass || '-'}</td>
                      <td className="px-4 py-3"><span className={student.hasDapodik ? 'text-emerald-700' : 'text-amber-700'}>{student.hasDapodik ? 'Lengkap' : 'Belum isi'}</span></td>
                      <td className="px-4 py-3 text-slate-600">{student.enrollments} kelas · {student.submissions} tugas</td>
                      <td className="px-4 py-3 text-slate-500">{student.createdAt}</td>
                    </tr>
                  )) : <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Tidak ada siswa yang cocok.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'teachers' && (
        <section id="management-panel-teachers" role="tabpanel" aria-labelledby="management-tab-teachers" className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-teal-700" />
              <div><h2 className="font-semibold text-slate-900">Tambah akun guru</h2><p className="text-xs text-slate-500">Guru dapat melengkapi profil setelah masuk.</p></div>
            </div>
            <form ref={teacherFormRef} action={handleCreateTeacher} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input name="name" required placeholder="Nama lengkap" aria-label="Nama lengkap guru" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input name="email" required type="email" placeholder="Email login" aria-label="Email login guru" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input name="password" required type="password" minLength={6} placeholder="Password (min. 6 karakter)" aria-label="Password awal guru" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <button disabled={isPending} className="min-h-10 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
                {isPending ? 'Menyimpan...' : 'Buat akun guru'}
              </button>
            </form>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-semibold text-slate-900">Daftar guru</h2><p className="text-xs text-slate-500">{teachers.length} akun guru</p></div>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau email" aria-label="Cari guru" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:max-w-xs" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Guru</th><th className="px-4 py-3">Kelas diajar</th><th className="px-4 py-3">Jadwal</th><th className="px-4 py-3">Terdaftar</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleTeachers.length ? visibleTeachers.map((teacher) => (
                    <tr key={teacher.id}><td className="px-4 py-3"><p className="font-medium text-slate-900">{teacher.name}</p><p className="text-xs text-slate-500">{teacher.email}</p></td><td className="px-4 py-3 text-slate-600">{teacher.courses} kelas</td><td className="px-4 py-3 text-slate-600">{teacher.schedules} jadwal</td><td className="px-4 py-3 text-slate-500">{teacher.createdAt}</td></tr>
                  )) : <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">Tidak ada guru yang cocok.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'demo' && (
        <section id="management-panel-demo" role="tabpanel" aria-labelledby="management-tab-demo" className="space-y-5">
          <DemoDataImportForm />
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Akun demo</h2>
                <p className="mt-1 text-sm text-slate-500">Hanya akun dengan email berakhiran <code>@nesaka.demo</code> yang akan dihapus. Data kelas dan course tidak ikut dihapus.</p>
              </div>
              <div className="flex gap-5 text-sm">
                <span><strong className="text-slate-900">{demoStudentCount}</strong> siswa</span>
                <span><strong className="text-slate-900">{demoTeacherCount}</strong> guru</span>
              </div>
            </div>
            {demoAccountCount > 0 && (
              <div className="mt-4 overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Nama</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Role</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleDemoAccounts.map((account) => <tr key={account.id}><td className="px-3 py-2 text-slate-800">{account.name}</td><td className="px-3 py-2 text-slate-600">{account.email}</td><td className="px-3 py-2 text-slate-600">{account.role === 'STUDENT' ? 'Siswa' : 'Guru'}</td></tr>)}
                  </tbody>
                </table>
                <p className="px-3 py-2 text-xs text-slate-500">Menampilkan maksimal 12 akun terbaru.</p>
              </div>
            )}
            {confirmClear ? (
              <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-900">Hapus {demoAccountCount} akun demo?</p>
                <p className="mt-1 text-xs text-rose-800">Data presensi, dokumen, pengumpulan tugas, enrollment, dan formulir Dapodik siswa demo juga akan dihapus. Akun guru demo yang masih memiliki course akan memblokir proses ini.</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setConfirmClear(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">Batal</button>
                  <button type="button" onClick={() => void handleClearDemoAccounts()} disabled={isPending} className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{isPending ? 'Menghapus...' : 'Ya, hapus akun demo'}</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)} disabled={demoAccountCount === 0 || isPending} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
                <Trash2 className="h-4 w-4" /> Kosongkan akun demo
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}