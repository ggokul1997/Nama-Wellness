import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = source === 'query' ? req.query : req.body;
      const parsed = schema.parse(data);
      if (source === 'query') {
        req.query = parsed;
      } else {
        req.body = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: String(e.path.join('.')),
          message: e.message
        }));
        next(new ValidationError(details));
      } else {
        next(err);
      }
    }
  };
}
