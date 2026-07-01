import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

const JWT_SECRET = (process.env.JWT_SECRET || 'supersecretnamawellnessdevkey2026!') as string;

interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed authorization header'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new UnauthorizedError('Missing or malformed authorization header'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as JWTPayload;
    req.user = decoded;
    next();
  } catch (err) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as JWTPayload;
    req.user = decoded;
    next();
  } catch (err) {
    next();
  }
}
