export const instant = false;

import { redirect } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { createFacilityReport, updateFacilityReport } from '@/app/actions/facility';

const statusLabels: Record<string, string> = {
  RECEIVED: 'Laporan diterima',
  IN_PROGRESS: 'Perbaikan sedang diproses',
  COMPLETED: 'Perbaikan selesai',
};

export default async function SarprasPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/login');
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, role: true } });
  if (!user) redirect('/login');

  if (user.role === 'STUDENT') {
    const reports = await prisma.facilityReport.findMany({
      where: { studentId: user.id },
      select: { id: true, title: true, location: true, status: true, handlingNote: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <header><p className="text-xs font-semibold uppercase text-amber-700">Layanan Sarana dan Prasarana</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Laporan Kerusakan</h1><p className="mt-1 text-sm text-slate-600">Laporkan fasilitas sekolah yang rusak dan pantau tindak lanjutnya.</p></header>
        <form action={createFacilityReport} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Judul laporan
            <input name="title" required maxLength={120} placeholder="Contoh: Kipas angin ruang kelas rusak" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">Lokasi fasilitas
            <input name="location" required maxLength={180} placeholder="Contoh: X RPL 1, dekat papan tulis" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Keterangan kerusakan
            <textarea name="description" required rows={4} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Foto kerusakan (JPG, PNG, WEBP; maks. 5 MB)
            <input name="photo" required type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-amber-50 file:px-3 file:py-1.5 file:font-semibold file:text-amber-800" />
          </label>
          <div className="sm:col-span-2"><button className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white">Kirim laporan</button></div>
        </form>

        <section className="space-y-3">
          <h2 className="font-semibold text-slate-900">Laporan saya</h2>
          {reports.length ? reports.map((report) => (
            <article key={report.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-slate-900">{report.title}</h3><p className="text-xs text-slate-500">{report.location} · {report.createdAt.toLocaleDateString('id-ID')}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{statusLabels[report.status] ?? report.status}</span></div>
              <ol className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                {(['RECEIVED', 'IN_PROGRESS', 'COMPLETED'] as const).map((status, index) => {
                  const step = ['RECEIVED', 'IN_PROGRESS', 'COMPLETED'].indexOf(report.status);
                  return <li key={status} className={`border-t-2 pt-2 ${index <= step ? 'border-emerald-600 font-semibold text-emerald-800' : 'border-slate-200 text-slate-400'}`}>{statusLabels[status]}</li>;
                })}
              </ol>
              {report.handlingNote && <p className="mt-3 text-sm text-slate-600">Catatan: {report.handlingNote}</p>}
            </article>
          )) : <p className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500">Belum ada laporan kerusakan.</p>}
        </section>
      </div>
    );
  }

  if (!['WAKA_SARPRAS', 'ADMIN'].includes(user.role)) redirect('/dashboard');
  const reports = await prisma.facilityReport.findMany({
    include: { student: { select: { name: true, studentClass: true } }, updatedBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const openCount = reports.filter((report) => report.status !== 'COMPLETED').length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-amber-700">Wakil Kepala Sekolah</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Laporan Sarana dan Prasarana</h1><p className="mt-1 text-sm text-slate-600">Tinjau dokumentasi siswa dan perbarui tahap penanganan.</p></div><p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">{openCount} laporan perlu tindak lanjut</p></header>
      <div className="space-y-4">
        {reports.length ? reports.map((report) => {
          const currentStep = ['RECEIVED', 'IN_PROGRESS', 'COMPLETED'].indexOf(report.status);
          const allowedStatuses = ['RECEIVED', 'IN_PROGRESS', 'COMPLETED'].slice(currentStep, currentStep + 2);
          return (
          <article key={report.id} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[180px_1fr]">
            <Image src={`/api/facility-reports/${report.id}/photo`} alt={`Foto laporan: ${report.title}`} width={720} height={540} unoptimized className="aspect-[4/3] w-full rounded-md bg-slate-100 object-cover" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-semibold text-slate-900">{report.title}</h2><p className="text-xs text-slate-500">{report.location} · {report.student.name} ({report.student.studentClass ?? 'Kelas tidak diatur'})</p><p className="mt-1 text-xs text-slate-400">Dikirim {report.createdAt.toLocaleString('id-ID')}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{statusLabels[report.status] ?? report.status}</span></div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{report.description}</p>
              <form action={updateFacilityReport} className="mt-4 grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-[1fr_1.3fr_auto]">
                <input type="hidden" name="id" value={report.id} />
                <select name="status" defaultValue={report.status} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
                  {allowedStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                </select>
                <input name="handlingNote" defaultValue={report.handlingNote ?? ''} maxLength={1500} placeholder="Catatan tindak lanjut (opsional)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <button className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white">Simpan status</button>
              </form>
              {report.updatedBy && <p className="mt-2 text-[11px] text-slate-400">Terakhir diperbarui oleh {report.updatedBy.name}</p>}
            </div>
          </article>
        );}) : <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Belum ada laporan dari siswa.</p>}
      </div>
    </div>
  );
}