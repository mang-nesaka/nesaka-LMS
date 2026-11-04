export const instant = false;

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { addExtracurricularMember, createExtracurricular, createStudentAnnouncement } from '@/app/actions/studentAffairs';

export default async function KesiswaanPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/login');
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || !['WAKA_KESISWAAN', 'ADMIN'].includes(user.role)) redirect('/dashboard');

  const [advisors, students, extracurriculars, announcements] = await Promise.all([
    prisma.user.findMany({ where: { role: { in: ['TEACHER', 'WALI_KELAS'] } }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      where: { role: 'STUDENT', OR: [{ classroom: { level: '10' } }, { studentClass: { startsWith: 'X' } }] },
      select: { id: true, name: true, studentClass: true },
      orderBy: { name: 'asc' },
    }),
    prisma.extracurricular.findMany({
      include: {
        advisor: { select: { name: true } },
        members: { include: { student: { select: { name: true, studentClass: true } } }, orderBy: { joinedAt: 'desc' } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.announcement.findMany({ include: { author: { select: { name: true } } }, orderBy: { publishedAt: 'desc' }, take: 8 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase text-emerald-700">Wakil Kepala Sekolah</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Kesiswaan</h1>
        <p className="mt-1 text-sm text-slate-600">Koordinasi ekstrakurikuler kelas 10, pembina, dan pengumuman untuk seluruh siswa.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form action={createExtracurricular} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <h2 className="font-semibold text-slate-900">Tambah ekstrakurikuler</h2>
            <p className="text-xs text-slate-500">Daftar kegiatan dan tetapkan pembina.</p>
          </div>
          <label className="block text-xs font-medium text-slate-700">Nama kegiatan
            <input name="name" required maxLength={100} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs font-medium text-slate-700">Pembina
            <select name="advisorId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Pilih guru pembina</option>
              {advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-700">Keterangan
            <textarea name="description" rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Simpan kegiatan</button>
        </form>

        <form action={createStudentAnnouncement} className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <div>
            <h2 className="font-semibold text-slate-900">Broadcast siswa</h2>
            <p className="text-xs text-slate-600">Pengumuman akan tampil di dashboard seluruh siswa.</p>
          </div>
          <label className="block text-xs font-medium text-slate-700">Judul pengumuman
            <input name="title" required maxLength={140} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs font-medium text-slate-700">Isi pengumuman
            <textarea name="body" required maxLength={5000} rows={4} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" />
          </label>
          <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Kirim ke seluruh siswa</button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div><h2 className="font-semibold text-slate-900">Ekstrakurikuler</h2><p className="text-xs text-slate-500">{students.length} siswa kelas 10 tersedia untuk didaftarkan.</p></div>
        </div>
        {extracurriculars.length ? extracurriculars.map((activity) => (
          <article key={activity.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-semibold text-slate-900">{activity.name}</h3><p className="text-xs text-slate-500">Pembina: {activity.advisor.name} · {activity.members.length} siswa</p>
                {activity.description && <p className="mt-2 text-sm text-slate-600">{activity.description}</p>}
              </div>
              {students.length > 0 && (
                <form action={addExtracurricularMember} className="flex flex-wrap gap-2">
                  <input type="hidden" name="extracurricularId" value={activity.id} />
                  <select name="studentId" required className="min-w-52 rounded-md border border-slate-300 px-2 py-2 text-sm">
                    <option value="">Pilih siswa kelas 10</option>
                    {students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.studentClass ?? 'Kelas 10'}</option>)}
                  </select>
                  <button className="rounded-md border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-800">Tambah anggota</button>
                </form>
              )}
            </div>
            {activity.members.length > 0 && <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600">{activity.members.slice(0, 12).map((member) => `${member.student.name} (${member.student.studentClass ?? 'Kelas 10'})`).join(' · ')}{activity.members.length > 12 ? ` · +${activity.members.length - 12} lainnya` : ''}</p>}
          </article>
        )) : <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">Belum ada kegiatan ekstrakurikuler.</p>}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3"><h2 className="font-semibold text-slate-900">Riwayat broadcast</h2></div>
        <div className="divide-y divide-slate-100">
          {announcements.length ? announcements.map((announcement) => (
            <article key={announcement.id} className="px-4 py-3"><h3 className="text-sm font-semibold text-slate-900">{announcement.title}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{announcement.body}</p><p className="mt-2 text-xs text-slate-400">{announcement.author.name} · {announcement.publishedAt.toLocaleString('id-ID')}</p></article>
          )) : <p className="p-4 text-sm text-slate-500">Belum ada pengumuman.</p>}
        </div>
      </section>
    </div>
  );
}