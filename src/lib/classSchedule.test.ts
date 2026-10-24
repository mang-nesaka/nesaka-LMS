import { describe, expect, it } from 'vitest';
import { findActiveSchedule, findNextSchedule } from './classSchedule';

const schedules = [
  { id: 'first', startTime: '07:00', endTime: '08:30' },
  { id: 'second', startTime: '09:00', endTime: '10:30' },
];

describe('class schedule time matching', () => {
  it('matches only the schedule covering the current time', () => {
    expect(findActiveSchedule(schedules, '07:00')?.id).toBe('first');
    expect(findActiveSchedule(schedules, '09:45')?.id).toBe('second');
  });

  it('treats the end time as exclusive', () => {
    expect(findActiveSchedule(schedules, '08:30')).toBeNull();
  });

  it('finds the next scheduled slot without allowing it to be scanned early', () => {
    expect(findNextSchedule(schedules, '08:30')?.id).toBe('second');
    expect(findNextSchedule(schedules, '10:30')).toBeNull();
  });
});