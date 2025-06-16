import { z } from 'zod';

// Enum для статуса временного слота
export const SlotStatusEnum = z.enum(['AVAILABLE', 'BOOKED', 'CANCELLED']);

// Enum для статуса бронирования
export const BookingStatusEnum = z.enum([
  'CREATED',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
]);

// Enum для типа уведомления
export const NotificationTypeEnum = z.enum([
  'CREATION',
  'CONFIRMATION',
  'CANCELLATION',
  'REMINDER',
]);

// 1. Схема для создания временного слота
export const createTimeSlotSchema = z
  .object({
    startTime: z.string().datetime('Неверный формат даты и времени начала'),
    endTime: z.string().datetime('Неверный формат даты и времени окончания'),
    specialization: z
      .string()
      .min(2, 'Специализация должна содержать минимум 2 символа'),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'Время окончания должно быть позже времени начала',
    path: ['endTime'],
  });

// 2. Схема для обновления временного слота
export const updateTimeSlotSchema = z
  .object({
    startTime: z
      .string()
      .datetime('Неверный формат даты и времени начала')
      .optional(),
    endTime: z
      .string()
      .datetime('Неверный формат даты и времени окончания')
      .optional(),
    specialization: z
      .string()
      .min(2, 'Специализация должна содержать минимум 2 символа')
      .optional(),
    status: SlotStatusEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: 'Время окончания должно быть позже времени начала',
      path: ['endTime'],
    }
  );

// 3. Схема для создания бронирования
export const createBookingSchema = z.object({
  slotId: z.string().uuid('Неверный формат UUID временного слота'),
});

// 4. Схема для отмены бронирования
export const cancelBookingSchema = z.object({
  reason: z.string().optional(),
});

// 5. Схема для получения списка временных слотов
export const getTimeSlotsParamsSchema = z.object({
  specialization: z.string().optional(),
  status: SlotStatusEnum.optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      // Принимаем как ISO datetime, так и простую дату YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      return (
        dateRegex.test(val) ||
        datetimeRegex.test(val) ||
        !isNaN(Date.parse(val))
      );
    }, 'Неверный формат даты начала'),
  endDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      // Принимаем как ISO datetime, так и простую дату YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      return (
        dateRegex.test(val) ||
        datetimeRegex.test(val) ||
        !isNaN(Date.parse(val))
      );
    }, 'Неверный формат даты окончания'),
  interviewerId: z.string().uuid('Неверный формат UUID интервьюера').optional(),
});

// 6. Схема для получения списка бронирований
export const getBookingsParamsSchema = z.object({
  status: BookingStatusEnum.optional(),
  specialization: z.string().optional(),
  startDate: z.string().datetime('Неверный формат даты начала').optional(),
  endDate: z.string().datetime('Неверный формат даты окончания').optional(),
});

// Параметры для ID
export const timeSlotIdParamSchema = z.object({
  id: z.string().uuid('Неверный формат UUID временного слота'),
});

export const bookingIdParamSchema = z.object({
  id: z.string().uuid('Неверный формат UUID бронирования'),
});

// Экспорт типов для использования в контроллерах
export type CreateTimeSlotData = z.infer<typeof createTimeSlotSchema>;
export type UpdateTimeSlotData = z.infer<typeof updateTimeSlotSchema>;
export type CreateBookingData = z.infer<typeof createBookingSchema>;
export type CancelBookingData = z.infer<typeof cancelBookingSchema>;
export type GetTimeSlotsParams = z.infer<typeof getTimeSlotsParamsSchema>;
export type GetBookingsParams = z.infer<typeof getBookingsParamsSchema>;
export type TimeSlotIdParam = z.infer<typeof timeSlotIdParamSchema>;
export type BookingIdParam = z.infer<typeof bookingIdParamSchema>;
