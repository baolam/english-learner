import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details })
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  // Handle SyntaxError (JSON parse error)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }

  // Default fallback for uncaught errors
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  return res.status(500).json({ error: message });
};
