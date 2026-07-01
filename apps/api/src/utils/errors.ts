import { ApiErrorDetails } from '@nama/shared';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: ApiErrorDetails[];

  constructor(statusCode: number, code: string, message: string, details: ApiErrorDetails[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code: string = 'BAD_REQUEST') {
    super(400, code, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code: string = 'FORBIDDEN') {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', code: string = 'NOT_FOUND') {
    super(404, code, message);
  }
}

export class ValidationError extends AppError {
  constructor(details: ApiErrorDetails[], message: string = 'Validation Failed') {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error') {
    super(500, 'INTERNAL_SERVER_ERROR', message);
  }
}
