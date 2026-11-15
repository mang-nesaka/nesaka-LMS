import { describe, expect, it } from 'vitest';
import { getNextClassLevel, suggestPromotionClassroom } from './studentPromotion';

describe('student class promotion', () => {
  it('suggests the matching parallel class at the next level', () => {
    const source = { id: 'x-rpl-1', name: 'X RPL 1', level: '10' };
    const classrooms = [
      { id: 'xi-rpl-1', name: 'XI RPL 1', level: '11' },
      { id: 'xi-rpl-2', name: 'XI RPL 2', level: '11' },
      { id: 'xii-rpl-1', name: 'XII RPL 1', level: '12' },
    ];

    expect(suggestPromotionClassroom(source, classrooms)).toBe('xi-rpl-1');
  });

  it('does not guess when a target is missing or ambiguous', () => {
    const source = { id: 'xi-rpl-1', name: 'XI RPL 1', level: '11' };
    expect(suggestPromotionClassroom(source, [])).toBe('');
    expect(suggestPromotionClassroom(source, [
      { id: 'a', name: 'XII RPL 1', level: '12' },
      { id: 'b', name: 'XII  RPL 1', level: '12' },
    ])).toBe('');
  });

  it('supports only grades ten and eleven as promotion sources', () => {
    expect(getNextClassLevel('10')).toBe('11');
    expect(getNextClassLevel('11')).toBe('12');
    expect(getNextClassLevel('12')).toBeNull();
  });
});