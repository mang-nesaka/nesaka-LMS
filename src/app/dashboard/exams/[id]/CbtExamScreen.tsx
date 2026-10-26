"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitExamAction } from '@/app/actions/exam';
import RichContent from '@/components/RichContent';
import { 
  ShieldAlert, Clock, AlertTriangle, CheckCircle2, 
  ArrowLeft, ArrowRight, Send, Maximize, AlertCircle
} from 'lucide-react';

const MAX_VIOLATIONS = 2;

interface QuestionItem {
  id: string;
  questionNumber: number;
  questionText: string;
  imageUrl: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string | null;
}

interface SubmittedResult {
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  violationsCount: number;
}

async function requestScreenWakeLock(
  wakeLockRef: { current: { release: () => Promise<void> } | null }
) {
  const wakeLock = (navigator as Navigator & {
    wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
  }).wakeLock;
  if (!wakeLock || wakeLockRef.current) return;

  try {
    wakeLockRef.current = await wakeLock.request('screen');
  } catch {
    // Wake Lock can be unavailable or denied by the browser or operating system.
  }
}

interface Props {
  exam: {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    course: { title: string };
  };
  questions: QuestionItem[];
  studentName: string;
}

export default function CbtExamScreen({ exam, questions, studentName }: Props) {
  const router = useRouter();

  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [violations, setViolations] = useState(0);
  const [warningModal, setWarningModal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<SubmittedResult | null>(null);

  const violationsRef = useRef(0);
  const answersRef = useRef(answers);
  const lastViolationAtRef = useRef(0);
  const deadlineRef = useRef<number | null>(null);
  const submittingRef = useRef(false);
  const triggerSubmitRef = useRef<(auto?: boolean) => void>(() => {});
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Fullscreen and Wake Lock are optional because some mobile browsers do not support them.
  const startExam = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Continue in browsers that reject fullscreen requests.
    }
    await requestScreenWakeLock(wakeLockRef);
    deadlineRef.current = Date.now() + exam.durationMinutes * 60 * 1000;
    setHasStarted(true);
  };

  // 2. Anti-Kecurangan / Anti-Out Listener
  useEffect(() => {
    if (!hasStarted || submittedResult) return;

    const handleViolation = () => {
      const now = Date.now();
      if (now - lastViolationAtRef.current < 1500) return;
      lastViolationAtRef.current = now;

      violationsRef.current += 1;
      const currentCount = violationsRef.current;
      setViolations(currentCount);

      if (currentCount >= MAX_VIOLATIONS) {
        setWarningModal(`Batas pelanggaran maksimal (${MAX_VIOLATIONS}x) telah tercapai. Jawaban ujian otomatis dikumpulkan.`);
        triggerSubmitRef.current(true);
      } else {
        setWarningModal(`Peringatan pelanggaran CBT (${currentCount}/${MAX_VIOLATIONS}): aktivitas meninggalkan layar ujian terdeteksi. Pelanggaran berikutnya akan mengumpulkan jawaban otomatis.`);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation();
      } else {
        requestScreenWakeLock(wakeLockRef);
      }
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !submittedResult) {
        handleViolation();
      }
    };

    const onWindowBlur = () => {
      if (document.visibilityState !== 'hidden' && navigator.maxTouchPoints === 0) {
        handleViolation();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Block browser shortcuts that can be intercepted; OS-level shortcuts remain outside browser control.
      if (
        e.key === 'F12' || 
        e.key === 'F11' || 
        (e.altKey && e.key === 'Tab') || 
        (e.ctrlKey && ['c', 'v', 'u', 'p', 's'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        handleViolation();
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Matikan klik kanan
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', onContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('contextmenu', onContextMenu);
    };
  }, [hasStarted, submittedResult]);

  // Use wall-clock time so backgrounding the browser does not pause the exam timer.
  useEffect(() => {
    if (!hasStarted || submittedResult) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil(((deadlineRef.current ?? Date.now()) - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) triggerSubmitRef.current(true);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, submittedResult]);

  // Submit answers once, including when timeout and a violation happen together.
  const triggerSubmit = async (auto = false) => {
    if (submittingRef.current) return;
    if (!auto && !confirm('Apakah Anda yakin ingin menyelesaikan dan mengirimkan jawaban ujian ini?')) {
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const res = await submitExamAction(exam.id, answersRef.current, violationsRef.current);
      setSubmittedResult(res);

      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengirimkan ujian. Silakan coba kembali.');
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    triggerSubmitRef.current = triggerSubmit;
  });

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // LAYAR 1: Petunjuk Sebelum Mulai
  if (!hasStarted) {
    return (
      <div className="min-h-dvh bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-700 shadow-2xl space-y-5 sm:space-y-6">
          <div className="text-center space-y-2">
            <span className="px-3.5 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
              {exam.course.title}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {exam.title}
            </h1>
            <p className="text-xs leading-relaxed text-slate-400">
              Peserta: <strong className="text-slate-200">{studentName}</strong> | Durasi: <strong className="text-slate-200">{exam.durationMinutes} Menit</strong> | Soal: <strong className="text-slate-200">{questions.length} Butir</strong>
            </p>
          </div>

          <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 text-xs text-amber-300">
            <p className="font-bold flex items-center gap-2 text-sm text-amber-400">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              Aturan Keamanan Ujian:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-amber-200/90 pl-1">
              <li>Mode layar penuh dan pencegah layar tidur digunakan jika didukung browser.</li>
              <li>Jangan berpindah aplikasi/tab, membuka split-screen, atau meninggalkan halaman ujian.</li>
              <li><strong>Dua pelanggaran akan mengumpulkan jawaban secara otomatis.</strong></li>
              <li>Aktifkan Jangan Ganggu dan tutup aplikasi lain sebelum mulai. Browser tidak dapat memblokir screenshot atau tombol sistem ponsel.</li>
            </ul>
          </div>

          <button
            onClick={startExam}
            className="w-full min-h-12 py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Maximize className="w-5 h-5" />
            Saya Mengerti & Mulai Ujian Sekarang
          </button>
        </div>
      </div>
    );
  }

  // LAYAR 2: Hasil Ujian Selesai
  if (submittedResult) {
    return (
      <div className="min-h-dvh bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-700 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Ujian Telah Selesai!</h2>
            <p className="text-xs text-slate-400">Jawaban Anda berhasil disimpan dan dinilai secara otomatis.</p>
          </div>

          <div className="p-5 bg-slate-700/60 rounded-2xl space-y-3">
            <p className="text-xs text-slate-400">Nilai Akhir Anda</p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              {submittedResult.score}
            </p>
            <div className="flex justify-around pt-3 border-t border-slate-600/50 text-xs">
              <div>
                <p className="text-slate-400">Benar</p>
                <p className="font-bold text-emerald-400">{submittedResult.totalCorrect} / {submittedResult.totalQuestions}</p>
              </div>
              <div>
                <p className="text-slate-400">Pelanggaran Layar</p>
                <p className={`font-bold ${submittedResult.violationsCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {submittedResult.violationsCount}x
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard/exams')}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all"
          >
            Kembali ke Dashboard Ujian
          </button>
        </div>
      </div>
    );
  }

  // LAYAR 3: Pengerjaan Soal CBT
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none">
      {/* Warning Modal jika Terdeteksi Keluar */}
      {warningModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border-2 border-red-500/80 rounded-2xl p-5 sm:p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">PERINGATAN SISTEM CBT</h3>
            <p className="text-xs text-red-300 leading-relaxed">{warningModal}</p>
            <button
              onClick={() => {
                setWarningModal(null);
                if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full min-h-11 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm"
            >
              Kembali ke Ujian
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar CBT */}
      <header className="min-h-16 bg-slate-900/95 border-b border-slate-800 px-3 sm:px-8 py-2 flex items-center justify-between gap-2 sticky top-0 z-30 backdrop-blur">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white line-clamp-1">{exam.title}</h2>
          <p className="hidden sm:block text-xs text-slate-400">{exam.course.title} | {studentName}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Status Pelanggaran */}
          {violations > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-[10px] sm:text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{violations}/{MAX_VIOLATIONS}</span>
            </div>
          )}

          {/* Timer Countdown */}
          <div className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl font-mono text-sm font-bold border ${
            timeLeft < 300 
              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 py-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Kolom Soal (Kiri - 3 Grid) */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800 p-4 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-xl text-xs">
                Soal Nomor {currentQuestion.questionNumber}
              </span>
              <span className="text-xs text-slate-400">
                Poin {Math.round(100 / questions.length)}
              </span>
            </div>

            {/* Gambar Soal (Jika Ada) */}
            {currentQuestion.imageUrl && (
              <div className="my-4 sm:my-5 flex justify-center">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Ilustrasi Gambar Soal"
                  className="max-h-[35dvh] max-w-full object-contain rounded-xl border border-slate-700 bg-slate-950 p-2"
                />
              </div>
            )}

            {/* Teks Pertanyaan (Mendukung KaTeX Rumus Matematika & Bahasa Arab) */}
            <div className="my-5 sm:my-6 text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
              <RichContent content={currentQuestion.questionText} />
            </div>

            {/* Pilihan Jawaban A, B, C, D, E */}
            <div className="space-y-3 mt-6">
              {[
                { key: 'A', text: currentQuestion.optionA },
                { key: 'B', text: currentQuestion.optionB },
                { key: 'C', text: currentQuestion.optionC },
                { key: 'D', text: currentQuestion.optionD },
                ...(currentQuestion.optionE ? [{ key: 'E', text: currentQuestion.optionE }] : []),
              ].map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setAnswers((previous) => ({ ...previous, [currentQuestion.id]: opt.key }))}
                    className={`w-full min-h-14 text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-750 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-750 text-slate-400'
                    }`}>
                      {opt.key}
                    </span>
                    <div className="flex-1 pt-0.5 text-sm sm:text-base">
                      <RichContent content={opt.text} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tombol Navigasi Bawah */}
          <div className="sticky bottom-0 z-20 -mx-4 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] mt-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur flex items-center justify-between gap-2 sm:static sm:mx-0 sm:mt-8 sm:px-0 sm:pt-6 sm:pb-0 sm:bg-transparent sm:backdrop-blur-none">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={isFirst}
              className="flex min-h-11 items-center gap-1 px-3 sm:px-4 py-2.5 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-300 font-semibold rounded-xl text-xs sm:text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Sebelumnya
            </button>

            {isLast ? (
              <button
                onClick={() => triggerSubmit(false)}
                disabled={isSubmitting}
                className="flex min-h-11 items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Mengirim...' : 'Selesai & Kumpulkan'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex min-h-11 items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md"
              >
                Selanjutnya
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Kolom Navigasi Nomor Soal (Kanan - 1 Grid) */}
        <div className="hidden lg:flex bg-slate-900 rounded-3xl border border-slate-800 p-6 flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Navigasi Soal
              </h3>
              <span className="text-xs text-indigo-400 font-bold">
                {answeredCount}/{questions.length} Terjawab
              </span>
            </div>

            {/* Grid Tombol Nomor */}
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2.5">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'ring-2 ring-indigo-400 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-600 rounded-sm inline-block" /> Terjawab
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-800 border border-slate-700 rounded-sm inline-block" /> Kosong
              </span>
            </div>
            <button
              onClick={() => triggerSubmit(false)}
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Kumpulkan Ujian Sekarang
            </button>
          </div>
        </div>

        <details className="lg:hidden bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
          <summary className="min-h-12 px-4 py-3 flex items-center justify-between gap-3 cursor-pointer list-none text-sm font-bold text-slate-200">
            <span>Navigasi Soal</span>
            <span className="text-xs text-indigo-400">{answeredCount}/{questions.length} terjawab</span>
          </summary>
          <div className="px-4 pb-4 grid grid-cols-5 sm:grid-cols-7 gap-2">
            {questions.map((question, index) => {
              const isAnswered = !!answers[question.id];
              const isActive = index === currentIndex;
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`h-11 rounded-lg text-xs font-bold transition-colors ${
                    isActive
                      ? 'ring-2 ring-indigo-400 bg-indigo-600 text-white'
                      : isAnswered
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </details>
      </main>
    </div>
  );
}
