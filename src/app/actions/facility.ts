"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];
const reportStatuses = ['RECEIVED', 'IN_PROGRESS', 'COMPLETED'] as const;

function hasValidImageSignature(bytes: Uint8Array, type: string) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
  return type === 'image/webp'
    && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
}

export async function createFacilityReport(formData: FormData) {
  const student = await requireRole('STUDENT');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const file = formData.get('photo');

  if (!title || title.length > 120 || !description || !location || location.length > 180) {
    throw new Error('Judul, lokasi, dan deskripsi laporan wajib diisi.');
  }
  if (!(file instanceof File) || file.size === 0) throw new Error('Foto kerusakan wajib dilampirkan.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran foto maksimal 5 MB.');
  if (!allowedPhotoTypes.includes(file.type)) throw new Error('Foto harus berformat JPG, PNG, atau WEBP.');

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidImageSignature(bytes, file.type)) throw new Error('Isi file tidak sesuai dengan format gambar.');
  const photoData = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;

  await prisma.facilityReport.create({
    data: { studentId: student.id, title, description, location, photoData, photoType: file.type },
  });
  revalidatePath('/dashboard/sarpras');
  revalidatePath('/dashboard/sarpras/report');
}

export async function updateFacilityReport(formData: FormData) {
  const updater = await requireRole('WAKA_SARPRAS', 'ADMIN');
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  const handlingNote = String(formData.get('handlingNote') ?? '').trim();
  if (!reportStatuses.includes(status as (typeof reportStatuses)[number])) {
    throw new Error('Status laporan tidak valid.');
  }

  const existingReport = await prisma.facilityReport.findUnique({ where: { id }, select: { status: true } });
  if (!existingReport) throw new Error('Laporan kerusakan tidak ditemukan.');
  const currentStep = reportStatuses.indexOf(existingReport.status as (typeof reportStatuses)[number]);
  const requestedStep = reportStatuses.indexOf(status as (typeof reportStatuses)[number]);
  if (requestedStep < currentStep || requestedStep > currentStep + 1) {
    throw new Error('Status laporan harus diproses berurutan.');
  }

  await prisma.facilityReport.update({
    where: { id },
    data: { status, handlingNote: handlingNote || null, updatedById: updater.id },
  });
  revalidatePath('/dashboard/sarpras');
  revalidatePath('/dashboard/sarpras/report');
  revalidatePath('/dashboard');
}