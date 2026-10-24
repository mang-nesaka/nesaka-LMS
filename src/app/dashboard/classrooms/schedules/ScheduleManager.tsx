"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Plus, Trash2 } from 'lucide-react';
import { createClassSchedule, deactivateClassSchedule } from '@/app/actions/agenda';

interface ScheduleRow {
  id: string;
  subject: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  classroom: { id: string; name: string; code: string };
  teacher: { id: string; name: string; email: string };
}

interface Option {
  id: string;
  name: string;
  detail?: string;
}

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function ScheduleManager({
  classrooms,
  teachers,
  schedules,
}: {
  classrooms: Option[];
  teachers: Option[];
  schedules: ScheduleRow[];
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  return (
    <div className="space-y-6">
      <form
        action={async (formData) => {
          setIsPending(true);
          setMessage(null);
          try {
            await createClassSchedule(formData);
            setMessage({ type: 'success', text: 'Jadwal mengajar berhasil dibuat.' });
            router.refresh();
          } catch (error) {
            setMessage({
              type: 'error',
              text: error instanceof Error ? error.message : 'Jadwal gagal disimpan.',
            });
          } finally {
            setIsPending(false);
          }
        }}
        className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <CalendarClock className="w-5 h-5 text-teal-700" />
          <h2 className="text-base font-bold text-slate-900">Buat Jadwal Mengajar</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <label className="text-xs font-semibold text-slate-700 space-y-1.5">
            Guru Mapel
            <select name="teacherId" required defaultValue="" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="" disabled>Pilih guru</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700 space-y-1.5">
            Ruang Kelas
            <select name="classroomId" required defaultValue="" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="" disabled>Pilih ruang</option>
              {classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700 space-y-1.5">
            Mata Pelajaran
            <input name="subject" required maxLength={100} placeholder="Contoh: Matematika" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          </label>
          <label className="text-xs font-semibold text-slate-700 space-y-1.5">
            Hari
            <select name="dayOfWeek" required defaultValue="1" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              {dayNames.map((day, index) => <option key={day} value={index}>{day}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700 space-y-1.5">
            Mulai
            <input name="startTime" type="time" required defaultValue="07:00" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          </label>
          <label className="text-xs font-semibold text-slate-700 space-y-1.5">
            Selesai
            <input name="endTime" type="time" required defaultValue="08:30" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          </label>
        </div>

        {message && (
          <p role="status" className={`text-sm ${message.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
            {message.text}
          </p>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
            <Plus className="w-4 h-4" />
            {isPending ? 'Menyimpan...' : 'Tambah Jadwal'}
          </button>
        </div>
      </form>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Jadwal Resmi</h2>
          <span className="text-xs text-slate-500">{schedules.filter((schedule) => schedule.isActive).length} aktif</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Hari / Jam</th>
                <th className="px-5 py-3">Guru</th>
                <th className="px-5 py-3">Mata Pelajaran</th>
                <th className="px-5 py-3">Ruang</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-800">{dayNames[schedule.dayOfWeek]}</span>
                    <span className="block text-xs text-slate-500">{schedule.startTime}–{schedule.endTime}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{schedule.teacher.name}</td>
                  <td className="px-5 py-3.5 text-slate-700">{schedule.subject}</td>
                  <td className="px-5 py-3.5 text-slate-700">{schedule.classroom.name}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold ${schedule.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {schedule.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {schedule.isActive && (
                      <form action={async () => { await deactivateClassSchedule(schedule.id); router.refresh(); }}>
                        <button type="submit" title="Nonaktifkan jadwal" className="inline-flex p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">Belum ada jadwal yang dibuat.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
