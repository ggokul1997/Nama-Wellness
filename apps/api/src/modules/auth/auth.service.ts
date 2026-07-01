import * as bcrypt from 'bcryptjs';
import { authRepository } from './auth.repository';
import { RegisterInput, LoginInput, LoginResponseDto, PasswordResetCompleteInput, RegisterCorporateInput } from '@nama/shared';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';
import { generateAccessToken, generateRefreshTokenValue, hashRefreshToken } from '../../utils/tokens';
import { generateOTPCode, hashOTPCode, sendMockOTPEmail } from '../../utils/otp';
import logger from '../../infrastructure/logger/logger';
import redisClient from '../../infrastructure/redis/redis.client';

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new BadRequestError('User with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await authRepository.createUser(input, passwordHash);

    // Send email verification OTP immediately upon registration
    await this.sendEmailVerificationOTP(user.email);

    return {
      userId: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      message: 'Registration successful. Verification email sent.'
    };
  }

  async login(input: LoginInput, userAgent?: string, ipAddress?: string): Promise<LoginResponseDto> {
    const user = await authRepository.findUserWithRelations(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const userRoles = user.roles.map((r) => r.role);
    if (!userRoles.includes(input.role as any)) {
      throw new UnauthorizedError('Invalid role scope context');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      roles: userRoles
    });

    const rawRefreshToken = generateRefreshTokenValue();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    await authRepository.saveRefreshToken(user.id, tokenHash, expiresAt, userAgent, ipAddress);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        roles: userRoles,
        profile: {
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          avatarUrl: user.profile?.avatarUrl
        }
      }
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const tokenHash = hashRefreshToken(refreshToken);
    const tokenRecord = await authRepository.findRefreshToken(tokenHash);

    if (!tokenRecord) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (tokenRecord.revokedAt) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    const userRoles = tokenRecord.user.roles.map((r) => r.role);
    const accessToken = generateAccessToken({
      userId: tokenRecord.user.id,
      email: tokenRecord.user.email,
      roles: userRoles
    });

    return {
      accessToken,
      expiresIn: 3600
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);
    await authRepository.revokeRefreshToken(tokenHash);
  }

  async sendEmailVerificationOTP(email: string): Promise<void> {
    const code = generateOTPCode();
    const codeHash = hashOTPCode(code);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes lifetime

    await authRepository.saveOTPVerification(email, codeHash, 'email_verify', expiresAt);
    await sendMockOTPEmail(email, code, 'Email Verification');
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    const activeOtp = await authRepository.findActiveOTP(email, 'email_verify');
    if (!activeOtp) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    if (activeOtp.attemptCount >= 5) {
      throw new BadRequestError('Maximum verification attempts exceeded');
    }

    await authRepository.incrementOTPAttempts(activeOtp.id);

    const checkHash = hashOTPCode(code);
    if (activeOtp.codeHash !== checkHash) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    // Mark OTP consumed and verify user email
    await authRepository.consumeOTP(activeOtp.id);
    await authRepository.verifyUserEmail(email);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Prevent user enumeration attacks by returning silently
      logger.info({ email }, 'Password reset requested for non-existent email');
      return;
    }

    const code = generateOTPCode();
    const codeHash = hashOTPCode(code);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes lifetime

    await authRepository.saveOTPVerification(email, codeHash, 'password_reset', expiresAt);
    await sendMockOTPEmail(email, code, 'Password Reset');
  }

  async completePasswordReset(input: PasswordResetCompleteInput): Promise<void> {
    const activeOtp = await authRepository.findActiveOTP(input.email, 'password_reset');
    if (!activeOtp) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    if (activeOtp.attemptCount >= 5) {
      throw new BadRequestError('Maximum verification attempts exceeded');
    }

    await authRepository.incrementOTPAttempts(activeOtp.id);

    const checkHash = hashOTPCode(input.code);
    if (activeOtp.codeHash !== checkHash) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    // Hash new password and update user record
    const newPasswordHash = await bcrypt.hash(input.newPassword, 10);
    await authRepository.updateUserPassword(input.email, newPasswordHash);

    // Consume the OTP
    await authRepository.consumeOTP(activeOtp.id);
  }

  async registerCorporate(input: RegisterCorporateInput) {
    const company = await authRepository.findCompanyByCode(input.companyCode);
    if (!company) {
      throw new BadRequestError('Invalid company registration code');
    }

    const existingUser = await authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new BadRequestError('User with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await authRepository.createCorporateUser(input, passwordHash, company.id);

    // Send email verification OTP immediately upon registration
    await this.sendEmailVerificationOTP(user.email);

    return {
      userId: user.id,
      companyId: company.id,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified
    };
  }

  async sendPhoneOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `otp:phone:${phone}:verify`;
    
    // Store in Redis with 5 minute TTL (300 seconds)
    await redisClient.set(redisKey, otp, 'EX', 300);
    
    logger.info({ phone, otp }, `[MOCK SMS] Verification code for ${phone}: ${otp}`);
    return { message: 'OTP sent', expiresIn: 300 };
  }

  async verifyPhoneOtp(userId: string, phone: string, otp: string) {
    const redisKey = `otp:phone:${phone}:verify`;
    const storedOtp = await redisClient.get(redisKey);
    
    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestError('Invalid or expired OTP');
    }
    
    await redisClient.del(redisKey);
    await authRepository.updateUserPhone(userId, phone);
    return { phoneVerified: true };
  }
}

export const authService = new AuthService();
