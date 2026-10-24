const grades = [
  { label: 'X', level: '10' },
  { label: 'XI', level: '11' },
  { label: 'XII', level: '12' },
];

const programs = [
  { name: 'TEKNIK OTOMOTIF', code: 'TO', sections: 3 },
  { name: 'TEKNIK JARINGAN KOMPUTER DAN TELEKOMUNIKASI', code: 'TJKT', sections: 4 },
  { name: 'TEKNIKA KAPAL PENANGKAPAN IKAN', code: 'TKPI', sections: 1 },
  { name: 'BROADCASTING DAN PERFILMAN', code: 'BP', sections: 2 },
];

const lessonSlots = [
  { startTime: '07:00', endTime: '08:30' },
  { startTime: '08:45', endTime: '10:15' },
  { startTime: '10:30', endTime: '12:00' },
  { startTime: '13:00', endTime: '14:30' },
];

export function generateDemoDataset() {
  const classrooms = [];
  for (const grade of grades) {
    for (const program of programs) {
      for (let section = 1; section <= program.sections; section += 1) {
        const name = `${grade.label} ${program.name}${program.sections > 1 ? ` ${section}` : ''}`;
        classrooms.push({
          name,
          code: `DEMO-${grade.label}-${program.code}-${section}`,
          level: grade.level,
          program: program.name,
        });
      }
    }
  }

  const teachers = Array.from({ length: 50 }, (_, index) => {
    const number = String(index + 1).padStart(2, '0');
    return {
      name: `Guru Demo ${number}`,
      email: `demo.guru${number}@nesaka.demo`,
      role: 'TEACHER',
    };
  });

  const students = [];
  classrooms.forEach((classroom, classIndex) => {
    for (let index = 0; index < 36; index += 1) {
      const number = String(students.length + 1).padStart(4, '0');
      students.push({
        name: `Siswa Demo ${number}`,
        email: `demo.siswa${number}@nesaka.demo`,
        studentClass: classroom.name,
        nipOrNis: `DEMO${number}`,
        classroomCode: classroom.code,
        classIndex,
      });
    }
  });

  const schedules = [];
  for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek += 1) {
    classrooms.forEach((classroom, classIndex) => {
      lessonSlots.forEach((slot, slotIndex) => {
        const teacherIndex = (classIndex + slotIndex * 11 + dayOfWeek * 7) % teachers.length;
        schedules.push({
          teacherEmail: teachers[teacherIndex].email,
          classroomCode: classroom.code,
          subject: classroom.program,
          dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      });
    });
  }

  return { classrooms, teachers, students, schedules };
}
