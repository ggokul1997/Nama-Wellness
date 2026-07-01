import crypto from 'crypto';
import logger from '../infrastructure/logger/logger';

export function generateOTPCode(): string {
  return Math.floor(100000 + crypto.randomInt(900000)).toString();
}

export function hashOTPCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function sendMockOTPEmail(email: string, code: string, purpose: string): Promise<void> {
  logger.info(
    {
      email,
      purpose,
      code,
      subject: `Your OTP Verification Code [${purpose}]`
    },
    'Mock Email Service: OTP Sent'
  );
}
