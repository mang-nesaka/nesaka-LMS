"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export async function createExamFromExcel(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    throw new Error('Anda harus login terlebih dahulu.');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (currentUser?.role !== 'TEACHER' && currentUser?.role !== 'ADMIN') {
    throw new Error('Hanya Guru atau Admin yang dapat membuat ujian CBT.');
  }

  const title = (formData.get('title') as string)?.trim();
  const courseId = (formData.get('courseId') as string)?.trim();
  const durationMinutes = parseInt(formData.get('durationMinutes') as string) || 60;
  const description = (formData.get('description') as string)?.trim();
  const file = formData.get('file') as File;

  if (!title || !courseId) {
    throw new Error('Judul ujian dan kelas wajib dipilih.');
  }

  if (!file || file.name === 'undefined') {
    throw new Error('File Excel soal ujian (.xlsx) wajib diunggah.');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error('Sheet pada file Excel tidak ditemukan.');
  }

  const questionsToCreate: Array<{
    questionNumber: number;
    questionText: string;
    imageUrl: string | null;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    optionE: string | null;
    correctAnswer: string;
  }> = [];

  // Baris 1 adalah header, mulai baca dari baris 2
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const getVal = (col: number) => {
        const val = row.getCell(col).value;
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') {
          // Jika cell berisi rich text ExcelJS
          if ('richText' in val && Array.isArray((val as any).richText)) {
            return (val as any).richText.map((t: any) => t.text).join('').trim();
          }
          if ('text' in val) return String((val as any).text).trim();
        }
        return String(val).trim();
      };

      const qText = getVal(2); // Kolom B: Pertanyaan
      const imgUrl = getVal(3); // Kolom C: URL Gambar
      const optA = getVal(4);  // Kolom D: Opsi A
      const optB = getVal(5);  // Kolom E: Opsi B
      const optC = getVal(6);  // Kolom F: Opsi C
      const optD = getVal(7);  // Kolom G: Opsi D
      const optE = getVal(8);  // Kolom H: Opsi E
      const rawKey = getVal(9).toUpperCase(); // Kolom I: Kunci Jawaban

      // Validasi kunci
      const validKey = ['A', 'B', 'C', 'D', 'E'].includes(rawKey) ? rawKey : 'A';

      if (qText && optA && optB) {
        questionsToCreate.push({
          questionNumber: questionsToCreate.length + 1,
          questionText: qText,
          imageUrl: imgUrl || null,
          optionA: optA,
          optionB: optB,
          optionC: optC || '-',
          optionD: optD || '-',
          optionE: optE || null,
          correctAnswer: validKey,
        });
      }
    }
  });

  if (questionsToCreate.length === 0) {
    throw new Error('Tidak ada data soal valid yang ditemukan di file Excel. Pastikan mengisi kolom pertanyaan, pilihan A, dan B.');
  }

  // Buat Ujian beserta seluruh soalnya
  const exam = await prisma.exam.create({
    data: {
      courseId,
      title,
      description: description || `Ujian CBT ${questionsToCreate.length} butir soal`,
      durationMinutes,
      questions: {
        create: questionsToCreate,
      },
    },
  });

  revalidatePath('/dashboard/exams');
  return { success: true, examId: exam.id, count: questionsToCreate.length };
}

export async function deleteExam(formData: FormData) {
  const examId = formData.get('id') as string;
  if (!examId) return;

  await prisma.exam.delete({
    where: { id: examId },
  });

  revalidatePath('/dashboard/exams');
}

export async function submitExamAction(
  examId: string, 
  answers: Record<string, string>, 
  violationsCount: number = 0
) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_token')?.value;

  if (!userId) {
    throw new Error('Sesi login telah habis.');
  }

  // Ambil data soal
  const questions = await prisma.question.findMany({
    where: { examId },
    select: { id: true, correctAnswer: true },
  });

  if (questions.length === 0) {
    throw new Error('Soal ujian tidak ditemukan.');
  }

  let correctCount = 0;
  questions.forEach((q) => {
    const studentAnswer = answers[q.id]?.toUpperCase();
    if (studentAnswer === q.correctAnswer.toUpperCase()) {
      correctCount++;
    }
  });

  const totalQuestions = questions.length;
  const score = Math.round((correctCount / totalQuestions) * 1000) / 10; // Nilai skala 100 dengan 1 desimal

  const result = await prisma.examResult.upsert({
    where: {
      examId_studentId: {
        examId,
        studentId: userId,
      },
    },
    update: {
      score,
      totalCorrect: correctCount,
      totalQuestions,
      answers,
      violationsCount,
      submittedAt: new Date(),
    },
    create: {
      examId,
      studentId: userId,
      score,
      totalCorrect: correctCount,
      totalQuestions,
      answers,
      violationsCount,
    },
  });

  revalidatePath('/dashboard/exams');
  return {
    success: true,
    score: result.score,
    totalCorrect: result.totalCorrect,
    totalQuestions: result.totalQuestions,
    violationsCount: result.violationsCount,
  };
}
