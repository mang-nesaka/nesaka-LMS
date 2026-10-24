export interface ClassScheduleTimeSlot {
  startTime: string;
  endTime: string;
}

export function findActiveSchedule<T extends ClassScheduleTimeSlot>(
  schedules: T[],
  currentTime: string,
): T | null {
  return schedules.find((schedule) => currentTime >= schedule.startTime && currentTime < schedule.endTime) ?? null;
}

export function findNextSchedule<T extends ClassScheduleTimeSlot>(
  schedules: T[],
  currentTime: string,
): T | null {
  return schedules
    .filter((schedule) => schedule.startTime > currentTime)
    .sort((left, right) => left.startTime.localeCompare(right.startTime))[0] ?? null;
}