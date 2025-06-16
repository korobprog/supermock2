import { Router } from 'express';
import {
  // TimeSlot controllers
  createTimeSlot,
  getTimeSlots,
  updateTimeSlot,
  deleteTimeSlot,
  getTimeSlotById,
} from '../controllers/timeslot.controller';
import {
  // Booking controllers
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  confirmBooking,
  getInterviewerBookings,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTimeSlotSchema,
  updateTimeSlotSchema,
  createBookingSchema,
  cancelBookingSchema,
  getTimeSlotsParamsSchema,
  getBookingsParamsSchema,
  timeSlotIdParamSchema,
  bookingIdParamSchema,
} from '../schemas/booking.schema';
import { z } from 'zod';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// ===== TIMESLOT ROUTES =====

// GET /api/timeslots - получить список временных слотов
router.get(
  '/timeslots',
  validate(z.object({ query: getTimeSlotsParamsSchema })),
  getTimeSlots
);

// GET /api/timeslots/:id - получить конкретный временной слот
router.get(
  '/timeslots/:id',
  validate(z.object({ params: timeSlotIdParamSchema })),
  getTimeSlotById
);

// POST /api/timeslots - создать новый временной слот
router.post(
  '/timeslots',
  validate(z.object({ body: createTimeSlotSchema })),
  createTimeSlot
);

// PATCH /api/timeslots/:id - обновить временной слот
router.patch(
  '/timeslots/:id',
  validate(
    z.object({
      params: timeSlotIdParamSchema,
      body: updateTimeSlotSchema,
    })
  ),
  updateTimeSlot
);

// DELETE /api/timeslots/:id - удалить временной слот
router.delete(
  '/timeslots/:id',
  validate(z.object({ params: timeSlotIdParamSchema })),
  deleteTimeSlot
);

// ===== BOOKING ROUTES =====

// GET /api/bookings - получить список бронирований пользователя
router.get(
  '/bookings',
  validate(z.object({ query: getBookingsParamsSchema })),
  getBookings
);

// GET /api/bookings/interviewer - получить список бронирований интервьюера
router.get(
  '/bookings/interviewer',
  validate(z.object({ query: getBookingsParamsSchema })),
  getInterviewerBookings
);

// GET /api/bookings/:id - получить конкретное бронирование
router.get(
  '/bookings/:id',
  validate(z.object({ params: bookingIdParamSchema })),
  getBookingById
);

// POST /api/bookings - создать новое бронирование
router.post(
  '/bookings',
  validate(z.object({ body: createBookingSchema })),
  createBooking
);

// PATCH /api/bookings/:id/cancel - отменить бронирование
router.patch(
  '/bookings/:id/cancel',
  validate(
    z.object({
      params: bookingIdParamSchema,
      body: cancelBookingSchema,
    })
  ),
  cancelBooking
);

// PATCH /api/bookings/:id/confirm - подтвердить бронирование (для интервьюера)
router.patch(
  '/bookings/:id/confirm',
  validate(z.object({ params: bookingIdParamSchema })),
  confirmBooking
);

export default router;
