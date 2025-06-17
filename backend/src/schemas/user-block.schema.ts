import { z } from 'zod';

// Схема для блокировки пользователя
export const blockUserSchema = z.object({
  body: z
    .object({
      userId: z.string().uuid('ID пользователя должен быть валидным UUID'),
      reason: z
        .string()
        .min(1, 'Причина блокировки обязательна')
        .max(500, 'Причина блокировки не может быть длиннее 500 символов'),
      isPermanent: z.boolean().optional().default(false),
      endDate: z
        .string()
        .datetime('Дата окончания должна быть в формате ISO')
        .optional(),
    })
    .refine(
      (data) => {
        // Если блокировка не постоянная, должна быть указана дата окончания
        if (!data.isPermanent && !data.endDate) {
          return false;
        }
        // Если блокировка постоянная, дата окончания не должна быть указана
        if (data.isPermanent && data.endDate) {
          return false;
        }
        // Если указана дата окончания, она должна быть в будущем
        if (data.endDate && new Date(data.endDate) <= new Date()) {
          return false;
        }
        return true;
      },
      {
        message:
          'Для временной блокировки необходимо указать дату окончания в будущем, для постоянной - не указывать',
      }
    ),
});

// Схема для разблокировки пользователя
export const unblockUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID блокировки должен быть валидным UUID'),
  }),
});

// Схема для получения блокировок пользователя
export const getUserBlocksSchema = z.object({
  params: z.object({
    userId: z.string().uuid('ID пользователя должен быть валидным UUID'),
  }),
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Номер страницы должен быть числом')
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/, 'Лимит должен быть числом')
      .optional()
      .default('20'),
  }),
});

// Схема для получения всех активных блокировок
export const getAllActiveBlocksSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Номер страницы должен быть числом')
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/, 'Лимит должен быть числом')
      .optional()
      .default('20'),
  }),
});
