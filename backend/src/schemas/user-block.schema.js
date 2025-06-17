"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllActiveBlocksSchema = exports.getUserBlocksSchema = exports.unblockUserSchema = exports.blockUserSchema = void 0;
const zod_1 = require("zod");
// Схема для блокировки пользователя
exports.blockUserSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        userId: zod_1.z.string().uuid('ID пользователя должен быть валидным UUID'),
        reason: zod_1.z
            .string()
            .min(1, 'Причина блокировки обязательна')
            .max(500, 'Причина блокировки не может быть длиннее 500 символов'),
        isPermanent: zod_1.z.boolean().optional().default(false),
        endDate: zod_1.z
            .string()
            .datetime('Дата окончания должна быть в формате ISO')
            .optional(),
    })
        .refine((data) => {
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
    }, {
        message: 'Для временной блокировки необходимо указать дату окончания в будущем, для постоянной - не указывать',
    }),
});
// Схема для разблокировки пользователя
exports.unblockUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('ID блокировки должен быть валидным UUID'),
    }),
});
// Схема для получения блокировок пользователя
exports.getUserBlocksSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().uuid('ID пользователя должен быть валидным UUID'),
    }),
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .regex(/^\d+$/, 'Номер страницы должен быть числом')
            .optional()
            .default('1'),
        limit: zod_1.z
            .string()
            .regex(/^\d+$/, 'Лимит должен быть числом')
            .optional()
            .default('20'),
    }),
});
// Схема для получения всех активных блокировок
exports.getAllActiveBlocksSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .regex(/^\d+$/, 'Номер страницы должен быть числом')
            .optional()
            .default('1'),
        limit: zod_1.z
            .string()
            .regex(/^\d+$/, 'Лимит должен быть числом')
            .optional()
            .default('20'),
    }),
});
