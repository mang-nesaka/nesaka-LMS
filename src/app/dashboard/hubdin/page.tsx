export const instant = false;

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { createIndustryPartner, createIndustryProgram, updateIndustryProgramStatus } from '@/app/actions/hubdin';

const typeLabels: Record<string, string> = {
  PKL: 'Praktik Kerja Lapangan',
  KUNJUNGAN_INDUSTRI: 'Kunjungan industri',
  MOU: 'Kerja sama / MoU',
  GURU_TAMU: 'Guru tamu industri',
  REKRUTMEN: 'Rekrutmen kerja',
};
const statusLabels: Record<string, string> = { PLANNED: 'Direncanakan', ONGOING: 'Berjalan', COMPLETED: 'Selesai' };

export default async function HubdinPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/login');
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || !['WAKA_HUBDIN', 'ADMIN'].includes(user.role)) redirect('/dashboard');

  const partners = await prisma.industryPartner.findMany({
    include: { programs: { orderBy: { startDate: 'desc' }, include: { createdBy: { select: { name: true } } } } },
    orderBy: { name: 'asc' },
  });
  const totalPrograms = partners.reduce((count, partner) => count + partner.programs.length, 0);
  const ongoingPrograms = partners.flatMap((partner) => partner.programs).filter((program) => program.status === 'ONGOING').length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header><p className="text-xs font-semibold uppercase text-sky-700">Wakil Kepala Sekolah</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Hubungan Dunia Usaha dan Industri</h1><p className="mt-1 text-sm text-slate-600">Kelola mitra, PKL, kunjungan industri, kerja sama, guru tamu, dan peluang rekrutmen.</p></header>

      <section className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Mitra industri</p><p className="mt-1 text-2xl font-bold text-slate-900">{partners.length}</p></div><div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Program berjalan</p><p className="mt-1 text-2xl font-bold text-slate-900">{ongoingPrograms}<span className="ml-2 text-sm font-normal text-slate-500">dari {totalPrograms} program</span></p></div></section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form action={createIndustryPartner} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><h2 className="font-semibold text-slate-900">Tambah mitra industri</h2><p className="text-xs text-slate-500">Kontak ini digunakan untuk koordinasi kerja sama.</p></div>
          <label className="text-xs font-medium text-slate-700">Nama perusahaan / instansi<input name="name" required maxLength={160} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-medium text-slate-700">Bidang industri<input name="sector" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-medium text-slate-700">Nama narahubung<input name="contactName" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-medium text-slate-700">Email narahubung<input type="email" name="contactEmail" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-medium text-slate-700">Nomor telepon<input name="contactPhone" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-medium text-slate-700">Alamat<textarea name="address" rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          <div className="sm:col-span-2"><button className="rounded-md bg-sky-800 px-4 py-2 text-sm font-semibold text-white">Simpan mitra</button></div>
        </form>

        <form action={createIndustryProgram} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><h2 className="font-semibold text-slate-900">Catat program / koordinasi</h2><p className="text-xs text-slate-500">Jadwalkan PKL, kunjungan, MoU, guru tamu, atau rekrutmen.</p></div>
          <label className="text-xs font-medium text-slate-700">Mitra<select name="partnerId" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="">Pilih mitra</option>{partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}</select></label>
          <label className="text-xs font-medium text-slate-700">Jenis program<select name="programType" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="PKL">PKL</option><option value="KUNJUNGAN_INDUSTRI">Kunjungan industri</option><option value="MOU">Kerja sama / MoU</option><option value="GURU_TAMU">Guru tamu</option><option value="REKRUTMEN">Rekrutmen kerja</option></select></label>
          <label className="text-xs font-medium text-slate-700 sm:col-span-2">Nama kegiatan<input name="title" required maxLength={160} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-medium text-slate-700">Tanggal mulai<input name="startDate" type="date" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-medium text-slate-700">Tanggal selesai<input name="endDate" type="date" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-medium text-slate-700 sm:col-span-2">Catatan koordinasi<textarea name="description" rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" /></label>
          <div className="sm:col-span-2"><button disabled={partners.length === 0} className="rounded-md bg-sky-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Simpan program</button>{partners.length === 0 && <p className="mt-1 text-xs text-amber-700">Tambahkan mitra sebelum membuat program.</p>}</div>
        </form>
      </section>

      <section className="space-y-3"><h2 className="font-semibold text-slate-900">Daftar mitra dan program</h2>
        {partners.length ? partners.map((partner) => (
          <article key={partner.id} className="rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-4"><div><h3 className="font-semibold text-slate-900">{partner.name}</h3><p className="text-xs text-slate-500">{partner.sector || 'Bidang belum dicatat'}{partner.contactName ? ` · ${partner.contactName}` : ''}{partner.contactPhone ? ` · ${partner.contactPhone}` : ''}</p>{partner.contactEmail && <p className="text-xs text-sky-800">{partner.contactEmail}</p>}</div><p className="text-xs text-slate-500">{partner.programs.length} program</p></div>
            {partner.programs.length > 0 && <div className="divide-y divide-slate-100">{partner.programs.map((program) => <div key={program.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-slate-900">{program.title}</p><p className="text-xs text-slate-500">{typeLabels[program.programType] ?? program.programType} · {program.startDate?.toLocaleDateString('id-ID') ?? 'Tanggal belum ditentukan'}{program.endDate ? ` - ${program.endDate.toLocaleDateString('id-ID')}` : ''} · {program.createdBy.name}</p></div><form action={updateIndustryProgramStatus} className="flex gap-2"><input type="hidden" name="id" value={program.id} /><select name="status" defaultValue={program.status} className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"><option value="PLANNED">Direncanakan</option><option value="ONGOING">Berjalan</option><option value="COMPLETED">Selesai</option></select><button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Perbarui</button><span className="sr-only">Status saat ini: {statusLabels[program.status] ?? program.status}</span></form></div>)}</div>}
          </article>
        )) : <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">Belum ada mitra industri. Tambahkan mitra untuk mulai mencatat program.</p>}
      </section>
    </div>
  );
}