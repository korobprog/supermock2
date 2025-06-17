"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingIdParamSchema = exports.timeSlotIdParamSchema = exports.getBookingsParamsSchema = exports.getTimeSlotsParamsSchema = exports.cancelBookingSchema = exports.createBookingSchema = exports.updateTimeSlotSchema = exports.createTimeSlotSchema = exports.NotificationTypeEnum = exports.BookingStatusEnum = exports.SlotStatusEnum = void 0;
const zod_1 = require("zod");
// Enum для статуса временного слота
exports.SlotStatusEnum = zod_1.z.enum(['AVAILABLE', 'BOOKED', 'CANCELLED']);
// Enum для статуса бронирования
exports.BookingStatusEnum = zod_1.z.enum([
    'CREATED',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED',
]);
// Enum для типа уведомления
exports.NotificationTypeEnum = zod_1.z.enum([
    'CREATION',
    'CONFIRMATION',
    'CANCELLATION',
    'REMINDER',
]);
// 1. Схема для создания временного слота
exports.createTimeSlotSchema = zod_1.z
    .object({
    startTime: zod_1.z.string().datetime('Неверный формат даты и времени начала'),
    endTime: zod_1.z.string().datetime('Неверный формат даты и времени окончания'),
    specialization: zod_1.z
        .string()
        .min(2, 'Специализация должна содержать минимум 2 символа'),
})
    .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'Время окончания должно быть позже времени начала',
    path: ['endTime'],
});
// 2. Схема для обновления временного слота
exports.updateTimeSlotSchema = zod_1.z
    .object({
    startTime: zod_1.z
        .string()
        .datetime('Неверный формат даты и времени начала')
        .optional(),
    endTime: zod_1.z
        .string()
        .datetime('Неверный формат даты и времени окончания')
        .optional(),
    specialization: zod_1.z
        .string()
        .min(2, 'Специализация должна содержать минимум 2 символа')
        .optional(),
    status: exports.SlotStatusEnum.optional(),
})
    .refine((data) => {
    if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
}, {
    message: 'Время окончания должно быть позже времени начала',
    path: ['endTime'],
});
// 3. Схема для создания бронирования
exports.createBookingSchema = zod_1.z.object({
    slotId: zod_1.z.string().uuid('Неверный формат UUID временного слота'),
});
// 4. Схема для отмены бронирования
exports.cancelBookingSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
});
// 5. Схема для получения списка временных слотов
exports.getTimeSlotsParamsSchema = zod_1.z.object({
    specialization: zod_1.z.string().optional(),
    status: exports.SlotStatusEnum.optional(),
    startDate: zod_1.z
        .string()
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        // Принимаем как ISO datetime, так и простую дату YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        return (dateRegex.test(val) ||
            datetimeRegex.test(val) ||
            !isNaN(Date.parse(val)));
    }, 'Неверный формат даты начала'),
    endDate: zod_1.z
        .string()
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        // Принимаем как ISO datetime, так и простую дату YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        return (dateRegex.test(val) ||
            datetimeRegex.test(val) ||
            !isNaN(Date.parse(val)));
    }, 'Неверный формат даты окончания'),
    interviewerId: zod_1.z.string().uuid('Неверный формат UUID интервьюера').optional(),
});
// 6. Схема для получения списка бронирований
exports.getBookingsParamsSchema = zod_1.z.object({
    status: exports.BookingStatusEnum.optional(),
    specialization: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime('Неверный формат даты начала').optional(),
    endDate: zod_1.z.string().datetime('Неверный формат даты окончания').optional(),
});
// Параметры для ID
exports.timeSlotIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Неверный формат UUID временного слота'),
});
exports.bookingIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Неверный формат UUID бронирования'),
});
