"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';


export async function createActivityReport(data: {
  roleSource: string;
  title: string;
  date: string;
  location?: string;
  description: string;
  participants?: string;
  documentationUrl?: string;
}) {
  const author = await requireRole('ADMIN', 'KEPSEK', 'WAKA_KURIKULUM', 'WAKA_KESISWAAN', 'WAKA_SARPRAS', 'WAKA_HUBDIN');
  const { title, date, location, description, participants, documentationUrl } = data;
  const wakaRoles = ['WAKA_KURIKULUM', 'WAKA_KESISWAAN', 'WAKA_SARPRAS', 'WAKA_HUBDIN'];
  const roleSource = author.role.startsWith('WAKA_')
    ? author.role
    : wakaRoles.includes(data.roleSource)
      ? data.roleSource
      : author.role;

  const report = await prisma.activityReport.create({
    data: {
      authorId: author.id,
      roleSource,
      title,
      date: new Date(date),
      location,
      description,
      participants,
      documentationUrl,
      status: 'COMPLETED',
    },
  });

  revalidatePath('/dashboard/berita-acara');
  return { success: true, message: 'Berita Acara Kegiatan berhasil disimpan.', report };
}

export async function getActivityReports(roleFilter?: string) {
  await requireRole('ADMIN', 'KEPSEK', 'WAKA_KURIKULUM', 'WAKA_KESISWAAN', 'WAKA_SARPRAS', 'WAKA_HUBDIN');
  const where = roleFilter && roleFilter !== 'ALL' ? { roleSource: roleFilter } : {};

  return await prisma.activityReport.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
