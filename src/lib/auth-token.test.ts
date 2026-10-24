import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAuthToken, verifyAuthToken } from './auth-token';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('signed auth tokens', () => {
  it('accepts a valid token and returns its user id', () => {
    vi.stubEnv('AUTH_SECRET', 'test-session-secret');
    const token = createAuthToken('user_123', 1_800_000_000);

    expect(verifyAuthToken(token, 1_800_000_100)).toBe('user_123');
  });

  it('rejects modified, expired, and unsigned tokens', () => {
    vi.stubEnv('AUTH_SECRET', 'test-session-secret');
    const token = createAuthToken('user_123', 1_800_000_000);

    expect(verifyAuthToken(`${token}x`, 1_800_000_100)).toBeNull();
    expect(verifyAuthToken(token, 1_800_000_000 + 60 * 60 * 24 * 7 + 1)).toBeNull();
    expect(verifyAuthToken('user_123', 1_800_000_100)).toBeNull();
  });

  it('rejects tokens issued in the future', () => {
    vi.stubEnv('AUTH_SECRET', 'test-session-secret');
    const token = createAuthToken('user_123', 1_800_000_100);

    expect(verifyAuthToken(token, 1_800_000_000)).toBeNull();
  });
});
