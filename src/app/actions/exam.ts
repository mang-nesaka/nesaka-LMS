"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import ExcelJS from 'exceljs';


export async function createExamFromExcel(formData: FormData) {
  const currentUser = await requireRole('TEACHER', 'ADMIN');

  const title = (formData.get('title') as string)?.trim();
  const courseId = (formData.get('courseId') as string)?.trim();
  const requestedDuration = Number.parseInt(formData.get('durationMinutes') as string, 10);
  const durationMinutes = Number.isInteger(requestedDuration) && requestedDuration >= 5 && requestedDuration <= 360
    ? requestedDuration
    : 60;
  const description = (formData.get('description') as string)?.trim();
  const file = formData.get('file') as File;

  if (!title || !courseId) {
    throw new Error('Judul ujian dan kelas wajib dipilih.');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { teacherId: true },
  });
  if (!course) throw new Error('Kelas tidak ditemukan.');
  if (currentUser.role !== 'ADMIN' && course.teacherId !== currentUser.id) {
    throw new Error('Anda hanya dapat membuat ujian di kelas yang Anda kelola.');
  }

  if (!file || file.name === 'undefined') {
    throw new Error('File Excel soal ujian (.xlsx) wajib diunggah.');
  }
  if (file.size === 0 || file.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran file Excel harus lebih dari 0 dan maksimal 5MB.');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const workbook = new ExcelJS.Workbook();
  const excelBuffer = buffer as unknown as Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(excelBuffer);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error('Sheet pada file Excel tidak ditemukan.');
  }
  if (worksheet.rowCount > 501) {
    throw new Error('File Excel maksimal berisi 500 baris soal.');
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
          const textValue = val as { richText?: unknown; text?: unknown };
          // Jika cell berisi rich text ExcelJS
          if (Array.isArray(textValue.richText)) {
            return textValue.richText
              .map((part: { text?: string }) => part.text || '')
              .join('')
              .trim();
          }
          if (textValue.text !== undefined) return String(textValue.text).trim();
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
      if (qText && optA && optB && !['A', 'B', 'C', 'D', 'E'].includes(rawKey)) {
        throw new Error(`Kunci jawaban pada baris ${rowNumber} harus A, B, C, D, atau E.`);
      }
      const validKey = rawKey;

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
  const currentUser = await requireRole('TEACHER', 'ADMIN');
  const examId = formData.get('id') as string;
  if (!examId) throw new Error('ID ujian tidak valid.');

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { course: { select: { teacherId: true } } },
  });
  if (!exam) throw new Error('Ujian tidak ditemukan.');
  if (currentUser.role !== 'ADMIN' && exam.course.teacherId !== currentUser.id) {
    throw new Error('Anda hanya dapat menghapus ujian di kelas yang Anda kelola.');
  }

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
  const { id: userId } = await requireRole('STUDENT');
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    throw new Error('Jawaban ujian tidak valid.');
  }

  if (!Number.isInteger(violationsCount) || violationsCount < 0) {
    throw new Error('Jumlah pelanggaran tidak valid.');
  }

  const existingResult = await prisma.examResult.findUnique({
    where: { examId_studentId: { examId, studentId: userId } },
    select: { id: true },
  });
  if (existingResult) throw new Error('Ujian ini sudah pernah dikumpulkan.');

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: {
      course: {
        select: {
          enrollments: {
            where: { studentId: userId },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });
  if (!exam?.course.enrollments.length) {
    throw new Error('Anda tidak terdaftar pada kelas ujian ini.');
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
  const normalizedAnswers: Record<string, string> = {};
  questions.forEach((q) => {
    const rawAnswer = answers[q.id];
    const studentAnswer = typeof rawAnswer === 'string' && /^[A-E]$/i.test(rawAnswer)
      ? rawAnswer.toUpperCase()
      : '';
    if (studentAnswer) normalizedAnswers[q.id] = studentAnswer;
    if (studentAnswer === q.correctAnswer.toUpperCase()) {
      correctCount++;
    }
  });

  const totalQuestions = questions.length;
  const score = Math.round((correctCount / totalQuestions) * 1000) / 10; // Nilai skala 100 dengan 1 desimal

  const result = await prisma.examResult.create({
    data: {
      examId,
      studentId: userId,
      score,
      totalCorrect: correctCount,
      totalQuestions,
      answers: normalizedAnswers,
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
