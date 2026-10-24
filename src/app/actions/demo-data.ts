"use server";

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { importDemoDataset, parseDemoWorkbook } from '@/lib/demo-import';

export async function importDemoSchoolData(formData: FormData) {
  await requireRole('ADMIN', 'TU');
  const file = formData.get('file');
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.xlsx') || file.size === 0) {
    throw new Error('Pilih template Excel demo berformat .xlsx.');
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Ukuran template demo maksimal 2MB.');
  }

  const dataset = await parseDemoWorkbook(await file.arrayBuffer());
  const result = await importDemoDataset(prisma, dataset);
  revalidatePath('/dashboard/students');
  revalidatePath('/dashboard/classrooms');
  revalidatePath('/dashboard/classrooms/schedules');
  revalidatePath('/dashboard/teacher-agenda');

  return result;
}
