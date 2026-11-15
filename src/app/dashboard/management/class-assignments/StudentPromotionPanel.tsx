"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Loader2, MoveUpRight } from 'lucide-react';
import { promoteStudentsInBulk } from '@/app/actions/management';
import { getNextClassLevel, suggestPromotionClassroom } from '@/lib/studentPromotion';

interface ClassroomOption {
  id: string;
  name: string;
  level: string;
  studentCount: number;
  students: Array<{ id: string; name: string; email: string }>;
}

type GradeMode = '10' | '11' | '12';

export default function StudentPromotionPanel({
  classrooms,
  alumniCount,
}: {
  classrooms: ClassroomOption[];
  alumniCount: number;
}) {
  const router = useRouter();
  const [gradeMode, setGradeMode] = useState<GradeMode>('12');
  const [graduationYear, setGraduationYear] = useState(String(new Date().getFullYear()));
  const [manualTargets, setManualTargets] = useState<Record<string, string>>({});
  const [excludedStudentIds, setExcludedStudentIds] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isGraduation = gradeMode === '12';
  const nextLevel = getNextClassLevel(gradeMode);
  const sourceClassrooms = classrooms
    .filter((classroom) => classroom.level === gradeMode && classroom.studentCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  const targetClassrooms = classrooms.filter((classroom) => classroom.level === nextLevel);
  const availableTargetClassrooms = targetClassrooms.filter((classroom) => classroom.studentCount === 0);
  const mappings = sourceClassrooms.map((source) => ({
    sourceId: source.id,
    targetId: manualTargets[source.id] ?? suggestPromotionClassroom(source, availableTargetClassrooms),
  }));
  const mappedTargets = mappings.map((mapping) => mapping.targetId).filter(Boolean);
  const excludedCount = sourceClassrooms.reduce(
    (total, classroom) => total + classroom.students.filter((student) => excludedStudentIds.includes(student.id)).length,
    0,
  );
  const sourceStudentCount = sourceClassrooms.reduce((total, classroom) => total + classroom.studentCount, 0);
  const includedStudentCount = sourceStudentCount - excludedCount;
  const canPromote = includedStudentCount > 0
    && mappings.every((mapping) => mapping.targetId)
    && new Set(mappedTargets).size === mappedTargets.length;
  const yearValue = Number(graduationYear);
  const canGraduate = includedStudentCount > 0 && Number.isInteger(yearValue) && yearValue >= 2000 && yearValue <= 2100;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isGraduation && !canGraduate) return;
    if (!isGraduation && !canPromote) return;

    const confirmation = isGraduation
      ? `Tandai ${includedStudentCount} siswa kelas XII sebagai Alumni tahun ${yearValue}?`
      : `Pindahkan ${includedStudentCount} siswa ke kelas berikutnya sesuai pemetaan di atas?`;
    if (!window.confirm(confirmation)) return;

    const formData = new FormData();
    formData.set('mode', isGraduation ? 'graduate' : 'promote');
    formData.set('excludedStudentIds', JSON.stringify(excludedStudentIds));
    if (isGraduation) {
      formData.set('graduationYear', String(yearValue));
    } else {
      formData.set('sourceLevel', gradeMode);
      formData.set('mappings', JSON.stringify(mappings));
    }

    setIsPending(true);
    setNotice(null);
    try {
      const result = await promoteStudentsInBulk(formData);
      setNotice({
        type: 'success',
        text: isGraduation
          ? `${result.changedCount} siswa ditandai sebagai Alumni ${yearValue}.`
          : `${result.changedCount} siswa berhasil dinaikkan kelas.`,
      });
      setManualTargets({});
      setExcludedStudentIds([]);
      router.refresh();
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Proses kenaikan kelas gagal.' });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="space-y-4 border-y border-slate-200 py-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">Tahun ajaran baru</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Kenaikan kelas massal</h2>
        </div>
        <p className="text-sm text-slate-600">{alumniCount} alumni tersimpan</p>
      </div>

      {notice && (
        <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {notice.text}
        </p>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih proses kenaikan kelas">
        {([
          { level: '12', label: 'XII ke Alumni' },
          { level: '11', label: 'XI ke XII' },
          { level: '10', label: 'X ke XI' },
        ] as const).map((option) => (
          <button
            key={option.level}
            type="button"
            aria-pressed={gradeMode === option.level}
            onClick={() => { setGradeMode(option.level); setExcludedStudentIds([]); setNotice(null); }}
            className={`min-h-10 rounded-md border px-3 text-sm font-semibold ${gradeMode === option.level ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {sourceClassrooms.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">Pilih siswa yang dikecualikan</p>
            <p className="text-sm text-slate-600">{includedStudentCount} siswa ikut proses</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {sourceClassrooms.map((classroom) => {
              const classroomExcludedCount = classroom.students.filter((student) => excludedStudentIds.includes(student.id)).length;
              return (
                <details key={classroom.id} className="rounded-md border border-slate-200 bg-white">
                  <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-800">
                    {classroom.name} · {classroom.studentCount} siswa{classroomExcludedCount ? ` · ${classroomExcludedCount} dikecualikan` : ''}
                  </summary>
                  <div className="max-h-56 space-y-1 overflow-y-auto border-t border-slate-200 p-2">
                    {classroom.students.map((student) => (
                      <label key={student.id} className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={excludedStudentIds.includes(student.id)}
                          onChange={(event) => setExcludedStudentIds((current) => event.target.checked
                            ? [...current, student.id]
                            : current.filter((studentId) => studentId !== student.id))}
                          disabled={isPending}
                          className="mt-0.5 accent-teal-700"
                        />
                        <span className="min-w-0 text-sm text-slate-800">
                          <span className="block">{student.name}</span>
                          <span className="block truncate text-xs text-slate-500">{student.email}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}
      {sourceClassrooms.length === 0 && (
        <p className="text-sm text-slate-600">
          {isGraduation ? 'Tidak ada siswa aktif kelas XII untuk diproses.' : 'Tidak ada siswa aktif pada tingkat kelas ini.'}
        </p>
      )}

      {isGraduation ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block w-full max-w-xs">
            <span className="mb-1 block text-sm font-medium text-slate-700">Tahun kelulusan</span>
            <input
              type="number"
              min="2000"
              max="2100"
              step="1"
              required
              value={graduationYear}
              onChange={(event) => setGraduationYear(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            />
          </label>
          <button
            type="submit"
            disabled={!canGraduate || isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
            Tandai {includedStudentCount} siswa sebagai Alumni
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {sourceClassrooms.length ? (
            <div className="overflow-x-auto border-y border-slate-200">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                  <tr><th className="px-3 py-2">Kelas saat ini</th><th className="px-3 py-2">Siswa</th><th className="px-3 py-2">Kelas tujuan</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sourceClassrooms.map((source) => {
                    const targetId = manualTargets[source.id] ?? suggestPromotionClassroom(source, targetClassrooms);
                    return (
                      <tr key={source.id}>
                        <td className="px-3 py-2 font-medium text-slate-900">{source.name}</td>
                        <td className="px-3 py-2 text-slate-600">{source.studentCount}</td>
                        <td className="px-3 py-2">
                          <select
                            value={targetId}
                            onChange={(event) => setManualTargets((current) => ({ ...current, [source.id]: event.target.value }))}
                            disabled={isPending}
                            aria-label={`Kelas tujuan untuk ${source.name}`}
                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900"
                          >
                            <option value="">Pilih kelas tujuan</option>
                            {targetClassrooms.map((target) => (
                              <option key={target.id} value={target.id} disabled={target.studentCount > 0}>
                                {target.name}{target.studentCount > 0 ? ` · ${target.studentCount} siswa` : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-3 text-sm text-slate-600">Tidak ada siswa aktif pada tingkat kelas ini.</p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">Kelas tujuan harus kosong; proses dari tingkat tertinggi lebih dulu.</p>
            <button
              type="submit"
              disabled={!canPromote || isPending}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoveUpRight className="h-4 w-4" />}
              Naikkan {includedStudentCount} siswa
            </button>
          </div>
        </form>
      )}
    </section>
  );
}