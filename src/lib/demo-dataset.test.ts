import { describe, expect, it } from 'vitest';
import { generateDemoDataset } from './demo-dataset.mjs';

describe('demo school dataset', () => {
  const dataset = generateDemoDataset();

  it('contains the requested account and classroom totals', () => {
    expect(dataset.classrooms).toHaveLength(30);
    expect(dataset.teachers).toHaveLength(50);
    expect(dataset.students).toHaveLength(1080);
    expect(dataset.schedules).toHaveLength(600);
  });

  it('distributes exactly 36 demo students into each class', () => {
    for (const classroom of dataset.classrooms) {
      expect(dataset.students.filter((student) => student.classroomCode === classroom.code)).toHaveLength(36);
    }
  });

  it('does not schedule a teacher or classroom twice in the same slot', () => {
    const slots = new Set<string>();
    for (const schedule of dataset.schedules) {
      const time = `${schedule.dayOfWeek}:${schedule.startTime}`;
      const teacherSlot = `${time}:teacher:${schedule.teacherEmail}`;
      const classroomSlot = `${time}:classroom:${schedule.classroomCode}`;
      expect(slots.has(teacherSlot)).toBe(false);
      expect(slots.has(classroomSlot)).toBe(false);
      slots.add(teacherSlot);
      slots.add(classroomSlot);
    }
  });
});
