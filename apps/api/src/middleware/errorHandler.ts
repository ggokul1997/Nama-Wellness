import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponseEnvelope } from '@nama/shared';
import { AppError } from '../utils/errors';
import logger from '../infrastructure/logger/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal Server Error';
  let details: any[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Use pino request logger if available, else fallback
  const log = req.log || logger;
  log.error({ err }, `Request failed: ${message}`);

  const responseEnvelope: ApiErrorResponseEnvelope = {
    error: {
      code,
      message,
      details: details.length > 0 ? details : undefined
    }
  };

  res.status(statusCode).json(responseEnvelope);
}
