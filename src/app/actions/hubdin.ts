"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

const programTypes = ['PKL', 'KUNJUNGAN_INDUSTRI', 'MOU', 'GURU_TAMU', 'REKRUTMEN'] as const;
const programStatuses = ['PLANNED', 'ONGOING', 'COMPLETED'] as const;

export async function createIndustryPartner(formData: FormData) {
  await requireRole('WAKA_HUBDIN', 'ADMIN');
  const name = String(formData.get('name') ?? '').trim();
  const sector = String(formData.get('sector') ?? '').trim();
  const contactName = String(formData.get('contactName') ?? '').trim();
  const contactEmail = String(formData.get('contactEmail') ?? '').trim();
  const contactPhone = String(formData.get('contactPhone') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  if (!name || name.length > 160) throw new Error('Nama mitra wajib diisi (maksimal 160 karakter).');

  await prisma.industryPartner.create({
    data: {
      name, sector: sector || null, contactName: contactName || null,
      contactEmail: contactEmail || null, contactPhone: contactPhone || null,
      address: address || null,
    },
  });
  revalidatePath('/dashboard/hubdin');
}

export async function createIndustryProgram(formData: FormData) {
  const creator = await requireRole('WAKA_HUBDIN', 'ADMIN');
  const partnerId = String(formData.get('partnerId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const programType = String(formData.get('programType') ?? '');
  const description = String(formData.get('description') ?? '').trim();
  const startValue = String(formData.get('startDate') ?? '');
  const endValue = String(formData.get('endDate') ?? '');
  if (!title || title.length > 160) throw new Error('Nama kegiatan wajib diisi (maksimal 160 karakter).');
  if (!programTypes.includes(programType as (typeof programTypes)[number])) throw new Error('Jenis kegiatan tidak valid.');
  const startDate = startValue ? new Date(`${startValue}T00:00:00`) : null;
  const endDate = endValue ? new Date(`${endValue}T00:00:00`) : null;
  if (startDate && Number.isNaN(startDate.getTime()) || endDate && Number.isNaN(endDate.getTime())) {
    throw new Error('Tanggal kegiatan tidak valid.');
  }
  if (startDate && endDate && endDate < startDate) throw new Error('Tanggal selesai harus setelah tanggal mulai.');

  await prisma.industryProgram.create({
    data: {
      partnerId, createdById: creator.id, title, programType, description: description || null,
      startDate, endDate,
    },
  });
  revalidatePath('/dashboard/hubdin');
}

export async function updateIndustryProgramStatus(formData: FormData) {
  await requireRole('WAKA_HUBDIN', 'ADMIN');
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!programStatuses.includes(status as (typeof programStatuses)[number])) throw new Error('Status program tidak valid.');
  await prisma.industryProgram.update({ where: { id }, data: { status } });
  revalidatePath('/dashboard/hubdin');
}