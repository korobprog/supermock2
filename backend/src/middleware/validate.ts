import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

// Validation middleware
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔍 [DEBUG VALIDATION] Валидация запроса:', {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params,
      });

      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      console.log('🔍 [DEBUG VALIDATION] Валидация прошла успешно');
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(
          (err: { path: (string | number)[]; message: string }) => ({
            path: err.path.join('.'),
            message: err.message,
          })
        );
        console.error('🔍 [DEBUG VALIDATION] Ошибка валидации:', errors);
        next(new BadRequestError(JSON.stringify(errors)));
      } else {
        console.error(
          '🔍 [DEBUG VALIDATION] Неизвестная ошибка валидации:',
          error
        );
        next(error);
      }
    }
  };
};
