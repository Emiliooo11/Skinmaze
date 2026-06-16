import { createHmac } from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'fallback_secret';

export interface SessionUser {
  id: string;
  steamId: string;
  username: string;
  avatar: string | null;
  email: string | null;
  balance: number;
}

export function signSession(data: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySession(token: string): SessionUser | null {
  try {
    const [payload, sig] = token.split('.');
    const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
    if (sig !== expected) return null;
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
}
