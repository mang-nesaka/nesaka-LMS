import { describe, expect, it } from 'vitest';
import { isGradeTwelve } from './eIjazah';

describe('isGradeTwelve', () => {
  it('accepts a grade 12 classroom level', () => {
    expect(isGradeTwelve(null, '12', 'RPL 1')).toBe(true);
  });

  it('accepts common class name formats', () => {
    expect(isGradeTwelve('Kelas XII - TKRO 1')).toBe(true);
    expect(isGradeTwelve(null, null, '12 RPL 1')).toBe(true);
  });

  it('rejects other grades and numbers embedded in class names', () => {
    expect(isGradeTwelve('XI RPL 1', '11', 'XI RPL 1')).toBe(false);
    expect(isGradeTwelve('X RPL 12', '10', 'X RPL 12')).toBe(false);
  });
});