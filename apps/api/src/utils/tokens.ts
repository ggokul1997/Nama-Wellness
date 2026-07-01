import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretnamawellnessdevkey2026!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function generateRefreshTokenValue(): string {
  return crypto.randomUUID();
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
