import { prisma } from '../src/lib/prisma.ts';

const classroomGroups = [
  {
    sourceNames: ['X RPL 1', 'X RPL 2'],
    targetName: 'X TEKNIK KIMIA INDUSTRI',
    targetCode: 'NESAKA-X-TKI',
    level: '10',
  },
  {
    sourceNames: ['XI RPL 1', 'XI RPL 2'],
    targetName: 'XI TEKNIK KIMIA INDUSTRI',
    targetCode: 'NESAKA-XI-TKI',
    level: '11',
  },
  {
    sourceNames: ['XII RPL 1', 'XII RPL 2'],
    targetName: 'XII TEKNIK KIMIA INDUSTRI',
    targetCode: 'NESAKA-XII-TKI',
    level: '12',
  },
];

async function migrateGroup(transaction: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], group: typeof classroomGroups[number]) {
  const classrooms = await transaction.classroom.findMany({
    where: { name: { in: [...group.sourceNames, group.targetName] } },
    select: { id: true, name: true },
  });
  const targetClass = classrooms.find((classroom) => classroom.name === group.targetName);
  const sourceClasses = classrooms.filter((classroom) => group.sourceNames.includes(classroom.name));
  const availableIds = classrooms.map((classroom) => classroom.id);
  const codeOwner = await transaction.classroom.findUnique({
    where: { code: group.targetCode },
    select: { id: true },
  });

  if (codeOwner && !availableIds.includes(codeOwner.id)) {
    throw new Error(`Kode kelas ${group.targetCode} sudah digunakan kelas lain.`);
  }

  const target = targetClass
    ? await transaction.classroom.update({
      where: { id: targetClass.id },
      data: { code: group.targetCode, level: group.level },
      select: { id: true },
    })
    : sourceClasses.length
      ? await transaction.classroom.update({
        where: { id: sourceClasses[0].id },
        data: { name: group.targetName, code: group.targetCode, level: group.level },
        select: { id: true },
      })
      : await transaction.classroom.create({
        data: { name: group.targetName, code: group.targetCode, level: group.level },
        select: { id: true },
      });

  const sourceIds = sourceClasses
    .map((classroom) => classroom.id)
    .filter((classroomId) => classroomId !== target.id);
  const homeroomTeachers = await transaction.user.findMany({
    where: { homeroomClassId: { in: [target.id, ...sourceIds] } },
    select: { id: true, homeroomClassId: true },
  });
  if (homeroomTeachers.length > 1) {
    throw new Error(`Lebih dari satu wali kelas terhubung ke ${group.targetName}; rapikan penugasan wali kelas sebelum migrasi.`);
  }

  let movedStudents = 0;
  let movedSchedules = 0;
  let movedAgendas = 0;
  for (const sourceId of sourceIds) {
    movedStudents += (await transaction.user.updateMany({
      where: { classroomId: sourceId },
      data: { classroomId: target.id, studentClass: group.targetName },
    })).count;

    const teacherAssignments = await transaction.teacherClassroom.findMany({
      where: { classroomId: sourceId },
      select: { teacherId: true, classroomId: true },
    });
    await transaction.teacherClassroom.createMany({
      data: teacherAssignments.map(({ teacherId }) => ({ teacherId, classroomId: target.id })),
      skipDuplicates: true,
    });
    await transaction.teacherClassroom.deleteMany({ where: { classroomId: sourceId } });

    movedSchedules += (await transaction.classTeachingSchedule.updateMany({
      where: { classroomId: sourceId },
      data: { classroomId: target.id },
    })).count;
    movedAgendas += (await transaction.teacherClassAgenda.updateMany({
      where: { classroomId: sourceId },
      data: { classroomId: target.id },
    })).count;
    await transaction.user.updateMany({
      where: { homeroomClassId: sourceId },
      data: { homeroomClassId: target.id },
    });
    await transaction.classroom.delete({ where: { id: sourceId } });
  }

  await transaction.user.updateMany({
    where: { studentClass: { in: group.sourceNames } },
    data: { studentClass: group.targetName },
  });
  await transaction.user.updateMany({
    where: { waliKelasOf: { in: group.sourceNames } },
    data: { waliKelasOf: group.targetName },
  });

  return {
    classroom: group.targetName,
    removedClassrooms: sourceIds.length,
    movedStudents,
    movedSchedules,
    movedAgendas,
  };
}

async function main() {
  if (process.argv.includes('--dry-run')) {
    const results = await Promise.all(classroomGroups.map(async (group) => {
      const classrooms = await prisma.classroom.findMany({
        where: { name: { in: [...group.sourceNames, group.targetName] } },
        select: { id: true, name: true },
      });
      const classroomIds = classrooms.map((classroom) => classroom.id);
      const sourceIds = classrooms
        .filter((classroom) => group.sourceNames.includes(classroom.name))
        .map((classroom) => classroom.id);
      const [linkedStudents, legacyStudents, homeroomTeachers, teacherAssignments, schedules, agendas] = await Promise.all([
        prisma.user.count({ where: { classroomId: { in: sourceIds } } }),
        prisma.user.count({ where: { studentClass: { in: group.sourceNames } } }),
        prisma.user.findMany({
          where: { homeroomClassId: { in: classroomIds } },
          select: { id: true, name: true, homeroomClassId: true },
        }),
        prisma.teacherClassroom.count({ where: { classroomId: { in: sourceIds } } }),
        prisma.classTeachingSchedule.count({ where: { classroomId: { in: sourceIds } } }),
        prisma.teacherClassAgenda.count({ where: { classroomId: { in: sourceIds } } }),
      ]);
      return {
        targetClass: group.targetName,
        existingClasses: classrooms.map((classroom) => classroom.name),
        linkedStudents,
        legacyStudentClassNames: legacyStudents,
        teacherAssignments,
        schedules,
        agendas,
        homeroomTeachers: homeroomTeachers.map((teacher) => teacher.name),
        hasHomeroomConflict: homeroomTeachers.length > 1,
      };
    }));

    console.log(JSON.stringify({ dryRun: true, results }, null, 2));
    return;
  }

  const results = await prisma.$transaction(async (transaction) => {
    const migrationResults = [];
    for (const group of classroomGroups) {
      migrationResults.push(await migrateGroup(transaction, group));
    }
    return migrationResults;
  }, { maxWait: 10000, timeout: 120000 });

  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Migrasi kelas RPL gagal.');
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());