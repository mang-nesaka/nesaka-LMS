"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Link2, School, Trash2, Users } from 'lucide-react';
import {
  assignHomeroomTeacherToClass,
  assignStudentToClass,
  assignTeacherToClass,
  removeTeacherFromClass,
} from '@/app/actions/management';

interface ClassroomOption {
  id: string;
  name: string;
}

interface TeacherRecord {
  id: string;
  name: string;
  email: string;
  teachingClassrooms: Array<{ classroomId: string; classroom: { name: string } }>;
}

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  studentClass: string | null;
  classroomId: string | null;
  classroom: { name: string } | null;
}

interface HomeroomTeacherRecord {
  id: string;
  name: string;
  email: string;
  waliKelasOf: string | null;
  homeroomClassId: string | null;
  homeroomClass: { name: string } | null;
}

interface Props {
  classrooms: ClassroomOption[];
  teachers: TeacherRecord[];
  students: StudentRecord[];
  homeroomTeachers: HomeroomTeacherRecord[];
}

type AssignmentAction = (formData: FormData) => Promise<unknown>;
type Tab = 'teachers' | 'students' | 'homeroom';

export default function ClassAssignmentsClient({ classrooms, teachers, students, homeroomTeachers }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('teachers');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleTeachers = teachers.filter((teacher) => `${teacher.name} ${teacher.email}`.toLowerCase().includes(normalizedSearch));
  const visibleStudents = students.filter((student) => `${student.name} ${student.email} ${student.studentClass ?? ''}`.toLowerCase().includes(normalizedSearch));
  const visibleHomeroomTeachers = homeroomTeachers.filter((teacher) => `${teacher.name} ${teacher.email} ${teacher.waliKelasOf ?? ''}`.toLowerCase().includes(normalizedSearch));
  const visibleRows = activeTab === 'teachers' ? visibleTeachers : activeTab === 'students' ? visibleStudents : visibleHomeroomTeachers;
  const pageSize = 50;
  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageStart = currentPage * pageSize;
  const pagedTeachers = visibleTeachers.slice(pageStart, pageStart + pageSize);
  const pagedStudents = visibleStudents.slice(pageStart, pageStart + pageSize);
  const pagedHomeroomTeachers = visibleHomeroomTeachers.slice(pageStart, pageStart + pageSize);

  async function submitAssignment(event: FormEvent<HTMLFormElement>, action: AssignmentAction, successText: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsPending(true);
    setNotice(null);
    try {
      await action(formData);
      setNotice({ type: 'success', text: successText });
      router.refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Penempatan kelas gagal disimpan.' });
    } finally {
      setIsPending(false);
    }
  }

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: 'teachers', label: 'Guru', count: teachers.length },
    { id: 'students', label: 'Siswa', count: students.length },
    { id: 'homeroom', label: 'Wali kelas', count: homeroomTeachers.length },
  ];

  return (
    <div className="space-y-5">
      {!classrooms.length && (
        <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Belum ada ruang kelas. Buat kelas terlebih dahulu sebelum melakukan penempatan.
        </p>
      )}
      {notice && (
        <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {notice.text}
        </p>
      )}

      <div role="tablist" aria-label="Jenis penempatan" className="flex overflow-x-auto border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(''); setPage(0); setNotice(null); }}
            className={`flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-semibold ${activeTab === tab.id ? 'border-teal-700 text-teal-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {tab.id === 'teachers' ? <School className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            {tab.label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tab.count}</span>
          </button>
        ))}
      </div>

      <label className="block max-w-sm">
        <span className="sr-only">Cari pengguna</span>
        <input
          type="search"
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(0); }}
          placeholder="Cari nama, email, atau kelas"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      {activeTab === 'teachers' && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Guru</th><th className="px-4 py-3">Kelas terhubung</th><th className="px-4 py-3">Tambah kelas</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="px-4 py-3"><strong className="block text-slate-900">{teacher.name}</strong><span className="text-xs text-slate-500">{teacher.email}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {teacher.teachingClassrooms.length ? teacher.teachingClassrooms.map((assignment) => (
                          <form
                            key={assignment.classroomId}
                            onSubmit={(event) => submitAssignment(event, removeTeacherFromClass, 'Kelas guru berhasil dilepas.')}
                            className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800"
                          >
                            <input type="hidden" name="teacherId" value={teacher.id} />
                            <input type="hidden" name="classroomId" value={assignment.classroomId} />
                            {assignment.classroom.name}
                            <button type="submit" disabled={isPending} aria-label={`Lepas ${assignment.classroom.name} dari ${teacher.name}`} className="rounded p-0.5 hover:bg-teal-100 disabled:opacity-50">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </form>
                        )) : <span className="text-xs text-amber-700">Belum terhubung</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {classrooms.some((classroom) => !teacher.teachingClassrooms.some((assignment) => assignment.classroomId === classroom.id)) ? (
                        <form onSubmit={(event) => submitAssignment(event, assignTeacherToClass, 'Guru berhasil dihubungkan ke kelas.')} className="flex min-w-64 gap-2">
                          <input type="hidden" name="teacherId" value={teacher.id} />
                          <select name="classroomId" required defaultValue="" disabled={isPending} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
                            <option value="" disabled>Pilih kelas</option>
                            {classrooms.filter((classroom) => !teacher.teachingClassrooms.some((assignment) => assignment.classroomId === classroom.id)).map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
                          </select>
                          <button type="submit" disabled={isPending} title="Hubungkan kelas" className="rounded-lg bg-teal-700 px-2.5 text-white hover:bg-teal-800 disabled:opacity-40">
                            <Link2 className="h-4 w-4" />
                          </button>
                        </form>
                      ) : <span className="text-xs text-slate-500">Semua kelas sudah terhubung</span>}
                    </td>
                  </tr>
                ))}
                {!visibleTeachers.length && <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Tidak ada guru yang cocok.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'students' && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Siswa</th><th className="px-4 py-3">Kelas saat ini</th><th className="px-4 py-3">Atur kelas</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-3"><strong className="block text-slate-900">{student.name}</strong><span className="text-xs text-slate-500">{student.email}</span></td>
                    <td className="px-4 py-3 text-slate-600">{student.classroom?.name || 'Belum terhubung'}</td>
                    <td className="px-4 py-3">
                      <form onSubmit={(event) => submitAssignment(event, assignStudentToClass, 'Kelas siswa berhasil diperbarui.')} className="flex min-w-64 gap-2">
                        <input type="hidden" name="studentId" value={student.id} />
                        <select name="classroomId" required defaultValue={student.classroomId ?? ''} disabled={!classrooms.length || isPending} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
                          <option value="" disabled>Pilih kelas</option>
                          {classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
                        </select>
                        <button type="submit" disabled={!classrooms.length || isPending} title="Simpan kelas siswa" className="rounded-lg bg-teal-700 px-2.5 text-white hover:bg-teal-800 disabled:opacity-40">
                          <Link2 className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {!visibleStudents.length && <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Tidak ada siswa yang cocok.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'homeroom' && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Wali kelas</th><th className="px-4 py-3">Kelas binaan</th><th className="px-4 py-3">Atur kelas</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedHomeroomTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="px-4 py-3"><strong className="block text-slate-900">{teacher.name}</strong><span className="text-xs text-slate-500">{teacher.email}</span></td>
                    <td className="px-4 py-3 text-slate-600">{teacher.homeroomClass?.name || 'Belum terhubung'}</td>
                    <td className="px-4 py-3">
                      <form onSubmit={(event) => submitAssignment(event, assignHomeroomTeacherToClass, 'Kelas binaan wali kelas berhasil diperbarui.')} className="flex min-w-64 gap-2">
                        <input type="hidden" name="teacherId" value={teacher.id} />
                        <select name="classroomId" required defaultValue={teacher.homeroomClassId ?? ''} disabled={!classrooms.length || isPending} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
                          <option value="" disabled>Pilih kelas</option>
                          {classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
                        </select>
                        <button type="submit" disabled={!classrooms.length || isPending} title="Simpan kelas binaan" className="rounded-lg bg-teal-700 px-2.5 text-white hover:bg-teal-800 disabled:opacity-40">
                          <Link2 className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {!visibleHomeroomTeachers.length && <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Belum ada akun wali kelas yang cocok.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Menampilkan {visibleRows.length ? pageStart + 1 : 0}–{Math.min(pageStart + pageSize, visibleRows.length)} dari {visibleRows.length} pengguna
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0} aria-label="Halaman sebelumnya" className="rounded-lg border border-slate-300 p-2 disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-20 text-center">Halaman {currentPage + 1} / {pageCount}</span>
          <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage + 1 >= pageCount} aria-label="Halaman berikutnya" className="rounded-lg border border-slate-300 p-2 disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}