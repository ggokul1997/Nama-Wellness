import { Router } from 'express';
import { handleRegister, handleLogin, handleRefresh, handleLogout, handleVerifyEmail, handlePasswordResetRequest, handlePasswordResetComplete, handleRegisterCorporate, handleSendPhoneOtp, handleVerifyPhoneOtp } from './auth.controller';
import { registerSchema, loginSchema, refreshSchema, verifyEmailSchema, passwordResetRequestSchema, passwordResetCompleteSchema, registerCorporateSchema, sendPhoneOtpSchema, confirmPhoneOtpSchema } from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', validate(registerSchema), handleRegister);
router.post('/login', validate(loginSchema), handleLogin);
router.post('/refresh', validate(refreshSchema), handleRefresh);
router.post('/logout', authenticate, validate(refreshSchema), handleLogout);
router.post('/verify-email', validate(verifyEmailSchema), handleVerifyEmail);
router.post('/password-reset/request', validate(passwordResetRequestSchema), handlePasswordResetRequest);
router.post('/password-reset/complete', validate(passwordResetCompleteSchema), handlePasswordResetComplete);
router.post('/register/corporate', validate(registerCorporateSchema), handleRegisterCorporate);
router.post('/verify-phone/send', authenticate, validate(sendPhoneOtpSchema), handleSendPhoneOtp);
router.post('/verify-phone/confirm', authenticate, validate(confirmPhoneOtpSchema), handleVerifyPhoneOtp);

export default router;
