"use client";

import { useState } from 'react';
import { Download, Eye, Search, X } from 'lucide-react';
import { getExamResultReview } from '@/app/actions/exam';
import RichContent from '@/components/RichContent';

type ReviewDetails = Awaited<ReturnType<typeof getExamResultReview>>;

interface ExamOption {
  id: string;
  title: string;
  course: { title: string };
}

interface ExamResultRow {
  id: string;
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  violationsCount: number;
  submittedAt: Date;
  student: {
    id: string;
    name: string;
    studentClass: string | null;
    nipOrNis: string | null;
  };
  exam: {
    id: string;
    title: string;
    course: { title: string };
  };
}

interface Props {
  exams: ExamOption[];
  results: ExamResultRow[];
}

function escapeCsv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function ExamGradesClient({ exams, results }: Props) {
  const [selectedExamId, setSelectedExamId] = useState('ALL');
  const [search, setSearch] = useState('');
  const [review, setReview] = useState<ReviewDetails | null>(null);
  const [loadingReviewId, setLoadingReviewId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const visibleResults = results.filter((result) => {
    const matchesExam = selectedExamId === 'ALL' || result.exam.id === selectedExamId;
    const searchText = `${result.student.name} ${result.student.studentClass || ''} ${result.exam.title} ${result.exam.course.title}`.toLowerCase();
    return matchesExam && searchText.includes(search.trim().toLowerCase());
  });
  const averageScore = visibleResults.length
    ? visibleResults.reduce((total, result) => total + result.score, 0) / visibleResults.length
    : 0;
  const totalViolations = visibleResults.reduce((total, result) => total + result.violationsCount, 0);

  const handleExport = () => {
    const rows = [
      ['Nama Siswa', 'Kelas', 'Ujian', 'Mata Pelajaran', 'Nilai', 'Benar', 'Jumlah Soal', 'Pelanggaran', 'Waktu Submit'],
      ...visibleResults.map((result) => [
        result.student.name,
        result.student.studentClass || '-',
        result.exam.title,
        result.exam.course.title,
        result.score,
        result.totalCorrect,
        result.totalQuestions,
        result.violationsCount,
        new Date(result.submittedAt).toLocaleString('id-ID'),
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rekap-nilai-ujian-cbt.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReview = async (resultId: string) => {
    setLoadingReviewId(resultId);
    setErrorMessage(null);
    try {
      setReview(await getExamResultReview(resultId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Gagal memuat rincian jawaban.');
    } finally {
      setLoadingReviewId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500">Jumlah pengerjaan</span>
          <strong className="block text-2xl text-slate-900 mt-1">{visibleResults.length}</strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200">
          <span className="text-xs text-emerald-700">Rata-rata nilai</span>
          <strong className="block text-2xl text-emerald-800 mt-1">{averageScore.toFixed(1)}</strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200">
          <span className="text-xs text-amber-700">Total pelanggaran CBT</span>
          <strong className="block text-2xl text-amber-800 mt-1">{totalViolations}</strong>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900">Hasil ujian siswa</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedExamId}
              onChange={(event) => setSelectedExamId(event.target.value)}
              aria-label="Filter ujian"
              className="h-10 min-w-48 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800"
            >
              <option value="ALL">Semua ujian</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.title} · {exam.course.title}</option>
              ))}
            </select>
            <label className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari siswa atau ujian"
                aria-label="Cari siswa atau ujian"
                className="h-10 w-full sm:w-56 rounded-lg border border-slate-300 pl-9 pr-3 text-sm text-slate-800"
              />
            </label>
            <button
              type="button"
              onClick={handleExport}
              disabled={visibleResults.length === 0}
              title="Unduh rekap CSV"
              className="h-10 px-3 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              Unduh CSV
            </button>
          </div>
        </div>

        {errorMessage && (
          <p role="alert" className="px-4 py-3 bg-rose-50 text-rose-700 text-sm border-b border-rose-100">
            {errorMessage}
          </p>
        )}

        {visibleResults.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Siswa</th>
                  <th className="px-4 py-3">Ujian / Mapel</th>
                  <th className="px-4 py-3 text-center">Nilai</th>
                  <th className="px-4 py-3 text-center">Benar</th>
                  <th className="px-4 py-3 text-center">Pelanggaran</th>
                  <th className="px-4 py-3">Waktu submit</th>
                  <th className="px-4 py-3 text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <strong className="block text-slate-900">{result.student.name}</strong>
                      <span className="text-xs text-slate-500">{result.student.studentClass || 'Kelas belum diatur'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <strong className="block text-slate-800">{result.exam.title}</strong>
                      <span className="text-xs text-slate-500">{result.exam.course.title}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${result.score >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {result.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {result.totalCorrect}/{result.totalQuestions}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">{result.violationsCount}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(result.submittedAt).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleReview(result.id)}
                        disabled={loadingReviewId === result.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {loadingReviewId === result.id ? 'Memuat...' : 'Periksa jawaban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="font-semibold text-slate-700">Belum ada hasil ujian untuk filter ini.</p>
            <p className="text-sm text-slate-500 mt-1">Hasil siswa akan muncul setelah ujian CBT dikumpulkan.</p>
          </div>
        )}
      </section>

      {review && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 p-3 sm:p-6 flex items-center justify-center"
          onClick={() => setReview(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="exam-review-title"
            className="bg-white w-full max-w-3xl max-h-[90dvh] rounded-xl shadow-2xl flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <h2 id="exam-review-title" className="font-bold text-lg text-slate-900">Rincian jawaban</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {review.studentName} · {review.studentClass || 'Kelas belum diatur'} · {review.examTitle}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {review.courseTitle} · Nilai {review.score.toFixed(1)} · {review.totalCorrect}/{review.totalQuestions} benar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReview(null)}
                aria-label="Tutup rincian jawaban"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              {review.questions.map((question) => (
                <article key={question.questionNumber} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-slate-900">Soal {question.questionNumber}</h3>
                    <span className={`shrink-0 text-xs font-bold ${question.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {question.isCorrect ? 'Benar' : 'Salah'}
                    </span>
                  </div>
                  <RichContent content={question.questionText} className="text-sm text-slate-800 mb-3" />
                  {question.imageUrl && (
                    <a href={question.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-700 underline">
                      Buka gambar soal
                    </a>
                  )}
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {question.options.map(([letter, text]) => {
                      const isSelected = question.selectedAnswer?.toUpperCase() === letter;
                      const isCorrect = question.correctAnswer.toUpperCase() === letter;
                      return (
                        <li
                          key={letter}
                          className={`rounded-md px-3 py-2 ${isCorrect ? 'bg-emerald-50 text-emerald-900' : isSelected ? 'bg-rose-50 text-rose-900' : 'text-slate-600'}`}
                        >
                          <span className="font-bold">{letter}.</span> {text}
                          {isCorrect && <span className="ml-2 text-xs font-semibold">Kunci jawaban</span>}
                          {isSelected && <span className="ml-2 text-xs font-semibold">Jawaban siswa</span>}
                        </li>
                      );
                    })}
                    {!question.selectedAnswer && (
                      <li className="text-xs text-slate-500 italic">Siswa tidak memilih jawaban.</li>
                    )}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}