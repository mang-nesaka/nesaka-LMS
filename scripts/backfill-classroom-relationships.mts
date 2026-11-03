import { prisma } from '../src/lib/prisma.ts';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const [classrooms, students, homeroomTeachers, schedules] = await Promise.all([
    prisma.classroom.findMany({
      select: { id: true, name: true, homeroomTeacher: { select: { id: true } } },
    }),
    prisma.user.findMany({
      where: { role: 'STUDENT', classroomId: null },
      select: { id: true, studentClass: true },
    }),
    prisma.user.findMany({
      where: { role: 'WALI_KELAS' },
      select: { id: true, waliKelasOf: true, homeroomClassId: true },
    }),
    prisma.classTeachingSchedule.findMany({
      select: { teacherId: true, classroomId: true },
      distinct: ['teacherId', 'classroomId'],
    }),
  ]);

  const classroomByName = new Map(classrooms.map((classroom) => [classroom.name, classroom.id]));
  const studentsByClass = new Map<string, string[]>();
  let unmatchedStudentCount = 0;
  for (const student of students) {
    const classroomId = student.studentClass ? classroomByName.get(student.studentClass) : undefined;
    if (!classroomId) {
      unmatchedStudentCount += 1;
      continue;
    }
    studentsByClass.set(classroomId, [...(studentsByClass.get(classroomId) ?? []), student.id]);
  }

  const assignedClassIds = new Set(
    homeroomTeachers.flatMap((teacher) => teacher.homeroomClassId ? [teacher.homeroomClassId] : []),
  );
  const homeroomCandidates = new Map<string, string[]>();
  let unmatchedHomeroomCount = 0;
  for (const teacher of homeroomTeachers) {
    if (teacher.homeroomClassId || !teacher.waliKelasOf) continue;
    const classroomId = classroomByName.get(teacher.waliKelasOf);
    if (!classroomId) {
      unmatchedHomeroomCount += 1;
      continue;
    }
    homeroomCandidates.set(classroomId, [...(homeroomCandidates.get(classroomId) ?? []), teacher.id]);
  }

  const homeroomAssignments: Array<{ teacherId: string; classroomId: string }> = [];
  let duplicateHomeroomClassCount = 0;
  for (const [classroomId, teacherIds] of homeroomCandidates) {
    const classroom = classrooms.find((item) => item.id === classroomId);
    if (assignedClassIds.has(classroomId) || classroom?.homeroomTeacher) continue;
    if (teacherIds.length !== 1) {
      duplicateHomeroomClassCount += 1;
      continue;
    }
    homeroomAssignments.push({ teacherId: teacherIds[0], classroomId });
  }

  if (dryRun) {
    console.log(JSON.stringify({
      dryRun: true,
      linkedStudentCount: [...studentsByClass.values()].reduce((total, studentIds) => total + studentIds.length, 0),
      linkedHomeroomCount: homeroomAssignments.length,
      linkedTeacherClassCount: schedules.length,
      unmatchedStudentCount,
      unmatchedHomeroomCount,
      duplicateHomeroomClassCount,
    }, null, 2));
    return;
  }

  const result = await prisma.$transaction(async (transaction) => {
    let linkedStudentCount = 0;
    for (const [classroomId, studentIds] of studentsByClass) {
      const update = await transaction.user.updateMany({
        where: { id: { in: studentIds }, classroomId: null },
        data: { classroomId },
      });
      linkedStudentCount += update.count;
    }

    let linkedHomeroomCount = 0;
    for (const assignment of homeroomAssignments) {
      const update = await transaction.user.updateMany({
        where: { id: assignment.teacherId, role: 'WALI_KELAS', homeroomClassId: null },
        data: { homeroomClassId: assignment.classroomId },
      });
      linkedHomeroomCount += update.count;
    }

    const linkedTeacherClasses = await transaction.teacherClassroom.createMany({
      data: schedules,
      skipDuplicates: true,
    });

    return { linkedStudentCount, linkedHomeroomCount, linkedTeacherClassCount: linkedTeacherClasses.count };
  }, { maxWait: 10000, timeout: 120000 });

  console.log(JSON.stringify({
    ...result,
    unmatchedStudentCount,
    unmatchedHomeroomCount,
    duplicateHomeroomClassCount,
  }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Backfill kelas gagal.');
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());