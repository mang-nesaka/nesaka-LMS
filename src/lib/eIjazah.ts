export function isGradeTwelve(studentClass?: string | null, classroomLevel?: string | null, classroomName?: string | null) {
  if (classroomLevel?.trim() === '12') return true;

  return [studentClass, classroomName].some((className) =>
    /^(?:KELAS\s*)?(?:XII|12)(?=$|[\s-])/i.test(className?.trim() ?? ''),
  );
}