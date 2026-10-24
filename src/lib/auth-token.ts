import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSigningSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.DATABASE_URL;
  if (!secret) {
    throw new Error('AUTH_SECRET or DATABASE_URL must be configured to sign sessions.');
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSigningSecret()).update(payload).digest('base64url');
}

export function createAuthToken(userId: string, issuedAt: number): string {
  const payload = `${userId}.${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAuthToken(token: string, now: number): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [userId, issuedAtText, signature] = parts;
  const issuedAt = Number(issuedAtText);
  if (!userId || !Number.isInteger(issuedAt) || issuedAt > now || now - issuedAt > TOKEN_MAX_AGE_SECONDS) {
    return null;
  }

  const payload = `${userId}.${issuedAtText}`;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  return userId;
}
