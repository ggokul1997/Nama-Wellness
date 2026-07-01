import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleRegister(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.register(req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    const result = await authService.login(req.body, userAgent, ipAddress);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleRefresh(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
export async function handleLogout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await authService.logout(req.body.refreshToken);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
export async function handleVerifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, code } = req.body;
    await authService.verifyEmail(email, code);
    const response: ApiResponseEnvelope<{ message: string }> = {
      data: {
        message: 'Email verified successfully'
      }
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
export async function handlePasswordResetRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    const response: ApiResponseEnvelope<{ message: string }> = {
      data: {
        message: 'Password reset OTP sent successfully'
      }
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
export async function handlePasswordResetComplete(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await authService.completePasswordReset(req.body);
    const response: ApiResponseEnvelope<{ message: string }> = {
      data: {
        message: 'Password reset completed successfully'
      }
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
export async function handleRegisterCorporate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.registerCorporate(req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}
export async function handleSendPhoneOtp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { phone } = req.body;
    const result = await authService.sendPhoneOtp(phone);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleVerifyPhoneOtp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const { phone, otp } = req.body;
    const result = await authService.verifyPhoneOtp(userId, phone, otp);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
