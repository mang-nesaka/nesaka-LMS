"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function createActivityReport(data: {
  authorId: string;
  roleSource: string;
  title: string;
  date: string;
  location?: string;
  description: string;
  participants?: string;
  documentationUrl?: string;
}) {
  const { authorId, roleSource, title, date, location, description, participants, documentationUrl } = data;

  const report = await prisma.activityReport.create({
    data: {
      authorId,
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
  const where: any = {};
  if (roleFilter && roleFilter !== 'ALL') {
    where.roleSource = roleFilter;
  }

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
