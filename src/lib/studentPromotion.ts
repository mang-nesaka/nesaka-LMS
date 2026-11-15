export interface PromotionClassroom {
  id: string;
  name: string;
  level: string;
}

export function getNextClassLevel(level: string): string | null {
  if (level === '10') return '11';
  if (level === '11') return '12';
  return null;
}

function normalizedClassName(name: string): string {
  return name.replace(/^\s*(?:XII|XI|X)\b\s*/i, '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function suggestPromotionClassroom(
  source: PromotionClassroom,
  classrooms: PromotionClassroom[],
): string {
  const targetLevel = getNextClassLevel(source.level);
  if (!targetLevel) return '';

  const sourceName = normalizedClassName(source.name);
  const matches = classrooms.filter((classroom) =>
    classroom.level === targetLevel && normalizedClassName(classroom.name) === sourceName,
  );
  return matches.length === 1 ? matches[0].id : '';
}