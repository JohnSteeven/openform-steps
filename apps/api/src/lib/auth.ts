import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'openform-steps-dev-secret-key-change-in-prod-2026';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Anonymized SHA-256 IP hash for abuse protection without storing plain IP addresses
export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + '-openform-salt').digest('hex').substring(0, 32);
}

// Generate simple HMAC-signed bearer token for development/stateless operation
export function signToken(payload: TokenPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const claims = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${claims}`)
    .digest('base64url');
  return `${header}.${claims}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, claims, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${claims}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const parsed = JSON.parse(Buffer.from(claims, 'base64url').toString('utf8'));
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      userId: parsed.userId,
      email: parsed.email,
      role: parsed.role || 'user',
    };
  } catch {
    return null;
  }
}
